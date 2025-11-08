import { getAccessToken, setAccessToken } from './token-manager';
import type { ApiResponse, TokenResponse } from '@/types';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Check if the request URL is an auth endpoint
const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/verify',
    '/auth/resend-verification',
  ];
  return authPaths.some(path => url.includes(path));
};

// Check if the request URL is /auth/me (handled by thunk, not interceptor)
const isAuthMeEndpoint = (url?: string): boolean => {
  return url?.includes('/auth/me') ?? false;
};

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for refreshToken cookies
});

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try refresh token once, then continue as guest if failed. Skip /auth/me endpoint - it's handled by getCurrentUser thunk
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url) &&
      !isAuthMeEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token once
        await refreshAccessToken();
        // Retry request with new token
        return apiClient(originalRequest);
      } catch {
        // Refresh failed - clear token and retry as guest (without Authorization header)
        setAccessToken(null);
        // Remove Authorization header to continue as guest
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        // Retry request without token (as guest)
        return apiClient(originalRequest);
      }
    }

    // Extract error message from API response
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Đã có lỗi xảy ra. Vui lòng thử lại.';

    // Create Error instance to ensure instanceof Error check works
    const apiError = new Error(errorMessage);
    (apiError as Error & { code?: string; response?: unknown; isAxiosError?: boolean }).code =
      error.response?.data?.error?.code ||
      (error.response?.data as { errorCode?: string })?.errorCode;
    (apiError as Error & { response?: unknown }).response = error.response;

    return Promise.reject(apiError);
  },
);

let refreshRequest: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshRequest) {
    refreshRequest = apiClient
      .post<ApiResponse<TokenResponse>>('/auth/refresh')
      .then(response => {
        const newToken = response.data.data?.accessToken ?? null;
        if (!newToken) {
          throw new Error('Không nhận được access token mới');
        }
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};
