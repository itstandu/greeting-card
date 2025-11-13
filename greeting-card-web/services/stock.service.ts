import { apiClient } from './client';
import type {
  ApiResponse,
  CreateStockTransactionRequest,
  PaginationParams,
  ServiceResponse,
  StockTransaction,
  StockTransactionFilters,
} from '@/types';

// Tạo giao dịch nhập/xuất kho
export const createStockTransaction = async (
  request: CreateStockTransactionRequest,
): Promise<ServiceResponse<StockTransaction>> => {
  const response = await apiClient.post<ApiResponse<StockTransaction>>(
    '/admin/stock-transactions',
    request,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Lấy danh sách giao dịch kho
export const getStockTransactions = async (
  params?: StockTransactionFilters,
): Promise<ServiceResponse<StockTransaction[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  if (params?.productId) queryParams.append('productId', params.productId.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.keyword) queryParams.append('keyword', params.keyword);

  const response = await apiClient.get<ApiResponse<StockTransaction[]>>(
    `/admin/stock-transactions?${queryParams.toString()}`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

// Lấy chi tiết giao dịch kho
export const getStockTransaction = async (
  id: number,
): Promise<ServiceResponse<StockTransaction>> => {
  const response = await apiClient.get<ApiResponse<StockTransaction>>(
    `/admin/stock-transactions/${id}`,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Lấy lịch sử giao dịch của sản phẩm
export const getProductStockHistory = async (
  productId: number,
  params?: PaginationParams,
): Promise<ServiceResponse<StockTransaction[]>> => {
  const response = await apiClient.get<ApiResponse<StockTransaction[]>>(
    `/admin/stock-transactions/products/${productId}`,
    { params },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
    pagination: response.data.pagination,
  };
};
