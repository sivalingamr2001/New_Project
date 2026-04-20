using Janatics.Application.Common.Models;
using Janatics.Application.Features.AccessRequests.Dtos;
using Janatics.Application.Features.AccessRequests.Services;
using Janatics.Domain.Entities;
using Janatics.Domain.Enums;
using Janatics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Janatics.Infrastructure.Services;

public class AccessRequestService : IAccessRequestService
{
    private readonly AppDbContext _dbContext;

    public AccessRequestService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<AccessRequestDto>> GetAccessRequestsAsync(int pageNumber, int pageSize, CancellationToken ct)
    {
        var query = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

        var totalCount = await _dbContext.AccessRequests.CountAsync(ct);

        var requests = await _dbContext.AccessRequests
            .AsNoTracking()
            .Include(x => x.AccessItems)
            .OrderByDescending(x => x.CreatedOn)
            .Skip(query)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = requests.Select(MapToDto).ToList();

        return new PagedResult<AccessRequestDto>
        {
            Data = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<AccessRequestDto?> GetAccessRequestByIdAsync(int accessReqId, CancellationToken ct)
    {
        var request = await _dbContext.AccessRequests
            .AsNoTracking()
            .Include(x => x.AccessItems)
            .FirstOrDefaultAsync(x => x.AccessReqId == accessReqId, ct);

        return request != null ? MapToDto(request) : null;
    }

    public async Task<AccessRequestDto> CreateAccessRequestAsync(CreateAccessRequestDto dto, CancellationToken ct)
    {
        var request = new AccessRequestEntity
        {
            EmpId = dto.EmpId,
            ReqTo = dto.ReqTo,
            IsAgreed = dto.IsAgreed,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy,
            AccessItems = dto.AccessItems.Select(x => new AccessItemEntity
            {
                FolderPath = x.FolderPath,
                AccessType = x.AccessType,
                ConfirmAccessType = AccessTypes.NotApplicable,
                Reason = x.Reason,
                Status = RequestStatus.Submitted,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = x.CreatedBy
            }).ToList()
        };

        _dbContext.AccessRequests.Add(request);
        await _dbContext.SaveChangesAsync(ct);

        // Create audit log for request creation
        var auditLog = new AccessReqAuditEntity
        {
            AccessReqId = request.AccessReqId,
            EventType = "CREATED",
            Message = $"Access request created by {dto.CreatedBy}",
            RecipientEmpId = dto.ReqTo,
            RecipientName = "System", // Would be populated from employee lookup
            RecipientRole = "Approver",
            CreatedOn = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy
        };

        _dbContext.AccessAuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(ct);

        return MapToDto(request);
    }

    public async Task<AccessRequestDto?> UpdateAccessItemStatusAsync(UpdateAccessRequestStatusDto dto, CancellationToken ct)
    {
        var item = await _dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessItemId == dto.AccessItemId, ct);

        if (item == null)
            return null;

        item.Status = dto.Status;
        item.ModifiedOn = DateTime.UtcNow;
        item.ModifiedBy = dto.ModifiedBy;

        // Create approval record
        var approval = new AccessApprovalEntity
        {
            AccessReqId = dto.AccessReqId,
            AccessItemId = dto.AccessItemId,
            ApproverId = 0, // Should be set from context user
            ApprovalStatus = dto.Status,
            Comments = dto.Comments,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = dto.ModifiedBy
        };

        _dbContext.AccessApprovals.Add(approval);
        await _dbContext.SaveChangesAsync(ct);

        var request = await GetAccessRequestByIdAsync(dto.AccessReqId, ct);
        return request;
    }

    public async Task<bool> ApproveAsHodAsync(int accessReqId, int accessItemId, string comments, string approvedBy, CancellationToken ct)
    {
        var item = await _dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId && x.AccessReqId == accessReqId, ct);

        if (item == null)
            return false;

        item.Status = RequestStatus.ApprovedHOD;
        item.ModifiedOn = DateTime.UtcNow;
        item.ModifiedBy = approvedBy;

        var approval = new AccessApprovalEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            ApproverId = 0, // Should be set from context user
            ApprovalStatus = RequestStatus.ApprovedHOD,
            Comments = comments,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = approvedBy
        };

        _dbContext.AccessApprovals.Add(approval);
        await _dbContext.SaveChangesAsync(ct);

        // Create audit log
        var auditLog = new AccessReqAuditEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            AccessApproveId = approval.AccessApproveId,
            EventType = "APPROVED_HOD",
            Message = $"Access request approved by HOD: {approvedBy}",
            RecipientEmpId = item.AccessReqId, // Request creator
            RecipientName = "System",
            RecipientRole = "Employee",
            CreatedOn = DateTime.UtcNow,
            CreatedBy = approvedBy
        };

        _dbContext.AccessAuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }

    public async Task<bool> ApproveAsItAsync(int accessReqId, int accessItemId, string comments, string approvedBy, CancellationToken ct)
    {
        var item = await _dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId && x.AccessReqId == accessReqId, ct);

        if (item == null)
            return false;

        item.Status = RequestStatus.AccessGranted;
        item.ModifiedOn = DateTime.UtcNow;
        item.ModifiedBy = approvedBy;

        var approval = new AccessApprovalEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            ApproverId = 0,
            ApprovalStatus = RequestStatus.AccessGranted,
            Comments = comments,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = approvedBy
        };

        _dbContext.AccessApprovals.Add(approval);
        await _dbContext.SaveChangesAsync(ct);

        // Create audit log
        var auditLog = new AccessReqAuditEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            AccessApproveId = approval.AccessApproveId,
            EventType = "APPROVED_IT",
            Message = $"Access granted by IT Admin: {approvedBy}",
            RecipientEmpId = item.AccessReqId,
            RecipientName = "System",
            RecipientRole = "Employee",
            CreatedOn = DateTime.UtcNow,
            CreatedBy = approvedBy
        };

        _dbContext.AccessAuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }

    public async Task<bool> RejectAsHodAsync(int accessReqId, int accessItemId, string comments, string rejectedBy, CancellationToken ct)
    {
        var item = await _dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId && x.AccessReqId == accessReqId, ct);

        if (item == null)
            return false;

        item.Status = RequestStatus.RejectedHOD;
        item.ModifiedOn = DateTime.UtcNow;
        item.ModifiedBy = rejectedBy;

        var approval = new AccessApprovalEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            ApproverId = 0,
            ApprovalStatus = RequestStatus.RejectedHOD,
            Comments = comments,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = rejectedBy
        };

        _dbContext.AccessApprovals.Add(approval);
        await _dbContext.SaveChangesAsync(ct);

        // Create audit log
        var auditLog = new AccessReqAuditEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            AccessApproveId = approval.AccessApproveId,
            EventType = "REJECTED_HOD",
            Message = $"Access request rejected by HOD: {rejectedBy}",
            RecipientEmpId = item.AccessReqId,
            RecipientName = "System",
            RecipientRole = "Employee",
            CreatedOn = DateTime.UtcNow,
            CreatedBy = rejectedBy
        };

        _dbContext.AccessAuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }

    public async Task<bool> RejectAsItAsync(int accessReqId, int accessItemId, string comments, string rejectedBy, CancellationToken ct)
    {
        var item = await _dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId && x.AccessReqId == accessReqId, ct);

        if (item == null)
            return false;

        item.Status = RequestStatus.RejectedIT;
        item.ModifiedOn = DateTime.UtcNow;
        item.ModifiedBy = rejectedBy;

        var approval = new AccessApprovalEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            ApproverId = 0,
            ApprovalStatus = RequestStatus.RejectedIT,
            Comments = comments,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = rejectedBy
        };

        _dbContext.AccessApprovals.Add(approval);
        await _dbContext.SaveChangesAsync(ct);

        // Create audit log
        var auditLog = new AccessReqAuditEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            AccessApproveId = approval.AccessApproveId,
            EventType = "REJECTED_IT",
            Message = $"Access request rejected by IT Admin: {rejectedBy}",
            RecipientEmpId = item.AccessReqId,
            RecipientName = "System",
            RecipientRole = "Employee",
            CreatedOn = DateTime.UtcNow,
            CreatedBy = rejectedBy
        };

        _dbContext.AccessAuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }

    public async Task<bool> RevokeAccessAsync(int accessReqId, int accessItemId, string revokedBy, CancellationToken ct)
    {
        var item = await _dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId && x.AccessReqId == accessReqId, ct);

        if (item == null)
            return false;

        item.Status = RequestStatus.Revoked;
        item.ModifiedOn = DateTime.UtcNow;
        item.ModifiedBy = revokedBy;

        await _dbContext.SaveChangesAsync(ct);

        // Create audit log
        var auditLog = new AccessReqAuditEntity
        {
            AccessReqId = accessReqId,
            AccessItemId = accessItemId,
            EventType = "REVOKED",
            Message = $"Access revoked by: {revokedBy}",
            RecipientEmpId = item.AccessReqId,
            RecipientName = "System",
            RecipientRole = "Employee",
            CreatedOn = DateTime.UtcNow,
            CreatedBy = revokedBy
        };

        _dbContext.AccessAuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }

    public async Task<List<AccessReqAuditDto>> GetAuditLogsAsync(int accessReqId, CancellationToken ct)
    {
        var auditLogs = await _dbContext.AccessAuditLogs
            .AsNoTracking()
            .Where(x => x.AccessReqId == accessReqId)
            .OrderByDescending(x => x.CreatedOn)
            .ToListAsync(ct);

        return auditLogs.Select(MapAuditToDto).ToList();
    }

    private static AccessRequestDto MapToDto(AccessRequestEntity entity)
    {
        return new AccessRequestDto
        {
            AccessReqId = entity.AccessReqId,
            EmpId = entity.EmpId,
            ReqTo = entity.ReqTo,
            IsAgreed = entity.IsAgreed,
            ItsrNo = entity.ItsrNo,
            IsActive = entity.IsActive,
            CreatedOn = entity.CreatedOn,
            CreatedBy = entity.CreatedBy,
            ModifiedOn = entity.ModifiedOn,
            ModifiedBy = entity.ModifiedBy,
            AccessItems = entity.AccessItems.Select(x => new AccessItemDto
            {
                AccessItemId = x.AccessItemId,
                FolderPath = x.FolderPath,
                AccessType = x.AccessType,
                ConfirmAccessType = x.ConfirmAccessType,
                Reason = x.Reason,
                Status = x.Status,
                CreatedOn = x.CreatedOn,
                CreatedBy = x.CreatedBy,
                ModifiedOn = x.ModifiedOn,
                ModifiedBy = x.ModifiedBy
            }).ToList()
        };
    }

    private static AccessReqAuditDto MapAuditToDto(AccessReqAuditEntity entity)
    {
        return new AccessReqAuditDto
        {
            AuditId = entity.AuditId,
            AccessReqId = entity.AccessReqId,
            AccessItemId = entity.AccessItemId,
            AccessApproveId = entity.AccessApproveId,
            EventType = entity.EventType,
            Message = entity.Message,
            RecipientEmpId = entity.RecipientEmpId,
            RecipientName = entity.RecipientName,
            RecipientRole = entity.RecipientRole,
            IsRead = entity.IsRead,
            CreatedOn = entity.CreatedOn,
            CreatedBy = entity.CreatedBy,
            ModifiedOn = entity.ModifiedOn,
            ModifiedBy = entity.ModifiedBy
        };
    }
}
