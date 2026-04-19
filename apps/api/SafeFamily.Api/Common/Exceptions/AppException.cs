namespace SafeFamily.Api.Common.Exceptions;

/// <summary>
/// Base application exception — maps to HTTP error responses via ExceptionHandlingMiddleware.
/// </summary>
public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string resource, object id)
        : base($"{resource} with id '{id}' was not found.", 404) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message, 409) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "You do not have permission to perform this action.")
        : base(message, 403) { }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, 400) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Authentication is required.")
        : base(message, 401) { }
}

public class EntitlementRequiredException : AppException
{
    /// <summary>The entitlement type name that is missing, returned in the error payload.</summary>
    public string RequiredEntitlement { get; }

    public EntitlementRequiredException(string productName, string requiredEntitlement)
        : base(
            $"Access to '{productName}' requires an active subscription. " +
            $"Purchase a qualifying package to unlock this feature.",
            402)
    {
        RequiredEntitlement = requiredEntitlement;
    }
}
