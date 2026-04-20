
using Janatics.Application.Common.Models;
using Janatics.Application.Features.Auth.Dtos;
using Janatics.Application.Features.Auth.Services;

namespace Janatics.Api.Features.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register", RegisterAsync)
            .WithName("Register")
            .WithSummary("Register a new employee account")
            .WithOpenApi()
            .Produces<ApiResult<AuthResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResult<AuthResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResult<AuthResponse>>(StatusCodes.Status409Conflict);

        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .WithSummary("Authenticate and retrieve user info")
            .WithOpenApi()
            .Produces<ApiResult<AuthResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AuthResponse>>(StatusCodes.Status401Unauthorized);

        return group;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        IAuthService service,
        CancellationToken ct)
    {
        try
        {
            var result = await service.RegisterAsync(request, ct);
            return Results.Created(
                $"/api/auth/login",
                ApiResult<AuthResponse>.Ok(result, "Registration successful."));
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(
                ApiResult<AuthResponse>.Fail(ex.Message));
        }
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        IAuthService service,
        CancellationToken ct)
    {
        var result = await service.LoginAsync(request, ct);

        if (result is null)
            return Results.Unauthorized();

        return Results.Ok(ApiResult<AuthResponse>.Ok(result));
    }
}
