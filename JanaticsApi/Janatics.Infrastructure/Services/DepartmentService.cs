using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Mappers;
using Janatics.Application.Features.Departments.Services;
using Janatics.Domain.Entities;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Infrastructure.Services;

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _dbContext;

    public DepartmentService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<DepartmentDto>> GetDepartmentsAsync(int pageNumber, int pageSize, CancellationToken ct)
    {
        var query = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

        var totalCount = await _dbContext.Departments.CountAsync(ct);

        var departments = await _dbContext.Departments
            .AsNoTracking()
            .Include(x => x.Hod)
            .OrderBy(x => x.DepartmentName)
            .Skip(query)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = departments.Select(DepartmentMapper.ToDto).ToList();

        return new PagedResult<DepartmentDto>
        {
            Data = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<DepartmentDto?> GetDepartmentByIdAsync(int departmentId, CancellationToken ct)
    {
        var department = await _dbContext.Departments
            .AsNoTracking()
            .Include(x => x.Hod)
            .FirstOrDefaultAsync(x => x.DepartmentId == departmentId, ct);

        return department != null ? DepartmentMapper.ToDto(department) : null;
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.DepartmentName))
        {
            throw new InvalidOperationException("Department name is required.");
        }

        var department = new Department
        {
            DepartmentName = request.DepartmentName,
            HodId = request.HodId,
            CreatedOn = DateTime.UtcNow,
            UpdatedOn = DateTime.UtcNow
        };

        _dbContext.Departments.Add(department);
        await _dbContext.SaveChangesAsync(ct);

        // Reload with HOD if present
        if (department.HodId.HasValue)
        {
            await _dbContext.Entry(department).Reference(x => x.Hod).LoadAsync(ct);
        }

        return DepartmentMapper.ToDto(department);
    }

    public async Task<DepartmentDto?> UpdateDepartmentAsync(int departmentId, UpdateDepartmentRequest request, CancellationToken ct)
    {
        var department = await _dbContext.Departments
            .Include(x => x.Hod)
            .FirstOrDefaultAsync(x => x.DepartmentId == departmentId, ct);

        if (department == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(request.DepartmentName))
        {
            department.DepartmentName = request.DepartmentName;
        }

        department.HodId = request.HodId;
        department.UpdatedOn = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(ct);

        return DepartmentMapper.ToDto(department);
    }

    public async Task<bool> DeleteDepartmentAsync(int departmentId, CancellationToken ct)
    {
        var department = await _dbContext.Departments
            .FirstOrDefaultAsync(x => x.DepartmentId == departmentId, ct);

        if (department == null)
        {
            return false;
        }

        _dbContext.Departments.Remove(department);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }
}
