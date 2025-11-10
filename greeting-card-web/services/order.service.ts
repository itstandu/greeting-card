import { apiClient } from './client';
import type {
  ApiResponse,
  CreateOrderRequest,
  Order,
  OrderSimple,
  OrderStatusHistory,
  PaginationParams,
  ServiceResponse,
  UpdateOrderStatusRequest,
} from '@/types';

// Tạo đơn hàng mới từ giỏ hàng
export const createOrder = async (request: CreateOrderRequest): Promise<ServiceResponse<Order>> => {
  const response = await apiClient.post<ApiResponse<Order>>('/orders', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Lấy danh sách đơn hàng của user (phân trang)
export const getUserOrders = async (
  params?: PaginationParams,
): Promise<ServiceResponse<OrderSimple[]>> => {
  const response = await apiClient.get<ApiResponse<OrderSimple[]>>('/orders', { params });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (orderId: number): Promise<ServiceResponse<Order>> => {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Lấy lịch sử trạng thái đơn hàng
export const getOrderStatusHistory = async (
  orderId: number,
): Promise<ServiceResponse<OrderStatusHistory[]>> => {
  const response = await apiClient.get<ApiResponse<OrderStatusHistory[]>>(
    `/orders/${orderId}/status-history`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// === ADMIN APIs ===

// Admin: Lấy tất cả đơn hàng
export const getAllOrders = async (
  params?: PaginationParams & { status?: string },
): Promise<ServiceResponse<OrderSimple[]>> => {
  const response = await apiClient.get<ApiResponse<OrderSimple[]>>('/admin/orders', { params });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Admin: Tìm kiếm đơn hàng
export const searchOrders = async (
  keyword: string,
  params?: PaginationParams,
): Promise<ServiceResponse<OrderSimple[]>> => {
  const response = await apiClient.get<ApiResponse<OrderSimple[]>>('/admin/orders/search', {
    params: { keyword, ...params },
  });
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Admin: Lấy chi tiết đơn hàng
export const getOrderDetailAdmin = async (orderId: number): Promise<ServiceResponse<Order>> => {
  const response = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${orderId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Lấy lịch sử trạng thái đơn hàng
export const getOrderStatusHistoryAdmin = async (
  orderId: number,
): Promise<ServiceResponse<OrderStatusHistory[]>> => {
  const response = await apiClient.get<ApiResponse<OrderStatusHistory[]>>(
    `/admin/orders/${orderId}/status-history`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (
  orderId: number,
  request: UpdateOrderStatusRequest,
): Promise<ServiceResponse<Order>> => {
  const response = await apiClient.put<ApiResponse<Order>>(
    `/admin/orders/${orderId}/status`,
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Admin: Cập nhật số lượng sản phẩm trong đơn hàng
export const updateOrderItemQuantity = async (
  orderId: number,
  itemId: number,
  quantity: number,
): Promise<ServiceResponse<Order>> => {
  const response = await apiClient.put<ApiResponse<Order>>(
    `/admin/orders/${orderId}/items/${itemId}`,
    { quantity },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};
