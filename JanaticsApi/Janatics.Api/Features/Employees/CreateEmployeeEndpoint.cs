using Janatics.Application.Common.Models;
using Janatics.Application.Features.Employees.Dtos;
using Janatics.Application.Features.Employees.Services;

namespace Janatics.Api.Features.Employees.Create;

public static class CreateEmployeeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", HandleAsync)
            .WithName("CreateEmployee")
            .WithSummary("Create a new employee")
            .WithOpenApi()
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status201Created)
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status409Conflict);
    }

    private static async Task<IResult> HandleAsync(
        CreateEmployeeRequest request,
        IEmployeeService service,
        CancellationToken ct)
    {
        try
        {
            var result = await service.CreateEmployeeAsync(request, ct);
            return Results.Created(
                $"/api/employees/{result.EmployeeId}",
                ApiResult<EmployeeDto>.Ok(result, "Employee created successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(
                ApiResult<EmployeeDto>.Fail(ex.Message));
        }
    }
}
