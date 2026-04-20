using Janatics.Application.Common.Models;
using Janatics.Application.Features.AccessRequests.Dtos;

namespace Janatics.Application.Features.AccessRequests.Services;

/// <summary>
/// Service interface for managing access requests
/// </summary>
public interface IAccessRequestService
{
    /// <summary>
    /// Get all access requests with pagination
    /// </summary>
    Task<PagedResult<AccessRequestDto>> GetAccessRequestsAsync(int pageNumber, int pageSize, CancellationToken ct);

    /// <summary>
    /// Get access request details by ID
    /// </summary>
    Task<AccessRequestDto?> GetAccessRequestByIdAsync(int accessReqId, CancellationToken ct);

    /// <summary>
    /// Create a new access request
    /// </summary>
    Task<AccessRequestDto> CreateAccessRequestAsync(CreateAccessRequestDto dto, CancellationToken ct);

    /// <summary>
    /// Update access item status (for approvals)
    /// </summary>
    Task<AccessRequestDto?> UpdateAccessItemStatusAsync(UpdateAccessRequestStatusDto dto, CancellationToken ct);

    /// <summary>
    /// Approve access request as HOD
    /// </summary>
    Task<bool> ApproveAsHodAsync(int accessReqId, int accessItemId, string comments, string approvedBy, CancellationToken ct);

    /// <summary>
    /// Approve access request as IT Admin
    /// </summary>
    Task<bool> ApproveAsItAsync(int accessReqId, int accessItemId, string comments, string approvedBy, CancellationToken ct);

    /// <summary>
    /// Reject access request as HOD
    /// </summary>
    Task<bool> RejectAsHodAsync(int accessReqId, int accessItemId, string comments, string rejectedBy, CancellationToken ct);

    /// <summary>
    /// Reject access request as IT Admin
    /// </summary>
    Task<bool> RejectAsItAsync(int accessReqId, int accessItemId, string comments, string rejectedBy, CancellationToken ct);

    /// <summary>
    /// Revoke an approved access request
    /// </summary>
    Task<bool> RevokeAccessAsync(int accessReqId, int accessItemId, string revokedBy, CancellationToken ct);

    /// <summary>
    /// Get audit logs for an access request
    /// </summary>
    Task<List<AccessReqAuditDto>> GetAuditLogsAsync(int accessReqId, CancellationToken ct);
}
