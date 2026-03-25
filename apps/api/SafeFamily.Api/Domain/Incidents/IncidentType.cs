namespace SafeFamily.Api.Domain.Incidents;

public enum IncidentType
{
    PhishingAttempt    = 0,
    PasswordCompromise = 1,
    DeviceLostOrStolen = 2,
    UnauthorisedAccess = 3,
    DataBreach         = 4,
    MalwareInfection   = 5,
    ScamOrFraud        = 6,
    IdentityTheft      = 7,
    SocialEngineering  = 8,
    Other              = 99,
}
