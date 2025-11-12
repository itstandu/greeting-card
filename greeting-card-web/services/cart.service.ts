import { apiClient } from './client';
import type {
  AddToCartRequest,
  ApiResponse,
  CartResponse,
  CartSummary,
  PaginationParams,
  ServiceResponse,
  SyncCartRequest,
  UpdateCartItemRequest,
} from '@/types';

// Lấy giỏ hàng hiện tại từ server
export const getCart = async (): Promise<ServiceResponse<CartResponse>> => {
  const response = await apiClient.get<ApiResponse<CartResponse>>('/cart');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (
  request: AddToCartRequest,
): Promise<ServiceResponse<CartResponse>> => {
  const response = await apiClient.post<ApiResponse<CartResponse>>('/cart/add', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (
  productId: number,
  request: UpdateCartItemRequest,
): Promise<ServiceResponse<CartResponse>> => {
  const response = await apiClient.put<ApiResponse<CartResponse>>(
    `/cart/items/${productId}`,
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = async (productId: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/cart/items/${productId}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>('/cart');
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Sync giỏ hàng từ localStorage lên server khi user login
export const syncCart = async (
  request: SyncCartRequest,
): Promise<ServiceResponse<CartResponse>> => {
  const response = await apiClient.post<ApiResponse<CartResponse>>('/cart/sync', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// === ADMIN APIs ===

// Admin: Lấy tất cả giỏ hàng (phân trang)
export const getAllCarts = async (
  params?: PaginationParams,
): Promise<ServiceResponse<CartSummary[]>> => {
  const response = await apiClient.get<ApiResponse<CartSummary[]>>('/admin/carts', { params });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Admin: Tìm kiếm giỏ hàng theo email hoặc tên user
export const searchCarts = async (
  keyword: string,
  params?: PaginationParams,
): Promise<ServiceResponse<CartSummary[]>> => {
  const response = await apiClient.get<ApiResponse<CartSummary[]>>('/admin/carts/search', {
    params: { keyword, ...params },
  });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Admin: Xem chi tiết giỏ hàng theo ID
export const getCartById = async (cartId: number): Promise<ServiceResponse<CartResponse>> => {
  const response = await apiClient.get<ApiResponse<CartResponse>>(`/admin/carts/${cartId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Xem giỏ hàng của một user cụ thể
export const getUserCart = async (userId: number): Promise<ServiceResponse<CartResponse>> => {
  const response = await apiClient.get<ApiResponse<CartResponse>>(`/admin/carts/user/${userId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Xóa giỏ hàng của user (hỗ trợ khách hàng)
export const clearUserCart = async (userId: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/carts/user/${userId}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};
