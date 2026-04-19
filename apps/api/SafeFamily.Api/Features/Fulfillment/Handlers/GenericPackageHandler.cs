using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Checklists;
using SafeFamily.Api.Domain.Reports;
using SafeFamily.Api.Features.Tasks.Generation;

namespace SafeFamily.Api.Features.Fulfillment.Handlers;

/// <summary>
/// Fallback fulfillment handler used when no specific handler matches the package code.
///
/// Creates a generic report placeholder and a single starter checklist item.
/// </summary>
public sealed class GenericPackageHandler(AppDbContext db) : IPackageFulfillmentHandler
{
    public Task<TaskGenerationResult?> PrepareAsync(FulfillmentContext context, CancellationToken ct = default)
    {
        var booking = context.Booking;

        db.Reports.Add(new Report
        {
            FamilyId    = booking.FamilyId,
            BookingId   = booking.Id,
            ReportType  = ReportType.General,
            Title       = "Your Safety Package — Confirmation",
            Description = "Thank you for booking with SafeFamily. " +
                          "Your advisor will review your details and be in touch with your personalised guidance shortly.",
            FileUrl     = null,
            GeneratedAt = DateTimeOffset.UtcNow,
        });

        var sourceId = $"generic:{booking.Id}:1";
        if (!context.ExistingChecklistSourceIds.Contains(sourceId))
        {
            db.ChecklistItems.Add(new ChecklistItem
            {
                FamilyId        = booking.FamilyId,
                Title           = "Complete your family safety profile",
                Description     = "Ensure all family members are added and your most recent devices and accounts are listed. " +
                                  "A complete profile lets your advisor prepare the most relevant guidance for your family.",
                Category        = ChecklistCategory.General,
                Status          = ChecklistItemStatus.Pending,
                Priority        = 2,
                Phase           = SafeTaskPhase.Next30Days,
                SourceType      = ChecklistSourceType.Manual,
                SourceId        = sourceId,
                SourceBookingId = booking.Id,
                IsPremium       = false,
            });
        }

        return Task.FromResult<TaskGenerationResult?>(null);
    }
}
