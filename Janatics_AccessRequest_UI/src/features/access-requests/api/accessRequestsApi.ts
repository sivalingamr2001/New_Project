import { apiClient } from "@/shared/lib/api-client";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface AccessItemDto {
  accessItemId: number;
  folderPath: string;
  accessType: number;
  confirmAccessType: number;
  reason: string;
  status: number;
  createdOn: string;
  createdBy: string;
  modifiedOn?: string;
  modifiedBy?: string;
}

export interface AccessRequestDto {
  accessReqId: number;
  empId: number;
  reqTo: number;
  isAgreed: boolean;
  itsrNo?: string;
  isActive: boolean;
  createdOn: string;
  createdBy: string;
  modifiedOn?: string;
  modifiedBy?: string;
  accessItems: AccessItemDto[];
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateAccessRequestDto {
  empId: number;
  reqTo: number;
  isAgreed: boolean;
  createdBy: string;
  accessItems: CreateAccessItemDto[];
}

export interface CreateAccessItemDto {
  folderPath: string;
  accessType: number;
  reason: string;
  createdBy: string;
}

export interface UpdateAccessRequestStatusDto {
  accessReqId: number;
  accessItemId: number;
  status: number;
  comments: string;
  modifiedBy: string;
}

export interface AccessReqAuditDto {
  auditId: number;
  accessReqId: number;
  accessItemId?: number;
  accessApproveId?: number;
  eventType: string;
  message: string;
  recipientEmpId: number;
  recipientName: string;
  recipientRole: string;
  isRead: boolean;
  createdOn: string;
  createdBy: string;
  modifiedOn?: string;
  modifiedBy?: string;
}

export interface PagedAccessRequests {
  data: AccessRequestDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const accessRequestApi = {
  /**
   * Get paginated list of access requests
   */
  getRequests: async (
    pageNumber: number = 1,
    pageSize: number = 25
  ): Promise<PagedResult<AccessRequestDto>> => {
    const response = await apiClient.get<{ data: PagedResult<AccessRequestDto> }>(
      `/access-requests?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data.data;
  },

  /**
   * Get access request details
   */
  getRequestDetails: async (requestId: number): Promise<AccessRequestDto> => {
    const response = await apiClient.get<{ data: AccessRequestDto }>(
      `/access-requests/${requestId}`
    );
    return response.data.data;
  },

  /**
   * Create new access request
   */
  createRequest: async (dto: CreateAccessRequestDto): Promise<AccessRequestDto> => {
    const response = await apiClient.post<{ data: AccessRequestDto }>(
      "/access-requests",
      dto
    );
    return response.data.data;
  },

  /**
   * Review request as HOD
   */
  reviewByHod: async (
    requestId: number,
    dto: UpdateAccessRequestStatusDto
  ): Promise<AccessRequestDto> => {
    const response = await apiClient.post<{ data: AccessRequestDto }>(
      `/access-requests/${requestId}/review-hod`,
      dto
    );
    return response.data.data;
  },

  /**
   * Review request as IT
   */
  reviewByIt: async (
    requestId: number,
    dto: UpdateAccessRequestStatusDto
  ): Promise<AccessRequestDto> => {
    const response = await apiClient.post<{ data: AccessRequestDto }>(
      `/access-requests/${requestId}/review-it`,
      dto
    );
    return response.data.data;
  },

  /**
   * Get audit logs for a request
   */
  getAuditLogs: async (requestId: number): Promise<AccessReqAuditDto[]> => {
    const response = await apiClient.get<{ data: AccessReqAuditDto[] }>(
      `/access-requests/${requestId}/audit`
    );
    return response.data.data;
  },

  /**
   * Renew an approved request
   */
  renewRequest: async (requestId: number): Promise<AccessRequestDto> => {
    const response = await apiClient.post<{ data: AccessRequestDto }>(
      `/access-requests/${requestId}/renew`,
      {}
    );
    return response.data.data;
  },

  /**
   * Resubmit a rejected request
   */
  resubmitRequest: async (
    requestId: number,
    dto: CreateAccessItemDto
  ): Promise<AccessRequestDto> => {
    const response = await apiClient.post<{ data: AccessRequestDto }>(
      `/access-requests/${requestId}/resubmit`,
      dto
    );
    return response.data.data;
  },

  /**
   * Revoke an approved request
   */
  revokeRequest: async (
    requestId: number,
    dto: { accessItemId: number; revokedBy: string }
  ): Promise<AccessRequestDto> => {
    const response = await apiClient.post<{ data: AccessRequestDto }>(
      `/access-requests/${requestId}/revoke`,
      dto
    );
    return response.data.data;
  },
};
