using Google.Apis.Auth;

namespace SafeFamily.Api.Features.Auth;

/// <summary>
/// Verifies Google ID tokens by validating their signature against Google's published
/// JSON Web Key Sets and confirming the audience matches this application's client ID.
///
/// Token verification is performed server-side using the official Google.Apis.Auth library.
/// The frontend never handles secrets — it only obtains a short-lived ID token and
/// forwards it here for authoritative verification.
/// </summary>
public sealed class GoogleTokenVerifier : IExternalTokenVerifier
{
    /// <inheritdoc />
    public string ProviderName => "Google";

    private readonly string _clientId;

    public GoogleTokenVerifier(IConfiguration configuration)
    {
        _clientId = configuration["Google:ClientId"]
            ?? throw new InvalidOperationException(
                "Google:ClientId is not configured. " +
                "Set it in appsettings.json under 'Google:ClientId' or as an environment variable.");
    }

    /// <inheritdoc />
    public async Task<ExternalIdentity?> VerifyAsync(string idToken, CancellationToken ct = default)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                // Validates the "aud" claim — rejects tokens issued for other apps.
                Audience = new[] { _clientId },
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new ExternalIdentity(
                payload.Subject,
                payload.Email,
                payload.Name,
                EmailVerified: payload.EmailVerified);
        }
        catch (InvalidJwtException)
        {
            // Covers: bad signature, expired token, wrong audience, malformed JWT.
            return null;
        }
    }
}
