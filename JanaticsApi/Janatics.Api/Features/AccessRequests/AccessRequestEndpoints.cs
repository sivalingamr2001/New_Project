using Janatics.Application.Common.Models;
using Janatics.Application.Features.AccessRequests.Dtos;
using Janatics.Application.Features.AccessRequests.Services;
using Microsoft.AspNetCore.Mvc;

namespace Janatics.Api.Features.AccessRequests;

public static class AccessRequestEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        // Get all requests with pagination
        group.MapGet("/", HandleListAsync)
            .WithName("GetAccessRequests")
            .WithSummary("Get all access requests with pagination")
            .WithOpenApi()
            .Produces<ApiResult<PagedResult<AccessRequestDto>>>(StatusCodes.Status200OK);

        // Get request details
        group.MapGet("/{id:int}", HandleGetDetailsAsync)
            .WithName("GetAccessRequestDetails")
            .WithSummary("Get access request details")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status404NotFound);

        // Create request
        group.MapPost("/", HandleCreateAsync)
            .WithName("CreateAccessRequest")
            .WithSummary("Create new access request")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status201Created)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status400BadRequest);

        // Review by HOD
        group.MapPost("/{id:int}/review-hod", HandleReviewByHodAsync)
            .WithName("ReviewAccessRequestByHod")
            .WithSummary("Review access request as Head of Department")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status404NotFound);

        // Review by IT
        group.MapPost("/{id:int}/review-it", HandleReviewByItAsync)
            .WithName("ReviewAccessRequestByIt")
            .WithSummary("Review access request as IT Administrator")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status404NotFound);

        // Renew request
        group.MapPost("/{id:int}/renew", HandleRenewAsync)
            .WithName("RenewAccessRequest")
            .WithSummary("Renew an approved access request")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status404NotFound);

        // Resubmit request
        group.MapPost("/{id:int}/resubmit", HandleResubmitAsync)
            .WithName("ResubmitAccessRequest")
            .WithSummary("Resubmit a rejected access request")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status404NotFound);

        // Revoke request
        group.MapPost("/{id:int}/revoke", HandleRevokeAsync)
            .WithName("RevokeAccessRequest")
            .WithSummary("Revoke an approved access request")
            .WithOpenApi()
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status200OK)
            .Produces<ApiResult<AccessRequestDto>>(StatusCodes.Status404NotFound);

        // Get audit logs
        group.MapGet("/{id:int}/audit", HandleGetAuditLogsAsync)
            .WithName("GetAccessRequestAuditLogs")
            .WithSummary("Get audit logs for an access request")
            .WithOpenApi()
            .Produces<ApiResult<List<AccessReqAuditDto>>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> HandleListAsync(
        IAccessRequestService service,
        CancellationToken ct,
        int pageNumber = 1,
        int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var result = await service.GetAccessRequestsAsync(pageNumber, pageSize, ct);

        return Results.Ok(ApiResult<PagedResult<AccessRequestDto>>.Ok(result));
    }

    private static async Task<IResult> HandleGetDetailsAsync(
        int id,
        IAccessRequestService service,
        CancellationToken ct)
    {
        var request = await service.GetAccessRequestByIdAsync(id, ct);

        if (request is null)
            return Results.NotFound(ApiResult<AccessRequestDto>.Fail("Access request not found."));

        return Results.Ok(ApiResult<AccessRequestDto>.Ok(request));
    }

    private static async Task<IResult> HandleCreateAsync(
        CreateAccessRequestDto dto,
        IAccessRequestService service,
        CancellationToken ct)
    {
        if (dto.EmpId <= 0 || dto.ReqTo <= 0 || !dto.AccessItems.Any())
        {
            return Results.BadRequest(
                ApiResult<AccessRequestDto>.Fail("EmpId, ReqTo, and AccessItems are required."));
        }

        var request = await service.CreateAccessRequestAsync(dto, ct);

        return Results.Created($"/api/access-requests/{request.AccessReqId}", 
            ApiResult<AccessRequestDto>.Ok(request));
    }

    private static async Task<IResult> HandleReviewByHodAsync(
        int id,
        [FromBody] UpdateAccessRequestStatusDto dto,
        IAccessRequestService service,
        CancellationToken ct)
    {
        // TODO: Get user from authentication context
        var currentUser = dto.ModifiedBy ?? "System";

        var success = await service.ApproveAsHodAsync(id, dto.AccessItemId, dto.Comments, currentUser, ct);

        if (!success)
            return Results.NotFound(ApiResult<AccessRequestDto>.Fail("Access request not found."));

        var request = await service.GetAccessRequestByIdAsync(id, ct);
        return Results.Ok(ApiResult<AccessRequestDto>.Ok(request!));
    }

    private static async Task<IResult> HandleReviewByItAsync(
        int id,
        [FromBody] UpdateAccessRequestStatusDto dto,
        IAccessRequestService service,
        CancellationToken ct)
    {
        // TODO: Get user from authentication context
        var currentUser = dto.ModifiedBy ?? "System";

        var success = await service.ApproveAsItAsync(id, dto.AccessItemId, dto.Comments, currentUser, ct);

        if (!success)
            return Results.NotFound(ApiResult<AccessRequestDto>.Fail("Access request not found."));

        var request = await service.GetAccessRequestByIdAsync(id, ct);
        return Results.Ok(ApiResult<AccessRequestDto>.Ok(request!));
    }

    private static async Task<IResult> HandleRenewAsync(
        int id,
        IAccessRequestService service,
        CancellationToken ct)
    {
        var request = await service.GetAccessRequestByIdAsync(id, ct);

        if (request is null)
            return Results.NotFound(ApiResult<AccessRequestDto>.Fail("Access request not found."));

        return Results.Ok(ApiResult<AccessRequestDto>.Ok(request));
    }

    private static async Task<IResult> HandleResubmitAsync(
        int id,
        [FromBody] CreateAccessItemDto dto,
        IAccessRequestService service,
        CancellationToken ct)
    {
        var request = await service.GetAccessRequestByIdAsync(id, ct);

        if (request is null)
            return Results.NotFound(ApiResult<AccessRequestDto>.Fail("Access request not found."));

        return Results.Ok(ApiResult<AccessRequestDto>.Ok(request));
    }

    private static async Task<IResult> HandleRevokeAsync(
        int id,
        [FromBody] RevokeAccessRequestDto dto,
        IAccessRequestService service,
        CancellationToken ct)
    {
        // TODO: Get user from authentication context
        var currentUser = dto.RevokedBy ?? "System";

        var success = await service.RevokeAccessAsync(id, dto.AccessItemId, currentUser, ct);

        if (!success)
            return Results.NotFound(ApiResult<AccessRequestDto>.Fail("Access request not found."));

        var request = await service.GetAccessRequestByIdAsync(id, ct);
        return Results.Ok(ApiResult<AccessRequestDto>.Ok(request!));
    }

    private static async Task<IResult> HandleGetAuditLogsAsync(
        int id,
        IAccessRequestService service,
        CancellationToken ct)
    {
        var auditLogs = await service.GetAuditLogsAsync(id, ct);
        return Results.Ok(ApiResult<List<AccessReqAuditDto>>.Ok(auditLogs));
    }
}
