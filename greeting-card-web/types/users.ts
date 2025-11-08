import type { PaginationResponse } from './api';
import type { User, UserRole } from './auth';

export type UpdateUserRequest = {
  fullName: string;
  phone?: string;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type UsersState = {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
};

export type AdminUserFilters = {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole | 'ALL';
};

export type AdminUpdateUserRequest = {
  fullName: string;
  phone?: string;
  role: UserRole;
};

export type AdminUserList = {
  users: User[];
  pagination: PaginationResponse;
};
