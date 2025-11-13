import { apiClient } from './client';
import type { ApiResponse, Notification, ServiceResponse, UnreadCount } from '@/types';

export const getUserNotifications = async (
  page: number = 1,
  size: number = 20,
  isRead?: boolean,
  type?: 'ORDER' | 'PRODUCT' | 'SYSTEM',
): Promise<ServiceResponse<Notification[]>> => {
  const params: Record<string, string | number> = { page, size };
  if (isRead !== undefined) params.isRead = isRead.toString();
  if (type) params.type = type;

  const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications', { params });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

export const getUnreadCount = async (): Promise<ServiceResponse<UnreadCount>> => {
  const response = await apiClient.get<ApiResponse<UnreadCount>>('/notifications/unread-count');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const markAsRead = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`);
  return {
    data: undefined,
    message: response.data.message,
  };
};

export const markAllAsRead = async (): Promise<ServiceResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>('/notifications/read-all');
  return {
    data: undefined,
    message: response.data.message,
  };
};
