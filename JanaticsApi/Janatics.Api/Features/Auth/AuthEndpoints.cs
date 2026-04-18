
using Janatics.Application.Common.Models;
using Janatics.Application.Features.Auth.Dtos;
using Janatics.Domain.Entities;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

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

    // ── POST /api/auth/register ───────────────────────────────────────────────

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(
                ApiResult<AuthResponse>.Fail("Username, Password, and Email are required."));
        }

        // Check duplicate username
        var exists = await db.Employees.AnyAsync(e => e.Username == request.Username, ct);
        if (exists)
        {
            return Results.Conflict(
                ApiResult<AuthResponse>.Fail($"Username '{request.Username}' is already taken."));
        }

        // Check department exists
        var deptExists = await db.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId, ct);
        if (!deptExists)
        {
            return Results.BadRequest(
                ApiResult<AuthResponse>.Fail($"Department {request.DepartmentId} not found."));
        }

        var now = DateTime.UtcNow;
        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            Password = request.Password, // In production, hash this!
            Email = request.Email,
            Mobile = request.Mobile,
            Location = request.Location,
            Role = request.Role,
            DepartmentId = request.DepartmentId,
            IsActive = true,
            CreatedOn = now,
            UpdatedOn = now
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync(ct);

        var response = new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email
        );

        return Results.Created($"/api/auth/login", ApiResult<AuthResponse>.Ok(response, "Registration successful."));
    }

    // ── POST /api/auth/login ───────────────────────────────────────────────────

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        var employee = await db.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Username == request.Username, ct);

        if (employee is null || employee.Password != request.Password) // In production, compare hashes!
        {
            return Results.Unauthorized();
        }

        if (!employee.IsActive)
        {
            return Results.Unauthorized();
        }

        var response = new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email
        );

        return Results.Ok(ApiResult<AuthResponse>.Ok(response));
    }
}
