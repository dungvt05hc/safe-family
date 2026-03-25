using System.ComponentModel.DataAnnotations;

namespace SafeFamily.Api.Features.Auth.Dtos;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
