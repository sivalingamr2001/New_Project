using Janatics.Application.Common.Models;
using Janatics.Application.Features.Employees.Dtos;
using Janatics.Application.Features.Employees.Services;

namespace Janatics.Api.Features.Employees.Update;

public static class UpdateEmployeeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/{id:int}", HandleAsync)
            .WithName("UpdateEmployee")
            .WithSummary("Update an existing employee")
            .WithOpenApi()
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        int id,
        UpdateEmployeeRequest request,
        IEmployeeService service,
        CancellationToken ct)
    {
        try
        {
            var result = await service.UpdateEmployeeAsync(id, request, ct);

            if (result is null)
                return Results.NotFound(
                    ApiResult<EmployeeDto>.Fail($"Employee with ID {id} not found."));

            return Results.Ok(ApiResult<EmployeeDto>.Ok(
                result, "Employee updated successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(
                ApiResult<EmployeeDto>.Fail(ex.Message));
        }
    }
}
