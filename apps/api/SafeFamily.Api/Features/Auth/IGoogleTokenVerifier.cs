namespace SafeFamily.Api.Features.Auth;

/// <summary>
/// Provider-agnostic contract for verifying an ID token issued by an external
/// identity provider (Google, Apple, Microsoft, Facebook, …) and extracting the
/// verified identity claims.
///
/// Add support for a new provider by:
///   1. Creating a class that implements this interface.
///   2. Registering it with <c>builder.Services.AddScoped&lt;IExternalTokenVerifier, MyVerifier&gt;()</c>.
///   The <see cref="IExternalTokenVerifierRegistry"/> picks it up automatically — no other
///   changes are required.
/// </summary>
public interface IExternalTokenVerifier
{
    /// <summary>
    /// The canonical provider name persisted in <c>user_external_logins.provider</c>.
    /// Must be stable, unique, and PascalCase (e.g. "Google", "Apple", "Microsoft").
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// Verifies the token's cryptographic signature, expiry, issuer, and audience.
    /// Returns <c>null</c> for any invalid token; only throws for service
    /// configuration issues (e.g. missing client ID).
    /// </summary>
    Task<ExternalIdentity?> VerifyAsync(string idToken, CancellationToken ct = default);
}

/// <summary>
/// Locates the registered <see cref="IExternalTokenVerifier"/> for a given provider
/// name. New providers are registered with DI — no changes to this interface or to
/// <see cref="AuthService"/> are needed.
/// </summary>
public interface IExternalTokenVerifierRegistry
{
    /// <returns>
    /// The matching verifier, or <c>null</c> when the provider is not supported.
    /// </returns>
    IExternalTokenVerifier? GetVerifier(string provider);
}

/// <summary>
/// Normalised identity claims produced by any external provider after token
/// verification. Each provider maps its own claim names to these fields.
/// </summary>
/// <param name="Subject">
///   The provider's stable, unique identifier for the account ("sub" in Google / Apple
///   JWTs, "oid" for Microsoft). This — not the email — is the durable join key stored
///   in <see cref="Domain.Users.UserExternalLogin.ProviderSubject"/>.
/// </param>
/// <param name="Email">
///   The account's email address.
/// </param>
/// <param name="Name">
///   Full display name from the provider's profile, or <c>null</c> when not shared.
/// </param>
/// <param name="EmailVerified">
///   Whether the identity provider has verified that the user owns this email address.
///   Google always returns <c>true</c>. Providers that cannot guarantee ownership
///   (e.g. some OAuth 2.0 flows) should return <c>false</c>.
///   The auto-link-by-email path in <see cref="AuthService"/> rejects unverified emails
///   to prevent account takeover.
/// </param>
public sealed record ExternalIdentity(string Subject, string Email, string? Name, bool EmailVerified = true);
