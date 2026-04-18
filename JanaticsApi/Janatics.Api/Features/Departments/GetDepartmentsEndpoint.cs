using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Mappers;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Api.Features.Departments.Get;

public static class GetDepartmentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Get all with pagination
        group.MapGet("/", HandleListAsync)
            .WithName("GetDepartments")
            .WithSummary("Get all departments with pagination")
            .WithOpenApi()
            .Produces<ApiResult<PagedResult<DepartmentDto>>>(StatusCodes.Status200OK);

        // Get by ID
        group.MapGet("/{id:int}", HandleGetByIdAsync)
            .WithName("GetDepartmentById")
            .WithSummary("Get department by ID with HOD details")
            .WithOpenApi()
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleListAsync(
        [AsParameters] PagedQuery query,
        AppDbContext db,
        CancellationToken ct)
    {
        query.Normalize();

        var totalCount = await db.Departments.CountAsync(ct);

        var departments = await db.Departments
            .AsNoTracking()
            .Include(d => d.Hod)
            .OrderBy(d => d.DepartmentId)
            .Skip(query.Skip)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var result = new PagedResult<DepartmentDto>
        {
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize,
            Data = departments.Select(DepartmentMapper.ToDto)
        };

        return Results.Ok(ApiResult<PagedResult<DepartmentDto>>.Ok(result));
    }

    private static async Task<IResult> HandleGetByIdAsync(
        int id,
        AppDbContext db,
        CancellationToken ct)
    {
        var department = await db.Departments
            .AsNoTracking()
            .Include(d => d.Hod)
            .FirstOrDefaultAsync(d => d.DepartmentId == id, ct);

        if (department is null)
            return Results.NotFound(
                ApiResult<DepartmentDto>.Fail($"Department with ID {id} not found."));

        return Results.Ok(ApiResult<DepartmentDto>.Ok(DepartmentMapper.ToDto(department)));
    }
}
