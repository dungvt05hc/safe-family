namespace SafeFamily.Api.Features.Auth;

/// <summary>
/// Resolves the correct <see cref="IExternalTokenVerifier"/> for a provider name by
/// consulting all implementations registered in the DI container.
///
/// How it works:
///   .NET's built-in DI supports injecting <c>IEnumerable&lt;T&gt;</c> to receive every
///   registered implementation of an interface. This registry collects all
///   <see cref="IExternalTokenVerifier"/> registrations at construction time and indexes
///   them by <see cref="IExternalTokenVerifier.ProviderName"/> for O(1) lookups.
///
/// Adding a new provider (e.g. Apple):
///   1. Create <c>AppleTokenVerifier : IExternalTokenVerifier</c>.
///   2. Register it: <c>builder.Services.AddScoped&lt;IExternalTokenVerifier, AppleTokenVerifier&gt;()</c>.
///   3. Done — no changes here or in <see cref="AuthService"/> are needed.
/// </summary>
public sealed class ExternalTokenVerifierRegistry : IExternalTokenVerifierRegistry
{
    private readonly IReadOnlyDictionary<string, IExternalTokenVerifier> _byProvider;

    public ExternalTokenVerifierRegistry(IEnumerable<IExternalTokenVerifier> verifiers)
    {
        _byProvider = verifiers.ToDictionary(
            v => v.ProviderName,
            StringComparer.OrdinalIgnoreCase);
    }

    /// <inheritdoc />
    public IExternalTokenVerifier? GetVerifier(string provider) =>
        _byProvider.TryGetValue(provider, out var verifier) ? verifier : null;
}
