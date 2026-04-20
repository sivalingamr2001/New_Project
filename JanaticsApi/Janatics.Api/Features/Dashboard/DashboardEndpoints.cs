using Janatics.Application.Common.Models;
using Janatics.Infrastructure.Data;

namespace Janatics.Api.Features.Dashboard;

public class DashboardDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public int TotalEmployees { get; set; }
    public int TotalDepartments { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public static class DashboardEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", HandleGetDashboardAsync)
            .WithName("GetDashboard")
            .WithSummary("Get dashboard summary statistics")
            .WithOpenApi()
            .Produces<ApiResult<DashboardDto>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> HandleGetDashboardAsync(
        AppDbContext db,
        CancellationToken ct)
    {
        // Mock data for demonstration
        var dashboard = new DashboardDto
        {
            TotalRequests = 42,
            PendingRequests = 8,
            ApprovedRequests = 28,
            RejectedRequests = 6,
            TotalEmployees = 150,
            TotalDepartments = 12,
            LastUpdated = DateTime.UtcNow,
        };

        return Results.Ok(ApiResult<DashboardDto>.Ok(dashboard));
    }
}
