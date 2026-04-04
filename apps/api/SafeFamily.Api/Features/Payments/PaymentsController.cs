using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SafeFamily.Api.Common.Services;
using SafeFamily.Api.Features.Bookings.Dtos;
using SafeFamily.Api.Features.Payments.Dtos;

namespace SafeFamily.Api.Features.Payments;

[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IPaymentWebhookService _webhookService;
    private readonly IAuditLogService _audit;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentService paymentService,
        IPaymentWebhookService webhookService,
        IAuditLogService audit,
        ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _webhookService = webhookService;
        _audit          = audit;
        _logger         = logger;
    }

    // ── Initiate payment ───────────────────────────────────────────────────────
    // POST /api/bookings/{bookingId}/payment/initiate
    [HttpPost("api/bookings/{bookingId:guid}/payment/initiate")]
    [Authorize]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(PaymentInitiateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> InitiatePayment(Guid bookingId, CancellationToken ct)
    {
        var userId   = GetUserId();
        var response = await _paymentService.InitiatePaymentAsync(userId, bookingId, ct);
        await _audit.LogAsync("PaymentInitiated", userId,
            entityType: "PaymentOrder", entityId: response.PaymentOrderId,
            details: $"BookingId={bookingId} Provider={response.GatewayProvider} Amount={response.Amount} {response.Currency}",
            ct: ct);
        return Ok(response);
    }

    // ── Retry payment ──────────────────────────────────────────────────────────
    // POST /api/bookings/{bookingId}/payment/retry
    [HttpPost("api/bookings/{bookingId:guid}/payment/retry")]
    [Authorize]
    [EnableRateLimiting("mutations")]
    [ProducesResponseType(typeof(PaymentInitiateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RetryPayment(Guid bookingId, CancellationToken ct)
    {
        var userId   = GetUserId();
        var response = await _paymentService.RetryPaymentAsync(userId, bookingId, ct);
        await _audit.LogAsync("PaymentRetried", userId,
            entityType: "PaymentOrder", entityId: response.PaymentOrderId,
            details: $"BookingId={bookingId} Provider={response.GatewayProvider}",
            ct: ct);
        return Ok(response);
    }

    // ── List payment orders ───────────────────────────────────────────────────
    // GET /api/bookings/{bookingId}/payments
    [HttpGet("api/bookings/{bookingId:guid}/payments")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<PaymentOrderResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPaymentOrders(Guid bookingId, CancellationToken ct)
    {
        var orders = await _paymentService.GetPaymentOrdersAsync(GetUserId(), bookingId, ct);
        return Ok(orders);
    }

    // ── Webhook receiver ──────────────────────────────────────────────────────
    // POST /api/webhooks/payment/{provider}
    //
    // This endpoint is intentionally [AllowAnonymous] — it is called by the payment
    // gateway server, not by an authenticated user. Security is enforced by
    // IPaymentGateway.VerifySignature (HMAC-SHA256 per provider).
    //
    // The raw body is read BEFORE any framework model binding so the signature
    // can be verified against the exact original bytes.
    [HttpPost("api/webhooks/payment/{provider}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PaymentWebhook(string provider, CancellationToken ct)
    {
        // EnableBuffering allows the body to be read more than once (e.g. for logging)
        // without consuming the stream so framework infrastructure still works.
        Request.EnableBuffering();

        string rawBody;
        using (var reader = new StreamReader(
            Request.Body, Encoding.UTF8,
            detectEncodingFromByteOrderMarks: false,
            leaveOpen: true))
        {
            rawBody = await reader.ReadToEndAsync(ct);
        }
        // Rewind for any downstream framework middleware that may still need the body.
        Request.Body.Position = 0;

        _logger.LogInformation(
            "Payment webhook received. Provider={Provider} ContentLength={Length}.",
            provider, rawBody.Length);

        var processed = await _webhookService.HandleAsync(provider, Request.Headers, rawBody, ct);

        if (!processed)
            return BadRequest(new { received = false, error = "Signature verification failed or unknown provider." });

        // Always return 200 quickly — gateways retry on non-2xx and we've already persisted.
        return Ok(new { received = true });
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
