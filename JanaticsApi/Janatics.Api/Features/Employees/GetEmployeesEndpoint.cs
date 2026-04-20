using Janatics.Application.Common.Models;
using Janatics.Application.Features.Employees.Dtos;
using Janatics.Application.Features.Employees.Services;

namespace Janatics.Api.Features.Employees.Get;

public static class GetEmployeesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Get all with pagination
        group.MapGet("/", HandleListAsync)
            .WithName("GetEmployees")
            .WithSummary("Get all employees with pagination")
            .WithOpenApi()
            .Produces<ApiResult<PagedResult<EmployeeDto>>>(StatusCodes.Status200OK);

        // Get by ID
        group.MapGet("/{id:int}", HandleGetByIdAsync)
            .WithName("GetEmployeeById")
            .WithSummary("Get employee by ID including department and HOD details")
            .WithOpenApi()
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<EmployeeDto>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleListAsync(
        [AsParameters] PagedQuery query,
        IEmployeeService service,
        CancellationToken ct)
    {
        query.Normalize();

        var result = await service.GetEmployeesAsync(query.PageNumber, query.PageSize, ct);

        return Results.Ok(ApiResult<PagedResult<EmployeeDto>>.Ok(result));
    }

    private static async Task<IResult> HandleGetByIdAsync(
        int id,
        IEmployeeService service,
        CancellationToken ct)
    {
        var employee = await service.GetEmployeeByIdAsync(id, ct);

        if (employee is null)
            return Results.NotFound(
                ApiResult<EmployeeDto>.Fail($"Employee with ID {id} not found."));

        return Results.Ok(ApiResult<EmployeeDto>.Ok(employee));
    }
}
