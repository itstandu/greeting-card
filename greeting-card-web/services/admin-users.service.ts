import { apiClient } from './client';
import type {
  AdminUpdateUserRequest,
  AdminUserFilters,
  ApiResponse,
  PaginationResponse,
  ServiceResponse,
  User,
} from '@/types';

export type AdminUserListResponse = {
  users: User[];
  pagination: PaginationResponse;
};

// Lấy danh sách người dùng (admin)
export const getUsers = async (
  filters: AdminUserFilters = {},
): Promise<ServiceResponse<AdminUserListResponse>> => {
  const params = {
    page: filters.page ?? 1,
    size: filters.size ?? 10,
    search: filters.search || undefined,
    role: filters.role && filters.role !== 'ALL' ? filters.role : undefined,
  };

  const response = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params });

  const pagination: PaginationResponse = response.data.pagination || {
    page: params.page ?? 1,
    size: params.size ?? 10,
    total: response.data.data?.length ?? 0,
    totalPages: 1,
  };

  return {
    data: {
      users: response.data.data ?? [],
      pagination,
    },
    message: response.data.message,
  };
};

// Lấy thông tin chi tiết người dùng (admin)
export const getAdminUserById = async (id: number): Promise<ServiceResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  return {
    data: response.data.data as User,
    message: response.data.message,
  };
};

// Cập nhật người dùng (admin)
export const updateAdminUser = async (
  id: number,
  payload: AdminUpdateUserRequest,
): Promise<ServiceResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, payload);
  return {
    data: response.data.data as User,
    message: response.data.message,
  };
};

// Xóa người dùng
export const deleteUser = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};
