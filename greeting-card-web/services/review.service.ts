import { apiClient } from './client';
import type {
  ApiResponse,
  CreateReviewRequest,
  PaginatedApiResponse,
  ProductReview,
  ProductReviewStats,
  RejectReviewRequest,
  ReviewFilters,
  ServiceResponse,
  UpdateReviewRequest,
} from '@/types';

// Get product reviews (public - approved only)
export const getProductReviews = async (
  productId: number,
  params?: { rating?: number; page?: number; size?: number },
): Promise<
  ServiceResponse<ProductReview[]> & {
    pagination?: PaginatedApiResponse<ProductReview>['pagination'];
  }
> => {
  const searchParams = new URLSearchParams();
  if (params?.rating) searchParams.append('rating', params.rating.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.size) searchParams.append('size', params.size.toString());

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await apiClient.get<PaginatedApiResponse<ProductReview>>(
    `/products/${productId}/reviews${query}`,
  );
  return {
    data: response.data.data || [],
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Get product review stats
export const getProductReviewStats = async (
  productId: number,
): Promise<ServiceResponse<ProductReviewStats>> => {
  const response = await apiClient.get<ApiResponse<ProductReviewStats>>(
    `/products/${productId}/reviews/stats`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Create product review (customer)
export const createProductReview = async (
  productId: number,
  request: CreateReviewRequest,
): Promise<ServiceResponse<ProductReview>> => {
  const response = await apiClient.post<ApiResponse<ProductReview>>(
    `/products/${productId}/reviews`,
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update product review (customer - own review)
export const updateProductReview = async (
  productId: number,
  reviewId: number,
  request: UpdateReviewRequest,
): Promise<ServiceResponse<ProductReview>> => {
  const response = await apiClient.put<ApiResponse<ProductReview>>(
    `/products/${productId}/reviews/${reviewId}`,
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Delete product review (customer - own review)
export const deleteProductReview = async (
  productId: number,
  reviewId: number,
): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/products/${productId}/reviews/${reviewId}`,
  );
  return {
    data: undefined,
    message: response.data.message,
  };
};

// Check if user has reviewed product
export const hasUserReviewedProduct = async (
  productId: number,
): Promise<ServiceResponse<boolean>> => {
  const response = await apiClient.get<ApiResponse<boolean>>(`/reviews/check/${productId}`);
  return {
    data: response.data.data || false,
    message: response.data.message,
  };
};

// Check if user can review product (has purchased and not reviewed yet)
export const canUserReviewProduct = async (
  productId: number,
): Promise<ServiceResponse<boolean>> => {
  const response = await apiClient.get<ApiResponse<boolean>>(`/reviews/can-review/${productId}`);
  return {
    data: response.data.data || false,
    message: response.data.message,
  };
};

// ============ ADMIN REVIEW ENDPOINTS ============

// Get all reviews (admin)
export const getAdminReviews = async (
  filters?: ReviewFilters,
): Promise<
  ServiceResponse<ProductReview[]> & {
    pagination?: PaginatedApiResponse<ProductReview>['pagination'];
  }
> => {
  const searchParams = new URLSearchParams();
  if (filters?.productId) searchParams.append('productId', filters.productId.toString());
  if (filters?.isApproved !== undefined)
    searchParams.append('isApproved', filters.isApproved.toString());
  if (filters?.rating) searchParams.append('rating', filters.rating.toString());
  if (filters?.search) searchParams.append('search', filters.search);
  if (filters?.page) searchParams.append('page', filters.page.toString());
  if (filters?.size) searchParams.append('size', filters.size.toString());
  if (filters?.sortBy) searchParams.append('sortBy', filters.sortBy);
  if (filters?.sortDir) searchParams.append('sortDir', filters.sortDir);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await apiClient.get<PaginatedApiResponse<ProductReview>>(
    `/admin/reviews${query}`,
  );
  return {
    data: response.data.data || [],
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Get review by ID (admin)
export const getAdminReviewById = async (
  reviewId: number,
): Promise<ServiceResponse<ProductReview>> => {
  const response = await apiClient.get<ApiResponse<ProductReview>>(`/admin/reviews/${reviewId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Approve review (admin)
export const approveReview = async (reviewId: number): Promise<ServiceResponse<ProductReview>> => {
  const response = await apiClient.put<ApiResponse<ProductReview>>(
    `/admin/reviews/${reviewId}/approve`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Reject review (admin)
export const rejectReview = async (
  reviewId: number,
  request: RejectReviewRequest,
): Promise<ServiceResponse<ProductReview>> => {
  const response = await apiClient.put<ApiResponse<ProductReview>>(
    `/admin/reviews/${reviewId}/reject`,
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Delete review (admin)
export const deleteAdminReview = async (reviewId: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/reviews/${reviewId}`);
  return {
    data: undefined,
    message: response.data.message,
  };
};
