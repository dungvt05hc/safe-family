using SafeFamily.Api.Domain.Accounts;
using SafeFamily.Api.Domain.Bookings;
using SafeFamily.Api.Domain.Devices;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Domain.Tasks;
using SafeFamily.Api.Features.Fulfillment;
using SafeFamily.Api.Features.Tasks.Generation;
using Xunit;

namespace SafeFamily.Tests.Features.Tasks;

/// <summary>
/// Unit tests for IncidentRecoveryPackTaskRules.SelectSpecs().
/// Covers: phase structure, guidance title prefix, severity promotion,
/// unknown incident type fallback, and supplementary entity tasks.
/// </summary>
public class IncidentRecoveryPackTaskRulesTests
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private static FulfillmentContext MakeContext(
        Guid familyId,
        Incident? incident = null,
        IReadOnlyList<Account>? accounts = null,
        IReadOnlyList<Device>? devices = null)
        => new(
            Booking:                   new Booking { FamilyId = familyId },
            LatestAssessment:          null,
            FamilyPersons:             [],
            LinkedIncident:            incident,
            ExistingChecklistSourceIds: [],
            Accounts:                  accounts ?? [],
            Devices:                   devices  ?? []);

    private static Incident MakeIncident(IncidentType type, IncidentSeverity severity = IncidentSeverity.Low) => new()
    {
        FamilyId = Guid.NewGuid(),
        Type     = type,
        Severity = severity,
        Summary  = "Test incident",
    };

    // ── Phase structure tests ─────────────────────────────────────────────────

    [Fact]
    public void SelectSpecs_PhishingAttempt_ContainsTasksInAllFourPhases()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var incident  = MakeIncident(IncidentType.PhishingAttempt);
        var context   = MakeContext(familyId, incident: incident);

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        // Phase 2: Guidance tasks are also Immediate phase but with Low priority
        Assert.Contains(specs, s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.High);
        Assert.Contains(specs, s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Low);
        Assert.Contains(specs, s => s.Phase == TaskPhase.Next7Days);
    }

    [Fact]
    public void SelectSpecs_PhishingAttempt_ImmediatePhaseTasksHaveSortOrder1To9()
    {
        // Immediate actions start at sort order 1
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PhishingAttempt));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var immediateHighSpecs = specs
            .Where(s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.High && s.SortOrder < 10)
            .ToList();

        Assert.NotEmpty(immediateHighSpecs);
        Assert.All(immediateHighSpecs, s => Assert.InRange(s.SortOrder, 1, 9));
    }

    [Fact]
    public void SelectSpecs_PhishingAttempt_GuidanceTasksSortFrom10()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PhishingAttempt));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        // Guidance = Immediate phase + Low priority, sort 10+
        var guidanceSpecs = specs
            .Where(s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Low)
            .ToList();

        Assert.NotEmpty(guidanceSpecs);
        Assert.All(guidanceSpecs, s => Assert.InRange(s.SortOrder, 10, 19));
    }

    [Fact]
    public void SelectSpecs_PhishingAttempt_ShortTermTasksSortFrom20()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PhishingAttempt));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var shortTermSpecs = specs
            .Where(s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Medium && s.SortOrder >= 20)
            .ToList();

        Assert.All(shortTermSpecs, s => Assert.InRange(s.SortOrder, 20, 29));
    }

    [Fact]
    public void SelectSpecs_LongTermTasks_AllHaveNext7DaysPhase()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PasswordCompromise));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var longTermSpecs = specs.Where(s => s.SortOrder >= 30 && s.SortOrder < 50).ToList();
        Assert.NotEmpty(longTermSpecs);
        Assert.All(longTermSpecs, s => Assert.Equal(TaskPhase.Next7Days, s.Phase));
    }

    // ── Guidance title prefix test ────────────────────────────────────────────

    [Fact]
    public void SelectSpecs_GuidanceTasks_AllTitlesStartWithAvoidPrefix()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PhishingAttempt));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var guidanceSpecs = specs
            .Where(s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Low)
            .ToList();

        Assert.All(guidanceSpecs, s => Assert.StartsWith("⚠ Avoid:", s.Title));
    }

    [Theory]
    [InlineData(IncidentType.PasswordCompromise)]
    [InlineData(IncidentType.DeviceLostOrStolen)]
    [InlineData(IncidentType.DataBreach)]
    [InlineData(IncidentType.ScamOrFraud)]
    public void SelectSpecs_AllTemplates_GuidanceTitlesStartWithAvoidPrefix(IncidentType type)
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(type));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var guidanceSpecs = specs
            .Where(s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Low)
            .ToList();

        Assert.All(guidanceSpecs, s => Assert.StartsWith("⚠ Avoid:", s.Title));
    }

    // ── Severity escalation tests ─────────────────────────────────────────────

    [Fact]
    public void SelectSpecs_LowSeverityIncident_ShortTermTasksAreMediumPriority()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId,
            incident: MakeIncident(IncidentType.PhishingAttempt, IncidentSeverity.Low));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        // Short-term tasks are sort 20-29
        var shortTermSpecs = specs.Where(s => s.SortOrder >= 20 && s.SortOrder < 30).ToList();
        Assert.All(shortTermSpecs, s => Assert.Equal(TaskPriority.Medium, s.Priority));
    }

    [Fact]
    public void SelectSpecs_HighSeverityIncident_PromotesShortTermTasksToHighPriority()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId,
            incident: MakeIncident(IncidentType.PhishingAttempt, IncidentSeverity.High));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var shortTermSpecs = specs.Where(s => s.SortOrder >= 20 && s.SortOrder < 30).ToList();
        Assert.NotEmpty(shortTermSpecs);
        Assert.All(shortTermSpecs, s => Assert.Equal(TaskPriority.High, s.Priority));
    }

    [Fact]
    public void SelectSpecs_CriticalSeverityIncident_PromotesShortTermTasksToHighPriority()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId,
            incident: MakeIncident(IncidentType.DataBreach, IncidentSeverity.Critical));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var shortTermSpecs = specs.Where(s => s.SortOrder >= 20 && s.SortOrder < 30).ToList();
        Assert.All(shortTermSpecs, s => Assert.Equal(TaskPriority.High, s.Priority));
    }

    // ── Generic fallback tests ────────────────────────────────────────────────

    [Fact]
    public void SelectSpecs_OtherIncidentType_UsesGenericFallbackTemplate()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.Other));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        // Generic template must still produce all four phases
        Assert.Contains(specs, s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.High);
        Assert.Contains(specs, s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Low);
        Assert.Contains(specs, s => s.Phase == TaskPhase.Next7Days);
    }

    [Fact]
    public void SelectSpecs_NullIncident_UsesGenericFallbackTemplate()
    {
        // No linked incident → generic template
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: null);

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        Assert.NotEmpty(specs);
        Assert.Contains(specs, s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.High);
    }

    [Fact]
    public void SelectSpecs_OtherIncidentType_GuidanceTitlesStartWithAvoidPrefix()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.Other));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var guidanceSpecs = specs
            .Where(s => s.Phase == TaskPhase.Immediate && s.Priority == TaskPriority.Low)
            .ToList();

        Assert.All(guidanceSpecs, s => Assert.StartsWith("⚠ Avoid:", s.Title));
    }

    // ── Supplementary entity task tests ──────────────────────────────────────

    [Fact]
    public void SelectSpecs_AccountWithSuspiciousActivity_EmitsAccountSignOutTask()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var account   = new Account
        {
            FamilyId               = familyId,
            AccountType            = AccountType.Email,
            TwoFactorStatus        = TwoFactorStatus.Enabled,
            SuspiciousActivityFlag = true,
            MaskedIdentifier       = "sus@example.com",
        };

        var context = MakeContext(familyId,
            incident: MakeIncident(IncidentType.PhishingAttempt),
            accounts: [account]);

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        var signOutKey = GenerationKeyStrategy.AccountSignOutAllSessions(account.Id);
        Assert.Contains(specs, s => s.GenerationKey == signOutKey);
    }

    [Fact]
    public void SelectSpecs_DeviceLostOrStolen_EmitsRemoteWipeTaskPerDevice()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var device    = new Device { FamilyId = familyId, ScreenLockEnabled = true, BackupEnabled = true };

        var context = MakeContext(familyId,
            incident: MakeIncident(IncidentType.DeviceLostOrStolen),
            devices: [device]);

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        // Should have a remote wipe task for the device
        Assert.Contains(specs, s => s.TargetId == device.Id
                                 && s.Title.Contains("wipe", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void SelectSpecs_MalwareInfection_EmitsNetworkIsolationTaskPerDevice()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var device    = new Device { FamilyId = familyId, ScreenLockEnabled = true, BackupEnabled = true };

        var context = MakeContext(familyId,
            incident: MakeIncident(IncidentType.MalwareInfection),
            devices: [device]);

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        Assert.Contains(specs, s => s.TargetId == device.Id
                                 && s.Title.Contains("Isolate", StringComparison.OrdinalIgnoreCase));
    }

    // ── SourceType & FamilyId propagation ────────────────────────────────────

    [Fact]
    public void SelectSpecs_AllTemplateSpecs_SourceTypeIsIncidentRecoveryPack()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PhishingAttempt));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        Assert.All(specs, s => Assert.Equal(TaskSourceType.IncidentRecoveryPack, s.SourceType));
    }

    [Fact]
    public void SelectSpecs_AllSpecs_CarryCorrectFamilyId()
    {
        var familyId  = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        var context   = MakeContext(familyId, incident: MakeIncident(IncidentType.PhishingAttempt));

        var specs = IncidentRecoveryPackTaskRules.SelectSpecs(context, bookingId);

        Assert.All(specs, s => Assert.Equal(familyId, s.FamilyId));
    }
}
