using Janatics.Application.Features.Auth.Dtos;
using Janatics.Application.Features.Auth.Services;
using Janatics.Domain.Entities;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;

    public AuthService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            throw new InvalidOperationException("Username, Password, and Email are required.");
        }

        // Check duplicate username
        var exists = await _dbContext.Employees.AnyAsync(e => e.Username == request.Username, ct);
        if (exists)
        {
            throw new InvalidOperationException($"Username '{request.Username}' is already taken.");
        }

        // Check department exists
        var deptExists = await _dbContext.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId, ct);
        if (!deptExists)
        {
            throw new InvalidOperationException($"Department {request.DepartmentId} not found.");
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

        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync(ct);

        return new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email
        );
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(
                e => e.Username == request.Username && e.Password == request.Password,
                ct);

        if (employee == null)
        {
            return null;
        }

        return new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email
        );
    }

    public async Task<AuthResponse?> GetEmployeeByIdAsync(int employeeId, CancellationToken ct)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId, ct);

        if (employee == null)
        {
            return null;
        }

        return new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email
        );
    }
}
