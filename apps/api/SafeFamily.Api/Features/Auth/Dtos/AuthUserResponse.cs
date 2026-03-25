using SafeFamily.Api.Domain.Users;

namespace SafeFamily.Api.Features.Auth.Dtos;

/// <summary>
/// Returned from all auth endpoints. Never exposes the password hash.
/// </summary>
public record AuthUserResponse(Guid Id, string Email, string DisplayName, UserRole Role);
