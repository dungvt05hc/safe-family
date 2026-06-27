using System.ComponentModel.DataAnnotations;

namespace SafeFamily.Api.Features.Auth.Dtos;

/// <summary>
/// Payload for POST /api/auth/external — sent by the client after receiving
/// an ID token from an identity provider (e.g. Google One Tap).
/// </summary>
public class ExternalAuthRequest
{
    /// <summary>
    /// Identity provider name. Currently supported: "Google".
    /// Used for routing and audit logging; validated server-side.
    /// Must contain only letters (e.g. "Google", "Apple", "Microsoft").
    /// </summary>
    [Required]
    [MaxLength(50)]
    [RegularExpression(@"^[A-Za-z]+$",
        ErrorMessage = "Provider must contain only letters.")]
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// The ID token (JWT) obtained by the client from the identity provider.
    /// The backend verifies the token cryptographically — it is never trusted blindly.
    /// Google ID tokens are typically 1–2 KB; 8 KB is a generous upper bound.
    /// </summary>
    [Required]
    [MaxLength(8192)]
    public string IdToken { get; set; } = string.Empty;
}
