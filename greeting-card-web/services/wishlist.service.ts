import { apiClient } from './client';
import type {
  AddToWishlistRequest,
  ApiResponse,
  PaginationParams,
  ServiceResponse,
  SyncWishlistRequest,
  WishlistResponse,
  WishlistSummary,
} from '@/types';

// Lấy wishlist hiện tại từ server
export const getWishlist = async (): Promise<ServiceResponse<WishlistResponse>> => {
  const response = await apiClient.get<ApiResponse<WishlistResponse>>('/wishlist');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Thêm sản phẩm vào wishlist
export const addToWishlist = async (
  request: AddToWishlistRequest,
): Promise<ServiceResponse<WishlistResponse>> => {
  const response = await apiClient.post<ApiResponse<WishlistResponse>>('/wishlist/add', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Xóa sản phẩm khỏi wishlist
export const removeWishlistItem = async (productId: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/wishlist/items/${productId}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Xóa toàn bộ wishlist
export const clearWishlist = async (): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>('/wishlist');
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Sync wishlist từ localStorage lên server khi user login
export const syncWishlist = async (
  request: SyncWishlistRequest,
): Promise<ServiceResponse<WishlistResponse>> => {
  const response = await apiClient.post<ApiResponse<WishlistResponse>>('/wishlist/sync', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Kiểm tra sản phẩm có trong wishlist không
export const checkInWishlist = async (productId: number): Promise<ServiceResponse<boolean>> => {
  const response = await apiClient.get<ApiResponse<boolean>>(`/wishlist/check/${productId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// === ADMIN APIs ===

// Admin: Lấy tất cả wishlist (phân trang)
export const getAllWishlists = async (
  params?: PaginationParams,
): Promise<ServiceResponse<WishlistSummary[]>> => {
  const response = await apiClient.get<ApiResponse<WishlistSummary[]>>('/admin/wishlists', {
    params,
  });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Admin: Tìm kiếm wishlist theo email hoặc tên user
export const searchWishlists = async (
  keyword: string,
  params?: PaginationParams,
): Promise<ServiceResponse<WishlistSummary[]>> => {
  const response = await apiClient.get<ApiResponse<WishlistSummary[]>>('/admin/wishlists/search', {
    params: { keyword, ...params },
  });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Admin: Xem chi tiết wishlist theo ID
export const getWishlistById = async (
  wishlistId: number,
): Promise<ServiceResponse<WishlistResponse>> => {
  const response = await apiClient.get<ApiResponse<WishlistResponse>>(
    `/admin/wishlists/${wishlistId}`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Xem wishlist của một user cụ thể
export const getUserWishlist = async (
  userId: number,
): Promise<ServiceResponse<WishlistResponse>> => {
  const response = await apiClient.get<ApiResponse<WishlistResponse>>(
    `/admin/wishlists/user/${userId}`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Xóa wishlist của user (hỗ trợ khách hàng)
export const clearUserWishlist = async (userId: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/wishlists/user/${userId}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};
