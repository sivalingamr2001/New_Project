using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;

namespace Janatics.Application.Features.Departments.Services;

/// <summary>
/// Service interface for managing departments
/// </summary>
public interface IDepartmentService
{
    /// <summary>
    /// Get all departments with pagination
    /// </summary>
    Task<PagedResult<DepartmentDto>> GetDepartmentsAsync(int pageNumber, int pageSize, CancellationToken ct);

    /// <summary>
    /// Get department by ID
    /// </summary>
    Task<DepartmentDto?> GetDepartmentByIdAsync(int departmentId, CancellationToken ct);

    /// <summary>
    /// Create a new department
    /// </summary>
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request, CancellationToken ct);

    /// <summary>
    /// Update department
    /// </summary>
    Task<DepartmentDto?> UpdateDepartmentAsync(int departmentId, UpdateDepartmentRequest request, CancellationToken ct);

    /// <summary>
    /// Delete department
    /// </summary>
    Task<bool> DeleteDepartmentAsync(int departmentId, CancellationToken ct);
}
