import { apiClient } from './client';
import { enrichProductsWithWishlistStatus } from '@/lib/utils/product-enricher';
import type {
  ApiResponse,
  CreateProductRequest,
  PaginationResponse,
  Product,
  ProductFilters,
  ServiceResponse,
  UpdateProductRequest,
} from '@/types';

export type ProductListResponse = {
  products: Product[];
  pagination: PaginationResponse;
};

// Get products with pagination and filters
export const getProducts = async (
  filters?: ProductFilters,
  isAuthenticated: boolean = false,
): Promise<ServiceResponse<ProductListResponse>> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.size) params.append('size', filters.size.toString());
  if (filters?.search) params.append('keyword', filters.search);
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters?.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortDir) params.append('sortDir', filters.sortDir);

  const response = await apiClient.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);

  // Enrich products with wishlist status from localStorage for guest users
  const products = enrichProductsWithWishlistStatus(response.data.data!, isAuthenticated);

  return {
    data: {
      products,
      pagination: response.data.pagination!,
    },
    message: response.data.message,
  };
};

// Get product by slug
export const getProductBySlug = async (
  slug: string,
  isAuthenticated: boolean = false,
): Promise<ServiceResponse<Product>> => {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`);
  const product = response.data.data!;

  // Enrich product with wishlist status from localStorage for guest users
  const enrichedProduct = enrichProductsWithWishlistStatus([product], isAuthenticated)[0];

  return {
    data: enrichedProduct,
    message: response.data.message,
  };
};

// Get product by ID
export const getProductById = async (
  id: number,
  isAuthenticated: boolean = false,
): Promise<ServiceResponse<Product>> => {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/id/${id}`);
  const product = response.data.data!;

  // Enrich product with wishlist status from localStorage for guest users
  const enrichedProduct = enrichProductsWithWishlistStatus([product], isAuthenticated)[0];

  return {
    data: enrichedProduct,
    message: response.data.message,
  };
};

// Create product
export const createProduct = async (
  request: CreateProductRequest,
): Promise<ServiceResponse<Product>> => {
  const response = await apiClient.post<ApiResponse<Product>>('/products', request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Update product
export const updateProduct = async (
  id: number,
  request: UpdateProductRequest,
): Promise<ServiceResponse<Product>> => {
  const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, request);
  return {
    data: response.data.data!,
    message: response.data.message,
  };
};

// Delete product
export const deleteProduct = async (id: number): Promise<ServiceResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
  return {
    data: undefined as void,
    message: response.data.message,
  };
};
