using Janatics.Domain.Enums;

namespace Janatics.Application.Features.AccessRequests.Dtos;

public class AccessItemDto
{
    public int AccessItemId { get; set; }
    public string FolderPath { get; set; } = string.Empty;
    public AccessTypes AccessType { get; set; }
    public AccessTypes ConfirmAccessType { get; set; }
    public string Reason { get; set; } = string.Empty;
    public RequestStatus Status { get; set; }
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ModifiedOn { get; set; }
    public string? ModifiedBy { get; set; }
}

public class AccessRequestDto
{
    public int AccessReqId { get; set; }
    public int EmpId { get; set; }
    public int ReqTo { get; set; }
    public bool IsAgreed { get; set; }
    public string? ItsrNo { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ModifiedOn { get; set; }
    public string? ModifiedBy { get; set; }
    public List<AccessItemDto> AccessItems { get; set; } = new();
}

public class CreateAccessRequestDto
{
    public int EmpId { get; set; }
    public int ReqTo { get; set; }
    public bool IsAgreed { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public List<CreateAccessItemDto> AccessItems { get; set; } = new();
}

public class CreateAccessItemDto
{
    public string FolderPath { get; set; } = string.Empty;
    public AccessTypes AccessType { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
}

public class UpdateAccessRequestStatusDto
{
    public int AccessReqId { get; set; }
    public int AccessItemId { get; set; }
    public RequestStatus Status { get; set; }
    public string Comments { get; set; } = string.Empty;
    public string ModifiedBy { get; set; } = string.Empty;
}

public class RevokeAccessRequestDto
{
    public int AccessItemId { get; set; }
    public string RevokedBy { get; set; } = string.Empty;
}

public class AccessApprovalDto
{
    public int AccessApproveId { get; set; }
    public int AccessReqId { get; set; }
    public int AccessItemId { get; set; }
    public int ApproverId { get; set; }
    public RequestStatus ApprovalStatus { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ModifiedOn { get; set; }
    public string? ModifiedBy { get; set; }
}

public class AccessReqAuditDto
{
    public int AuditId { get; set; }
    public int AccessReqId { get; set; }
    public int? AccessItemId { get; set; }
    public int? AccessApproveId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int RecipientEmpId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientRole { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ModifiedOn { get; set; }
    public string? ModifiedBy { get; set; }
}
