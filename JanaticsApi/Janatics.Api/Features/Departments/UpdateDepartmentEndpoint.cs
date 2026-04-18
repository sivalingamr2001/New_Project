using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Mappers;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Api.Features.Departments.Update;

public static class UpdateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/{id:int}", HandleAsync)
            .WithName("UpdateDepartment")
            .WithSummary("Update an existing department")
            .WithOpenApi()
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResult<DepartmentDto>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        int id,
        UpdateDepartmentRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        var department = await db.Departments.FindAsync([id], ct);

        if (department is null)
            return Results.NotFound(
                ApiResult<DepartmentDto>.Fail($"Department with ID {id} not found."));

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

        department.DepartmentName = request.DepartmentName;
        department.HodId = request.HodId;
        department.UpdatedOn = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        // Re-fetch with includes
        var updated = await db.Departments
            .AsNoTracking()
            .Include(d => d.Hod)
            .FirstAsync(d => d.DepartmentId == id, ct);

        return Results.Ok(ApiResult<DepartmentDto>.Ok(
            DepartmentMapper.ToDto(updated), "Department updated successfully."));
    }
}
