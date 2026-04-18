using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Mappers;
using Janatics.Domain.Entities;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Api.Features.Departments.Create;

public static class CreateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", HandleAsync)
            .WithName("CreateDepartment")
            .WithSummary("Create a new department")
            .WithOpenApi()
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status201Created)
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> HandleAsync(
        CreateDepartmentRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.DepartmentName))
            return Results.BadRequest(
                ApiResult<DepartmentDto>.Fail("DepartmentName is required."));

        // Verify HOD exists if provided
        if (request.HodId.HasValue)
        {
            var hodExists = await db.Employees.AnyAsync(e => e.EmployeeId == request.HodId.Value, ct);
            if (!hodExists)
                return Results.BadRequest(
                    ApiResult<DepartmentDto>.Fail($"Employee {request.HodId} not found."));
        }

        var now = DateTime.UtcNow;
        var department = new Department
        {
            DepartmentName = request.DepartmentName,
            HodId = request.HodId,
            CreatedOn = now,
            UpdatedOn = now
        };

        db.Departments.Add(department);
        await db.SaveChangesAsync(ct);

        // Re-fetch with includes
        var created = await db.Departments
            .AsNoTracking()
            .Include(d => d.Hod)
            .FirstAsync(d => d.DepartmentId == department.DepartmentId, ct);

        return Results.Created(
            $"/api/departments/{created.DepartmentId}",
            ApiResult<DepartmentDto>.Ok(DepartmentMapper.ToDto(created), "Department created successfully."));
    }
}
