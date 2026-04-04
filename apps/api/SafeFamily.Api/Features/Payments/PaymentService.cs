using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Features.Bookings.Dtos;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments;

public sealed class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;
    private readonly IEnumerable<IPaymentGateway> _gateways;
    private readonly PaymentSettings _settings;

    public PaymentService(
        AppDbContext db,
        IEnumerable<IPaymentGateway> gateways,
        IOptions<PaymentSettings> settings)
    {
        _db       = db;
        _gateways = gateways;
        _settings = settings.Value;
    }

    // ── Initiate ──────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<PaymentInitiateResponse> InitiatePaymentAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var booking = await LoadBookingWithOrdersAsync(bookingId, familyId, ct);

        if (booking.Status != BookingStatus.Submitted)
            throw new BadRequestException(
                $"Payment can only be initiated for Submitted bookings. Current status: {booking.Status}.");

        // Find the Unpaid order created by SubmitBookingAsync.
        var order = booking.PaymentOrders
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefault(o => o.Status == PaymentStatus.Unpaid);

        if (order is null)
            throw new BadRequestException(
                "No pending payment order found. If the previous order failed, use the retry endpoint.");

        var gateway = ResolveGateway(_settings.DefaultProvider);
        return await ExecuteGatewayInitiationAsync(gateway, booking, order, userId, ct);
    }

    // ── Retry ─────────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<PaymentInitiateResponse> RetryPaymentAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var booking = await LoadBookingWithOrdersAsync(bookingId, familyId, ct);

        if (booking.Status != BookingStatus.Submitted)
            throw new BadRequestException(
                $"Payment retry is only available for Submitted bookings. Current status: {booking.Status}.");

        var latestOrder = booking.PaymentOrders
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefault();

        if (latestOrder is null
            || (latestOrder.Status != PaymentStatus.Failed
                && latestOrder.Status != PaymentStatus.Expired))
        {
            throw new BadRequestException(
                "Payment can only be retried after the previous order has failed or expired.");
        }

        // Create a fresh PaymentOrder — the previous one is preserved for audit.
        var newOrder = new PaymentOrder
        {
            BookingId = booking.Id,
            Amount    = booking.SnapshotPrice,
            Currency  = booking.SnapshotCurrency,
            Status    = PaymentStatus.Unpaid,
        };
        _db.PaymentOrders.Add(newOrder);

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = "PaymentRetried",
            FromValue   = latestOrder.Status.ToString(),
            ToValue     = PaymentStatus.Unpaid.ToString(),
            Description = $"Family initiated a payment retry. Previous order {latestOrder.Id} was {latestOrder.Status}.",
            ActorId     = userId,
        });

        var gateway = ResolveGateway(_settings.DefaultProvider);
        return await ExecuteGatewayInitiationAsync(gateway, booking, newOrder, userId, ct);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<IReadOnlyList<PaymentOrderResponse>> GetPaymentOrdersAsync(
        Guid userId, Guid bookingId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var bookingExists = await _db.Bookings
            .AnyAsync(b => b.Id == bookingId && b.FamilyId == familyId, ct);
        if (!bookingExists)
            throw new NotFoundException("Booking", bookingId);

        return await _db.PaymentOrders
            .Where(o => o.BookingId == bookingId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new PaymentOrderResponse(
                o.Id, o.BookingId, o.Amount, o.Currency, o.Status,
                o.GatewayProvider, o.GatewayOrderId,
                o.PaymentUrl, o.QrCodeUrl,
                o.PaidAt, o.ExpiresAt, o.RefundedAt, o.RefundedAmount,
                o.CreatedAt))
            .ToListAsync(ct);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /// <summary>
    /// Calls the gateway to open a payment session, updates the PaymentOrder and Booking
    /// with the gateway response, appends a BookingEvent, and persists everything atomically.
    /// </summary>
    private async Task<PaymentInitiateResponse> ExecuteGatewayInitiationAsync(
        IPaymentGateway gateway,
        Booking booking,
        PaymentOrder order,
        Guid actorId,
        CancellationToken ct)
    {
        // Call gateway — if this throws, no DB state has been modified yet.
        var result = await gateway.InitiateAsync(order, booking, ct);

        // Update PaymentOrder
        order.Status          = PaymentStatus.Pending;
        order.GatewayProvider = gateway.Provider;
        order.GatewayOrderId  = result.GatewayOrderId;
        order.ExpiresAt       = result.ExpiresAt;
        order.PaymentUrl      = result.PaymentUrl;
        order.QrCodeUrl       = result.QrCodeUrl;

        // Denormalise onto Booking
        booking.PaymentStatus = PaymentStatus.Pending;
        booking.ExpiresAt     = result.ExpiresAt;

        _db.BookingEvents.Add(new BookingEvent
        {
            BookingId   = booking.Id,
            EventType   = "PaymentInitiated",
            FromValue   = PaymentStatus.Unpaid.ToString(),
            ToValue     = PaymentStatus.Pending.ToString(),
            Description = $"Payment session opened. Provider: {gateway.Provider}. " +
                          $"GatewayOrderId: {result.GatewayOrderId}. Expires: {result.ExpiresAt:O}.",
            ActorId     = actorId,
        });

        await _db.SaveChangesAsync(ct);

        return new PaymentInitiateResponse(
            order.Id,
            booking.Id,
            result.PaymentUrl,
            result.QrCodeUrl,
            result.ExpiresAt,
            gateway.Provider,
            order.Amount,
            order.Currency);
    }

    private IPaymentGateway ResolveGateway(string provider)
    {
        var gateway = _gateways.FirstOrDefault(g =>
            string.Equals(g.Provider, provider, StringComparison.OrdinalIgnoreCase));

        if (gateway is null)
            throw new InvalidOperationException(
                $"No IPaymentGateway registered for provider '{provider}'. " +
                $"Check PaymentSettings:DefaultProvider and DI registration.");

        return gateway;
    }

    private async Task<Booking> LoadBookingWithOrdersAsync(
        Guid bookingId, Guid familyId, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.PaymentOrders.OrderByDescending(o => o.CreatedAt))
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.FamilyId == familyId, ct);

        return booking ?? throw new NotFoundException("Booking", bookingId);
    }

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to manage payments.");

        return familyId.Value;
    }
}
