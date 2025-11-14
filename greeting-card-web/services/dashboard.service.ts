import { apiClient } from './client';
import type {
  ApiResponse,
  BestSellingProduct,
  CategorySales,
  CustomerGrowth,
  DashboardStats,
  LowStockProduct,
  OrderSimple,
  OrderStatusDistribution,
  RevenueSummary,
  ServiceResponse,
} from '@/types';

export const getDashboardStats = async (): Promise<ServiceResponse<DashboardStats>> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getRevenueSummary = async (
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30,
): Promise<ServiceResponse<RevenueSummary[]>> => {
  const response = await apiClient.get<ApiResponse<RevenueSummary[]>>(
    '/admin/dashboard/revenue-summary',
    {
      params: { period, days },
    },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getLatestOrders = async (
  limit: number = 10,
): Promise<ServiceResponse<OrderSimple[]>> => {
  const response = await apiClient.get<ApiResponse<OrderSimple[]>>(
    '/admin/dashboard/latest-orders',
    {
      params: { limit },
    },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getBestSellingProducts = async (
  limit: number = 10,
): Promise<ServiceResponse<BestSellingProduct[]>> => {
  const response = await apiClient.get<ApiResponse<BestSellingProduct[]>>(
    '/admin/dashboard/best-selling-products',
    {
      params: { limit },
    },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getLowStockProducts = async (
  threshold: number = 10,
  limit: number = 10,
): Promise<ServiceResponse<LowStockProduct[]>> => {
  const response = await apiClient.get<ApiResponse<LowStockProduct[]>>(
    '/admin/dashboard/low-stock-products',
    {
      params: { threshold, limit },
    },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getOrderStatusDistribution = async (): Promise<
  ServiceResponse<OrderStatusDistribution[]>
> => {
  const response = await apiClient.get<ApiResponse<OrderStatusDistribution[]>>(
    '/admin/dashboard/order-status-distribution',
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getCategorySales = async (): Promise<ServiceResponse<CategorySales[]>> => {
  const response = await apiClient.get<ApiResponse<CategorySales[]>>(
    '/admin/dashboard/category-sales',
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getCustomerGrowth = async (
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30,
): Promise<ServiceResponse<CustomerGrowth[]>> => {
  const response = await apiClient.get<ApiResponse<CustomerGrowth[]>>(
    '/admin/dashboard/customer-growth',
    {
      params: { period, days },
    },
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};
