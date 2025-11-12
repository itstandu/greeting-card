import { apiClient } from './client';
import {
  ApiResponse,
  Coupon,
  CreateCouponRequest,
  PaginationParams,
  ServiceResponse,
  UpdateCouponRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from '@/types';

// Spring Data Page response type
interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// === USER APIs ===

export async function validateCoupon(
  request: ValidateCouponRequest,
): Promise<ServiceResponse<ValidateCouponResponse>> {
  const response = await apiClient.post<ApiResponse<ValidateCouponResponse>>(
    '/coupons/validate',
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

// === ADMIN APIs ===

export async function getAllCoupons(params?: PaginationParams): Promise<ServiceResponse<Coupon[]>> {
  const response = await apiClient.get<ApiResponse<SpringPage<Coupon>>>('/admin/coupons', {
    params,
  });
  const page = response.data.data!;
  return {
    data: page.content,
    message: response.data.message,
    pagination: {
      page: page.number,
      size: page.size,
      total: page.totalElements,
      totalPages: page.totalPages,
    },
  };
}

export async function getCouponById(id: number): Promise<ServiceResponse<Coupon>> {
  const response = await apiClient.get<ApiResponse<Coupon>>(`/admin/coupons/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function getCouponByCode(code: string): Promise<ServiceResponse<Coupon>> {
  const response = await apiClient.get<ApiResponse<Coupon>>(`/admin/coupons/code/${code}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function createCoupon(data: CreateCouponRequest): Promise<ServiceResponse<Coupon>> {
  const response = await apiClient.post<ApiResponse<Coupon>>('/admin/coupons', data);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function updateCoupon(
  id: number,
  data: UpdateCouponRequest,
): Promise<ServiceResponse<Coupon>> {
  const response = await apiClient.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function deleteCoupon(id: number): Promise<ServiceResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/coupons/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}
