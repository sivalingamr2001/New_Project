using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Services;

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
        IDepartmentService service,
        CancellationToken ct)
    {
        try
        {
            var result = await service.UpdateDepartmentAsync(id, request, ct);

            if (result is null)
                return Results.NotFound(
                    ApiResult<DepartmentDto>.Fail($"Department with ID {id} not found."));

            return Results.Ok(ApiResult<DepartmentDto>.Ok(
                result, "Department updated successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(
                ApiResult<DepartmentDto>.Fail(ex.Message));
        }
    }
}
