using Janatics.Application.Common.Models;
using Janatics.Application.Features.Employees.Dtos;
using Janatics.Application.Features.Employees.Mappers;
using Janatics.Application.Features.Employees.Services;
using Janatics.Domain.Entities;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Infrastructure.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _dbContext;

    public EmployeeService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<EmployeeDto>> GetEmployeesAsync(int pageNumber, int pageSize, CancellationToken ct)
    {
        var query = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

        var totalCount = await _dbContext.Employees.CountAsync(ct);

        var employees = await _dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x.Hod)
            .OrderBy(x => x.FirstName)
            .Skip(query)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = employees.Select(EmployeeMapper.ToDto).ToList();

        return new PagedResult<EmployeeDto>
        {
            Data = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<List<EmployeeDto>> GetEmployeesByDepartmentAsync(int departmentId, CancellationToken ct)
    {
        var employees = await _dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x.Hod)
            .Where(x => x.DepartmentId == departmentId)
            .OrderBy(x => x.FirstName)
            .ToListAsync(ct);

        return employees.Select(EmployeeMapper.ToDto).ToList();
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(int employeeId, CancellationToken ct)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x.Hod)
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, ct);

        return employee != null ? EmployeeMapper.ToDto(employee) : null;
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeRequest request, CancellationToken ct)
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

        // Reload with Department
        await _dbContext.Entry(employee).Reference(x => x.Department).LoadAsync(ct);
        if (employee.Department != null)
        {
            await _dbContext.Entry(employee.Department).Reference(x => x.Hod).LoadAsync(ct);
        }

        return EmployeeMapper.ToDto(employee);
    }

    public async Task<EmployeeDto?> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequest request, CancellationToken ct)
    {
        var employee = await _dbContext.Employees
            .Include(x => x.Department)
            .ThenInclude(x => x.Hod)
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, ct);

        if (employee == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            employee.FirstName = request.FirstName;
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            employee.LastName = request.LastName;
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            employee.Email = request.Email;
        }

        if (!string.IsNullOrWhiteSpace(request.Mobile))
        {
            employee.Mobile = request.Mobile;
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            employee.Location = request.Location;
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            employee.Role = request.Role;
        }

        employee.IsActive = request.IsActive;
        employee.DepartmentId = request.DepartmentId;
        employee.UpdatedOn = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(ct);

        return EmployeeMapper.ToDto(employee);
    }

    public async Task<bool> DeleteEmployeeAsync(int employeeId, CancellationToken ct)
    {
        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, ct);

        if (employee == null)
        {
            return false;
        }

        _dbContext.Employees.Remove(employee);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }
}
