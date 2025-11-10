import { apiClient } from './client';
import type {
  ApiResponse,
  Payment,
  ProcessPaymentRequest,
  RefundPaymentRequest,
  ServiceResponse,
} from '@/types';

export const processPayment = async (
  request: ProcessPaymentRequest,
): Promise<ServiceResponse<Payment>> => {
  const response = await apiClient.post<ApiResponse<Payment>>('/payments/process', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const refundPayment = async (
  request: RefundPaymentRequest,
): Promise<ServiceResponse<Payment>> => {
  const response = await apiClient.post<ApiResponse<Payment>>('/payments/refund', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getUserPayments = async (): Promise<ServiceResponse<Payment[]>> => {
  const response = await apiClient.get<ApiResponse<Payment[]>>('/payments');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getPaymentById = async (id: number): Promise<ServiceResponse<Payment>> => {
  const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getOrderPayments = async (orderId: number): Promise<ServiceResponse<Payment[]>> => {
  const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};
