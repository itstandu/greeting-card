import { apiClient } from './client';
import type {
  ApiResponse,
  CreatePaymentMethodRequest,
  PaginatedApiResponse,
  PaymentMethod,
  ServiceResponse,
  UpdatePaymentMethodOrderRequest,
  UpdatePaymentMethodRequest,
} from '@/types';

// Get active payment methods (public)
export const getPaymentMethods = async (): Promise<ServiceResponse<PaymentMethod[]>> => {
  const response = await apiClient.get<ApiResponse<PaymentMethod[]>>('/payment-methods');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// ============ ADMIN PAYMENT METHOD ENDPOINTS ============

export type PaymentMethodFilters = {
  search?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

// Get all payment methods (admin)
export const getAdminPaymentMethods = async (
  filters?: PaymentMethodFilters,
): Promise<
  ServiceResponse<PaymentMethod[]> & {
    pagination?: PaginatedApiResponse<PaymentMethod>['pagination'];
  }
> => {
  const searchParams = new URLSearchParams();
  if (filters?.search) searchParams.append('search', filters.search);
  if (filters?.isActive !== undefined) searchParams.append('isActive', filters.isActive.toString());
  if (filters?.page) searchParams.append('page', filters.page.toString());
  if (filters?.size) searchParams.append('size', filters.size.toString());
  if (filters?.sortBy) searchParams.append('sortBy', filters.sortBy);
  if (filters?.sortDir) searchParams.append('sortDir', filters.sortDir);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await apiClient.get<PaginatedApiResponse<PaymentMethod>>(
    `/admin/payment-methods${query}`,
  );
  return {
    data: response.data.data || [],
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Get payment method by ID (admin)
export const getAdminPaymentMethodById = async (
  id: number,
): Promise<ServiceResponse<PaymentMethod>> => {
  const response = await apiClient.get<ApiResponse<PaymentMethod>>(`/admin/payment-methods/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Create payment method (admin)
export const createPaymentMethod = async (
  request: CreatePaymentMethodRequest,
): Promise<ServiceResponse<PaymentMethod>> => {
  const response = await apiClient.post<ApiResponse<PaymentMethod>>(
    '/admin/payment-methods',
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update payment method (admin)
export const updatePaymentMethod = async (
  id: number,
  request: UpdatePaymentMethodRequest,
): Promise<ServiceResponse<PaymentMethod>> => {
  const response = await apiClient.put<ApiResponse<PaymentMethod>>(
    `/admin/payment-methods/${id}`,
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Toggle payment method status (admin)
export const togglePaymentMethodStatus = async (
  id: number,
): Promise<ServiceResponse<PaymentMethod>> => {
  const response = await apiClient.put<ApiResponse<PaymentMethod>>(
    `/admin/payment-methods/${id}/toggle-status`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update payment method ordering (admin)
export const updatePaymentMethodOrdering = async (
  request: UpdatePaymentMethodOrderRequest,
): Promise<ServiceResponse<PaymentMethod[]>> => {
  const response = await apiClient.put<ApiResponse<PaymentMethod[]>>(
    '/admin/payment-methods/reorder',
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Delete payment method (admin)
export const deletePaymentMethod = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/payment-methods/${id}`);
  return {
    data: undefined,
    message: response.data.message,
  };
};
