import { apiClient } from './client';
import type {
  ApiResponse,
  ChangePasswordRequest,
  ServiceResponse,
  UpdateUserRequest,
  User,
} from '@/types';

// Get user by ID
export const getUserById = async (id: number): Promise<ServiceResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update current user profile
export const updateUser = async (request: UpdateUserRequest): Promise<ServiceResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>('/users/me', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Change user password
export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<ServiceResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>('/users/me/password', request);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};
