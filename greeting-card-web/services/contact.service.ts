import { apiClient } from './client';
import type {
  ApiResponse,
  ContactFilters,
  ContactListResponse,
  ContactMessage,
  ContactStatus,
  CreateContactRequest,
  PaginatedApiResponse,
  ServiceResponse,
  UpdateContactStatusRequest,
} from '@/types';

export const submitContact = async (
  request: CreateContactRequest,
): Promise<ServiceResponse<ContactMessage>> => {
  const response = await apiClient.post<ApiResponse<ContactMessage>>('/contacts', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const getAdminContacts = async (
  filters?: ContactFilters,
): Promise<ContactListResponse & { pagination?: PaginatedApiResponse<ContactMessage>['pagination'] }> => {
  const searchParams = new URLSearchParams();
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.category) searchParams.append('category', filters.category);
  if (filters?.search) searchParams.append('search', filters.search);
  if (filters?.page) searchParams.append('page', filters.page.toString());
  if (filters?.size) searchParams.append('size', filters.size.toString());
  if (filters?.sortBy) searchParams.append('sortBy', filters.sortBy);
  if (filters?.sortDir) searchParams.append('sortDir', filters.sortDir);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response =
      await apiClient.get<PaginatedApiResponse<ContactMessage>>(`/admin/contacts${query}`);

  return {
    data: response.data.data || [],
    message: response.data.message,
    pagination: response.data.pagination,
  };
};

export const getAdminContactById = async (
  id: number,
): Promise<ServiceResponse<ContactMessage>> => {
  const response = await apiClient.get<ApiResponse<ContactMessage>>(`/admin/contacts/${id}`);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const updateAdminContactStatus = async (
  id: number,
  status: ContactStatus,
): Promise<ServiceResponse<ContactMessage>> => {
  const payload: UpdateContactStatusRequest = { status };
  const response = await apiClient.put<ApiResponse<ContactMessage>>(
    `/admin/contacts/${id}/status`,
    payload,
  );
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

export const deleteAdminContact = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/contacts/${id}`);
  return {
    data: undefined,
    message: response.data.message,
  };
};

