namespace SafeFamily.Api.Features.Tasks.Generation;

/// <summary>
/// Produces canonical, deterministic generation keys for safety tasks.
///
/// <para>
/// <b>Why generation keys matter</b><br/>
/// Every generated task carries a <c>GenerationKey</c> that uniquely identifies the
/// <em>rule + target combination</em> that produced it.  When the generation engine
/// receives a <see cref="TaskGenerationSpec"/>, it looks up whether a task with that
/// key already exists for the family.  This makes generation fully <em>idempotent</em> —
/// safe to call on every fulfillment, reconciliation job, or admin re-trigger without
/// producing duplicate tasks.
/// </para>
///
/// <para>
/// <b>Key format convention</b><br/>
/// <c>task:{domain}:{rule}:{entityId}</c>
/// </para>
///
/// <para>
/// <b>Examples</b>
/// <list type="bullet">
///   <item><c>task:account:enable_2fa:3fa85f64-5717-4562-b3fc-2c963f66afa6</c></item>
///   <item><c>task:device:enable_backup:3fa85f64-5717-4562-b3fc-2c963f66afa6</c></item>
///   <item><c>task:incident:sign_out_sessions:3fa85f64-5717-4562-b3fc-2c963f66afa6</c></item>
///   <item><c>task:booking:free_check:3fa85f64-5717-4562-b3fc-2c963f66afa6:1</c></item>
/// </list>
/// </para>
///
/// <para>
/// All IDs are lowercased to guarantee case-insensitive matching in the database.
/// </para>
/// </summary>
public static class GenerationKeyStrategy
{
    // ── Account rules ─────────────────────────────────────────────────────────

    /// <summary>task:account:enable_2fa:{accountId}</summary>
    public static string AccountEnable2Fa(Guid accountId)
        => Key("account", "enable_2fa", accountId);

    /// <summary>task:account:add_recovery_email:{accountId}</summary>
    public static string AccountAddRecoveryEmail(Guid accountId)
        => Key("account", "add_recovery_email", accountId);

    /// <summary>task:account:review_app_permissions:{accountId}</summary>
    public static string AccountReviewAppPermissions(Guid accountId)
        => Key("account", "review_app_permissions", accountId);

    /// <summary>task:account:update_weak_password:{accountId}</summary>
    public static string AccountUpdateWeakPassword(Guid accountId)
        => Key("account", "update_weak_password", accountId);

    /// <summary>task:account:sign_out_all_sessions:{accountId}</summary>
    public static string AccountSignOutAllSessions(Guid accountId)
        => Key("account", "sign_out_all_sessions", accountId);

    // ── Device rules ──────────────────────────────────────────────────────────

    /// <summary>task:device:enable_backup:{deviceId}</summary>
    public static string DeviceEnableBackup(Guid deviceId)
        => Key("device", "enable_backup", deviceId);

    /// <summary>task:device:enable_screen_lock:{deviceId}</summary>
    public static string DeviceEnableScreenLock(Guid deviceId)
        => Key("device", "enable_screen_lock", deviceId);

    /// <summary>task:device:update_os:{deviceId}</summary>
    public static string DeviceUpdateOs(Guid deviceId)
        => Key("device", "update_os", deviceId);

    /// <summary>task:device:enable_encryption:{deviceId}</summary>
    public static string DeviceEnableEncryption(Guid deviceId)
        => Key("device", "enable_encryption", deviceId);

    /// <summary>task:device:install_security_patches:{deviceId}</summary>
    public static string DeviceInstallSecurityPatches(Guid deviceId)
        => Key("device", "install_security_patches", deviceId);

    // ── Incident recovery rules ───────────────────────────────────────────────

    /// <summary>task:incident:sign_out_sessions:{incidentId}</summary>
    public static string IncidentSignOutSessions(Guid incidentId)
        => Key("incident", "sign_out_sessions", incidentId);

    /// <summary>task:incident:change_passwords:{incidentId}</summary>
    public static string IncidentChangePasswords(Guid incidentId)
        => Key("incident", "change_passwords", incidentId);

    /// <summary>task:incident:review_connected_apps:{incidentId}</summary>
    public static string IncidentReviewConnectedApps(Guid incidentId)
        => Key("incident", "review_connected_apps", incidentId);

    /// <summary>task:incident:enable_2fa_all_accounts:{incidentId}</summary>
    public static string IncidentEnable2FaAllAccounts(Guid incidentId)
        => Key("incident", "enable_2fa_all_accounts", incidentId);

    /// <summary>task:incident:contact_support:{incidentId}</summary>
    public static string IncidentContactSupport(Guid incidentId)
        => Key("incident", "contact_support", incidentId);

    /// <summary>task:incident:contact_bank:{incidentId}</summary>
    public static string IncidentContactBank(Guid incidentId)
        => Key("incident", "contact_bank", incidentId);

    /// <summary>task:incident:place_fraud_alert:{incidentId}</summary>
    public static string IncidentPlaceFraudAlert(Guid incidentId)
        => Key("incident", "place_fraud_alert", incidentId);

    /// <summary>task:incident:monitor_account_activity:{incidentId}</summary>
    public static string IncidentMonitorAccountActivity(Guid incidentId)
        => Key("incident", "monitor_account_activity", incidentId);

    /// <summary>task:incident:brief_family_members:{incidentId}</summary>
    public static string IncidentBriefFamilyMembers(Guid incidentId)
        => Key("incident", "brief_family_members", incidentId);

    /// <summary>task:incident:report_to_authority:{incidentId}</summary>
    public static string IncidentReportToAuthority(Guid incidentId)
        => Key("incident", "report_to_authority", incidentId);

    // ── Booking (product) rules ───────────────────────────────────────────────

    /// <summary>
    /// Generates a key for the nth task produced by a specific booking.
    /// Used for free-check, family-safety-plan, and annual-plan tasks.
    ///
    /// Pattern: task:booking:{productSlug}:{bookingId}:{index}
    /// Example: task:booking:free_check:3fa85f6...:1
    /// </summary>
    public static string BookingTask(string productSlug, Guid bookingId, int index)
    {
        if (string.IsNullOrWhiteSpace(productSlug))
            throw new ArgumentException("productSlug must not be empty.", nameof(productSlug));
        if (index < 1)
            throw new ArgumentOutOfRangeException(nameof(index), "index must be >= 1.");

        return $"task:booking:{productSlug.ToLowerInvariant()}:{bookingId:N}:{index}";
    }

    // ── Well-known booking product slugs ──────────────────────────────────────

    public const string ProductSlugFreeCheck            = "free_check";
    public const string ProductSlugFamilySafetyPlan     = "family_safety_plan";
    public const string ProductSlugIncidentRecoveryPack = "incident_recovery_pack";
    public const string ProductSlugAnnualPlan           = "annual_plan";

    // ── Custom / escape-hatch ─────────────────────────────────────────────────

    /// <summary>
    /// Builds an arbitrary key from parts.  Use this only when none of the
    /// typed factory methods above apply.
    ///
    /// Parts are lower-cased and joined with ":" — Guid parts are formatted without hyphens.
    /// </summary>
    public static string Custom(params string[] parts)
    {
        if (parts.Length == 0)
            throw new ArgumentException("At least one part is required.", nameof(parts));

        return "task:" + string.Join(":", parts.Select(p => p.ToLowerInvariant()));
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private static string Key(string domain, string rule, Guid entityId)
        => $"task:{domain}:{rule}:{entityId:N}";
}
