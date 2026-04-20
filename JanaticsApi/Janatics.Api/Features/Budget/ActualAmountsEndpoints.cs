using Janatics.Application.Common.Models;
using Janatics.Infrastructure.Data;

namespace Janatics.Api.Features.Budget;

public static class ActualAmountsEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/actual-amounts", HandleGetActualAmountsAsync)
            .WithName("GetActualAmounts")
            .WithSummary("Get actual amounts for a project by category and subcategory")
            .WithOpenApi()
            .Produces<ApiResult<ActualAmountsResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResult<string>>(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> HandleGetActualAmountsAsync(
        ActualAmountsRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.ProjectCode) || string.IsNullOrWhiteSpace(request.ProductNo))
        {
            return Results.BadRequest(
                ApiResult<string>.Fail("ProjectCode and ProductNo are required"));
        }

        try
        {
            // Get actual amounts (using mock data for now)
            var result = ActualAmountsService.GetActualAmounts(request.ProjectCode, request.ProductNo);

            // For future database integration, uncomment below:
            // var result = await ActualAmountsService.GetActualAmountsFromDbAsync(db, request.ProjectCode, request.ProductNo, ct);

            return Results.Ok(ApiResult<ActualAmountsResponse>.Ok(result));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(
                ApiResult<string>.Fail($"Error fetching actual amounts: {ex.Message}"));
        }
    }
}
