using Janatics.Application.Common.Models;
using Janatics.Application.Features.Employees.Dtos;

namespace Janatics.Application.Features.Employees.Services;

/// <summary>
/// Service interface for managing employees
/// </summary>
public interface IEmployeeService
{
    /// <summary>
    /// Get all employees with pagination
    /// </summary>
    Task<PagedResult<EmployeeDto>> GetEmployeesAsync(int pageNumber, int pageSize, CancellationToken ct);

    /// <summary>
    /// Get employees by department
    /// </summary>
    Task<List<EmployeeDto>> GetEmployeesByDepartmentAsync(int departmentId, CancellationToken ct);

    /// <summary>
    /// Get employee by ID
    /// </summary>
    Task<EmployeeDto?> GetEmployeeByIdAsync(int employeeId, CancellationToken ct);

    /// <summary>
    /// Create a new employee
    /// </summary>
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeRequest request, CancellationToken ct);

    /// <summary>
    /// Update employee
    /// </summary>
    Task<EmployeeDto?> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequest request, CancellationToken ct);

    /// <summary>
    /// Delete employee
    /// </summary>
    Task<bool> DeleteEmployeeAsync(int employeeId, CancellationToken ct);
}
