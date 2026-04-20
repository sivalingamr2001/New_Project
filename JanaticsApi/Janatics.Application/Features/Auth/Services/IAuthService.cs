using Janatics.Application.Features.Auth.Dtos;

namespace Janatics.Application.Features.Auth.Services;

/// <summary>
/// Service interface for authentication and authorization
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Register a new employee
    /// </summary>
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct);

    /// <summary>
    /// Authenticate user and return auth response
    /// </summary>
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct);

    /// <summary>
    /// Get employee by ID
    /// </summary>
    Task<AuthResponse?> GetEmployeeByIdAsync(int employeeId, CancellationToken ct);
}
