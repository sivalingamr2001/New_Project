import { apiClient } from "@/shared/lib/api-client";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface AuditLogDto {
  id: string;
  action: string;
  performer: string;
  performerRole: string;
  resourceType: string;
  resourceId: string;
  description: string;
  timestamp: string;
  changes?: Record<string, { oldValue?: string; newValue?: string }>;
}

export interface PagedAuditLogs {
  data: AuditLogDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const auditLogApi = {
  /**
   * Get paginated list of audit logs
   */
  getLogs: async (
    pageNumber: number = 1,
    pageSize: number = 25
  ): Promise<PagedAuditLogs> => {
    const response = await apiClient.get<PagedAuditLogs>(
      `/audit-logs?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data;
  },
};
