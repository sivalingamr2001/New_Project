using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Services;

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
        IDepartmentService service,
        CancellationToken ct)
    {
        query.Normalize();

        var result = await service.GetDepartmentsAsync(query.PageNumber, query.PageSize, ct);

        return Results.Ok(ApiResult<PagedResult<DepartmentDto>>.Ok(result));
    }

    private static async Task<IResult> HandleGetByIdAsync(
        int id,
        IDepartmentService service,
        CancellationToken ct)
    {
        var department = await service.GetDepartmentByIdAsync(id, ct);

        if (department is null)
            return Results.NotFound(
                ApiResult<DepartmentDto>.Fail($"Department with ID {id} not found."));

        return Results.Ok(ApiResult<DepartmentDto>.Ok(department));
    }
}
