using Janatics.Application.Common.Models;
using Janatics.Application.Features.Departments.Dtos;
using Janatics.Application.Features.Departments.Services;

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
        IDepartmentService service,
        CancellationToken ct)
    {
        try
        {
            var result = await service.CreateDepartmentAsync(request, ct);
            return Results.Created(
                $"/api/departments/{result.DepartmentId}",
                ApiResult<DepartmentDto>.Ok(result, "Department created successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(
                ApiResult<DepartmentDto>.Fail(ex.Message));
        }
    }
}
