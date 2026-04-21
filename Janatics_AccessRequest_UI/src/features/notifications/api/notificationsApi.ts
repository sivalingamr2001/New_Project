import { apiService, type ApiResponse } from "@/shared/lib/api-client";

interface ApiResult<T> {
  data: T;
  status?: number;
  message?: string;
}

interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedRequestId?: string;
  createdAt: string;
}

export interface PagedNotifications {
  data: NotificationDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const notificationApi = {
  /**
   * Get paginated list of notifications
   */
  getNotifications: async (
    pageNumber: number = 1,
    pageSize: number = 25
  ): Promise<PagedNotifications> => {
    const response = await apiService.get<ApiResult<PagedResult<NotificationDto>>>(
      `/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );

    const page = response.data.data;

    return {
      data: page.data,
      totalCount: page.totalCount,
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      totalPages: page.totalPages ?? Math.ceil(page.totalCount / page.pageSize),
      hasPreviousPage: page.hasPreviousPage ?? page.pageNumber > 1,
      hasNextPage: page.hasNextPage ?? page.pageNumber * page.pageSize < page.totalCount,
    };
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<NotificationDto> => {
    const response = await apiService.post<ApiResult<NotificationDto>>(
      `/notifications/${notificationId}/mark-read`
    );

    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const page = await notificationApi.getNotifications(1, 100);
    return page.data.filter((notification) => !notification.isRead).length;
  },
};
