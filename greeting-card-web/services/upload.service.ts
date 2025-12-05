import { apiClient } from './client';
import type { ApiResponse, ServiceResponse } from '@/types';

export type UploadResponse = {
  url?: string;
  urls?: string[];
  folder: string;
  count?: number;
};

// Upload một file lên Cloudinary
export const uploadFile = async (
  file: File,
  folder: 'products' | 'categories' | 'users' | 'reviews' | 'general',
): Promise<ServiceResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await apiClient.post<ApiResponse<UploadResponse>>('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Upload nhiều file lên Cloudinary
export const uploadFiles = async (
  files: File[],
  folder: 'products' | 'categories' | 'users' | 'reviews' | 'general',
): Promise<ServiceResponse<UploadResponse>> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const response = await apiClient.post<ApiResponse<UploadResponse>>('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Upload hình ảnh sản phẩm (convenience method)
export const uploadProductImage = async (
  file: File,
  productId?: number,
): Promise<ServiceResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (productId) {
    formData.append('productId', productId.toString());
  }

  const response = await apiClient.post<ApiResponse<UploadResponse>>('/upload/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Upload nhiều hình ảnh sản phẩm (convenience method)
export const uploadProductImages = async (
  files: File[],
): Promise<ServiceResponse<UploadResponse>> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await apiClient.post<ApiResponse<UploadResponse>>(
    '/upload/products/multiple',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Upload avatar người dùng (convenience method)
export const uploadUserAvatar = async (file: File): Promise<ServiceResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<UploadResponse>>('/upload/users', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Upload hình ảnh danh mục (convenience method)
export const uploadCategoryImage = async (file: File): Promise<ServiceResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<UploadResponse>>(
    '/upload/categories',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Xóa file trên Cloudinary
export const deleteFile = async (urlOrPublicId: string): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>('/upload', {
    params: { urlOrPublicId },
  });

  return {
    data: undefined as void,
    message: response.data.message,
  };
};
