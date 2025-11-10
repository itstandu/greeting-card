import { apiClient } from './client';
import type { ApiResponse, ServiceResponse, UserAddress } from '@/types';

export type CreateAddressRequest = {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type UpdateAddressRequest = Partial<Omit<CreateAddressRequest, 'isDefault'>>;

// Get user's addresses
export const getMyAddresses = async (): Promise<ServiceResponse<UserAddress[]>> => {
  const response = await apiClient.get<ApiResponse<UserAddress[]>>('/addresses');
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Create new address
export const createAddress = async (
  request: CreateAddressRequest,
): Promise<ServiceResponse<UserAddress>> => {
  const response = await apiClient.post<ApiResponse<UserAddress>>('/addresses', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update address
export const updateAddress = async (
  id: number,
  request: UpdateAddressRequest,
): Promise<ServiceResponse<UserAddress>> => {
  const response = await apiClient.put<ApiResponse<UserAddress>>(`/addresses/${id}`, request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Delete address
export const deleteAddress = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/addresses/${id}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};

// Set address as default
export const setDefaultAddress = async (id: number): Promise<ServiceResponse<UserAddress>> => {
  const response = await apiClient.put<ApiResponse<UserAddress>>(`/addresses/${id}/set-default`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};
