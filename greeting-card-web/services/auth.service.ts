import { apiClient } from './client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResendVerificationRequest,
  ServiceResponse,
  TokenResponse,
  User,
} from '@/types';

// Register a new user
export const register = async (request: RegisterRequest): Promise<ServiceResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>('/auth/register', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Login user
export const login = async (request: LoginRequest): Promise<ServiceResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Verify email with token
export const verifyEmail = async (token: string): Promise<ServiceResponse<void>> => {
  const response = await apiClient.get<ApiResponse<void>>('/auth/verify-email', {
    params: { token },
  });
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Resend verification email
export const resendVerification = async (
  request: ResendVerificationRequest,
): Promise<ServiceResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/resend-verification', request);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Refresh access token
export const refreshToken = async (): Promise<ServiceResponse<TokenResponse>> => {
  const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Logout user
export const logout = async (): Promise<ServiceResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Logout from all devices
export const logoutAll = async (userId: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/logout-all', null, {
    params: { userId },
  });
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<ServiceResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};
