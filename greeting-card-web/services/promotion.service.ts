import { apiClient } from './client';
import {
  ApiResponse,
  CreatePromotionRequest,
  PaginationParams,
  Promotion,
  ServiceResponse,
  UpdatePromotionRequest,
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

export async function getActivePromotions(): Promise<ServiceResponse<Promotion[]>> {
  const response = await apiClient.get<ApiResponse<Promotion[]>>('/promotions/active');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

// === ADMIN APIs ===

export async function getAllPromotions(
  params?: PaginationParams,
): Promise<ServiceResponse<Promotion[]>> {
  const response = await apiClient.get<ApiResponse<SpringPage<Promotion>>>('/admin/promotions', {
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

export async function getPromotionById(id: number): Promise<ServiceResponse<Promotion>> {
  const response = await apiClient.get<ApiResponse<Promotion>>(`/admin/promotions/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function createPromotion(
  data: CreatePromotionRequest,
): Promise<ServiceResponse<Promotion>> {
  const response = await apiClient.post<ApiResponse<Promotion>>('/admin/promotions', data);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function updatePromotion(
  id: number,
  data: UpdatePromotionRequest,
): Promise<ServiceResponse<Promotion>> {
  const response = await apiClient.put<ApiResponse<Promotion>>(`/admin/promotions/${id}`, data);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}

export async function deletePromotion(id: number): Promise<ServiceResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/promotions/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
}
