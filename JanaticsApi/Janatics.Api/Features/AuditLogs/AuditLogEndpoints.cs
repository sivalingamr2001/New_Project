using Janatics.Application.Common.Models;
using Janatics.Infrastructure.Data;

namespace Janatics.Api.Features.AuditLogs;

public class AuditLogDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Action { get; set; } = string.Empty;
    public string Performer { get; set; } = string.Empty;
    public string PerformerRole { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string ResourceId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object>? Changes { get; set; }
}

public static class AuditLogEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", HandleListAsync)
            .WithName("GetAuditLogs")
            .WithSummary("Get audit logs with pagination")
            .WithOpenApi()
            .Produces<ApiResult<PagedResult<AuditLogDto>>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> HandleListAsync(
        [AsParameters] PagedQuery query,
        AppDbContext db,
        CancellationToken ct)
    {
        query.Normalize();

        // Mock data for demonstration
        var mockLogs = new List<AuditLogDto>
        {
            new() {
                Id = "AUDIT001",
                Action = "CREATE",
                Performer = "admin@company.com",
                PerformerRole = "IT Admin",
                ResourceType = "AccessRequest",
                ResourceId = "REQ001",
                Description = "Created new access request for production database",
                Timestamp = DateTime.UtcNow.AddHours(-2),
            },
            new() {
                Id = "AUDIT002",
                Action = "UPDATE",
                Performer = "hod@company.com",
                PerformerRole = "HOD",
                ResourceType = "AccessRequest",
                ResourceId = "REQ002",
                Description = "Reviewed and approved access request",
                Timestamp = DateTime.UtcNow.AddHours(-1),
                Changes = new Dictionary<string, object>
                {
                    { "Status", new { Old = "Pending", New = "ApprovedByHod" } },
                },
            },
            new() {
                Id = "AUDIT003",
                Action = "DELETE",
                Performer = "user@company.com",
                PerformerRole = "User",
                ResourceType = "AccessRequest",
                ResourceId = "REQ003",
                Description = "Cancelled access request",
                Timestamp = DateTime.UtcNow.AddHours(-3),
            },
        };

        var totalCount = mockLogs.Count;
        var result = mockLogs.Skip(query.Skip).Take(query.PageSize).ToList();

        return Results.Ok(ApiResult<PagedResult<AuditLogDto>>.Ok(
            new PagedResult<AuditLogDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Data = result
            }
        ));
    }
}
