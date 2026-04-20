using Janatics.Application.Common.Models;
using Janatics.Infrastructure.Data;

namespace Janatics.Api.Features.Notifications;

public class NotificationDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "Info"; // Info, Warning, Error, Success
    public bool IsRead { get; set; }
    public string? RelatedRequestId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public static class NotificationEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", HandleListAsync)
            .WithName("GetNotifications")
            .WithSummary("Get notifications with pagination")
            .WithOpenApi()
            .Produces<ApiResult<PagedResult<NotificationDto>>>(StatusCodes.Status200OK);

        group.MapPost("/{id}/mark-read", HandleMarkReadAsync)
            .WithName("MarkNotificationAsRead")
            .WithSummary("Mark notification as read")
            .WithOpenApi()
            .Produces<ApiResult<NotificationDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<NotificationDto>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleListAsync(
        [AsParameters] PagedQuery query,
        AppDbContext db,
        CancellationToken ct)
    {
        query.Normalize();

        // Mock data for demonstration
        var mockNotifications = new List<NotificationDto>
        {
            new() {
                Id = "NOTIF001",
                Title = "Access Request Approved",
                Message = "Your access request for Production DB has been approved by HOD",
                Type = "Success",
                IsRead = false,
                RelatedRequestId = "REQ001",
                CreatedAt = DateTime.UtcNow.AddHours(-1),
            },
            new() {
                Id = "NOTIF002",
                Title = "Pending Approval",
                Message = "You have 3 pending access requests awaiting approval",
                Type = "Info",
                IsRead = true,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
            },
            new() {
                Id = "NOTIF003",
                Title = "Access Request Rejected",
                Message = "Your access request has been rejected. Please contact IT for details.",
                Type = "Warning",
                IsRead = false,
                RelatedRequestId = "REQ002",
                CreatedAt = DateTime.UtcNow.AddHours(-4),
            },
        };

        var totalCount = mockNotifications.Count;
        var result = mockNotifications.Skip(query.Skip).Take(query.PageSize).ToList();

        return Results.Ok(ApiResult<PagedResult<NotificationDto>>.Ok(
            new PagedResult<NotificationDto>
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Data = result
            }
        ));
    }

    private static async Task<IResult> HandleMarkReadAsync(
        string id,
        AppDbContext db,
        CancellationToken ct)
    {
        var notification = new NotificationDto
        {
            Id = id,
            Title = "Access Request Approved",
            Message = "Your access request for Production DB has been approved by HOD",
            Type = "Success",
            IsRead = true,
            CreatedAt = DateTime.UtcNow.AddHours(-1),
        };

        return Results.Ok(ApiResult<NotificationDto>.Ok(notification));
    }
}
