import { apiClient } from './client';
import type {
  ApiResponse,
  Category,
  CategoryFilters,
  CreateCategoryRequest,
  PaginationResponse,
  ServiceResponse,
  UpdateCategoryRequest,
} from '@/types';

export type CategoryListResponse = {
  categories: Category[];
  pagination: PaginationResponse;
};

// Get all categories (simple list for dropdowns)
export const getAllCategories = async (): Promise<ServiceResponse<Category[]>> => {
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Get categories with pagination and filters
export const getCategories = async (
  filters?: CategoryFilters,
): Promise<ServiceResponse<CategoryListResponse>> => {
  const params = new URLSearchParams();
  // Always include page and size to ensure paginated response
  params.append('page', (filters?.page || 1).toString());
  params.append('size', (filters?.size || 10).toString());
  if (filters?.search) params.append('keyword', filters.search);
  if (filters?.parentId) params.append('parentId', filters.parentId.toString());
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters?.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());

  const response = await apiClient.get<ApiResponse<Category[]>>(`/categories?${params.toString()}`);

  return {
    data: {
      categories: response.data.data!,
      pagination: response.data.pagination || {
        page: filters?.page || 1,
        size: filters?.size || 10,
        total: 0,
        totalPages: 0,
      },
    },
    message: response.data.message,
  };
};

// Get category by ID
export const getCategoryById = async (id: number): Promise<ServiceResponse<Category>> => {
  const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<ServiceResponse<Category>> => {
  const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Create category
export const createCategory = async (
  request: CreateCategoryRequest,
): Promise<ServiceResponse<Category>> => {
  const response = await apiClient.post<ApiResponse<Category>>('/categories', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update category
export const updateCategory = async (
  id: number,
  request: UpdateCategoryRequest,
): Promise<ServiceResponse<Category>> => {
  const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Delete category
export const deleteCategory = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};
