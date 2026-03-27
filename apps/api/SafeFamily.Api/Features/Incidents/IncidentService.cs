using Microsoft.EntityFrameworkCore;
using SafeFamily.Api.Common.Exceptions;
using SafeFamily.Api.Data;
using SafeFamily.Api.Domain.Incidents;
using SafeFamily.Api.Features.Incidents.Dtos;

namespace SafeFamily.Api.Features.Incidents;

public class IncidentService : IIncidentService
{
    private readonly AppDbContext _db;

    public IncidentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<IncidentResponse>> GetIncidentsAsync(Guid userId, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        return await _db.Incidents
            .Where(i => i.FamilyId == familyId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => ToResponse(i))
            .ToListAsync(ct);
    }

    public async Task<IncidentResponse?> GetIncidentByIdAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var incident = await _db.Incidents
            .FirstOrDefaultAsync(i => i.Id == id && i.FamilyId == familyId, ct);

        return incident is null ? null : ToResponse(incident);
    }

    public async Task<IncidentResponse> CreateIncidentAsync(Guid userId, CreateIncidentRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var incident = new Incident
        {
            FamilyId        = familyId,
            Type            = request.Type,
            Severity        = request.Severity,
            Summary         = request.Summary.Trim(),
            FirstActionPlan = BuildActionPlan(request.Type, request.Severity),
            CreatedById     = userId,
            UpdatedById     = userId,
        };

        _db.Incidents.Add(incident);
        await _db.SaveChangesAsync(ct);

        return ToResponse(incident);
    }

    public async Task<IncidentResponse?> UpdateIncidentStatusAsync(Guid userId, Guid id, UpdateIncidentStatusRequest request, CancellationToken ct = default)
    {
        var familyId = await RequireFamilyIdAsync(userId, ct);

        var incident = await _db.Incidents
            .FirstOrDefaultAsync(i => i.Id == id && i.FamilyId == familyId, ct);

        if (incident is null)
            return null;

        incident.Status     = request.Status;
        incident.UpdatedById = userId;

        await _db.SaveChangesAsync(ct);

        return ToResponse(incident);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid> RequireFamilyIdAsync(Guid userId, CancellationToken ct)
    {
        var familyId = await _db.FamilyMembers
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.FamilyId)
            .FirstOrDefaultAsync(ct);

        if (familyId is null)
            throw new ForbiddenException("You must be part of a family to report or view incidents.");

        return familyId.Value;
    }

    /// <summary>
    /// Returns a simple, contextual first-action plan based on incident type and severity.
    /// </summary>
    private static string BuildActionPlan(IncidentType type, IncidentSeverity severity)
    {
        var urgencyPrefix = severity switch
        {
            IncidentSeverity.Critical => "🚨 URGENT — Act within the next hour. ",
            IncidentSeverity.High     => "⚠️ Act today. ",
            IncidentSeverity.Medium   => "📋 Act within the next few days. ",
            _                         => "✅ When you have time. ",
        };

        var plan = type switch
        {
            IncidentType.PhishingAttempt =>
                "Do not click any links in the suspicious message. Report it to your email provider and delete it. If you clicked a link, change the password on the affected account immediately and enable 2FA.",

            IncidentType.PasswordCompromise =>
                "Change the compromised password immediately. Check if the same password was used on other accounts and change those too. Enable two-factor authentication on affected accounts. Review recent account activity for unauthorised actions.",

            IncidentType.DeviceLostOrStolen =>
                "Remotely lock or wipe the device using Find My Device / Find My iPhone. Change passwords for all accounts accessible from the device. Notify your carrier to block the SIM. File a police report if the device was stolen.",

            IncidentType.UnauthorisedAccess =>
                "Change the account password immediately. Enable two-factor authentication if not already active. Review recent account activity and revoke any unknown active sessions. Alert your bank or service provider if financial accounts are involved.",

            IncidentType.DataBreach =>
                "Change passwords on the affected service and any accounts that share the same password. Enable 2FA. Monitor your credit report and bank statements. Consider placing a fraud alert with credit bureaus if financial data was exposed.",

            IncidentType.MalwareInfection =>
                "Disconnect the infected device from the internet immediately. Run a full scan with trusted antivirus software. Do not use the device for financial transactions until cleared. Change passwords for accounts accessed from the infected device.",

            IncidentType.ScamOrFraud =>
                "Do not send any further funds or information. Contact your bank immediately if money was transferred. Report the scam to local authorities and consumer protection agencies. Document all communications with the scammer.",

            IncidentType.IdentityTheft =>
                "Place a fraud alert or credit freeze with all three major credit bureaus. Report the identity theft to your local police. Notify affected service providers (banks, government agencies). Review and document all fraudulent activity for your records.",

            IncidentType.SocialEngineering =>
                "Do not provide any further personal information. Report the attempt to the organisation being impersonated. Warn family members about the tactic. If any credentials were shared, change them immediately.",

            _ =>
                "Document the incident in detail. Change passwords on any potentially affected accounts, enable 2FA, and review recent account activity. Consider consulting a cybersecurity professional if the impact is unclear.",
        };

        return urgencyPrefix + plan;
    }

    private static IncidentResponse ToResponse(Incident i) =>
        new(i.Id, i.FamilyId, i.Type, i.Severity, i.Status, i.Summary, i.FirstActionPlan, i.CreatedAt, i.UpdatedAt);
}
