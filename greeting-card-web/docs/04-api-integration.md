# Tích Hợp API

## 1. Tổng Quan

Frontend application tích hợp với RESTful API backend thông qua **Axios** HTTP client với các tính năng:
- Request/Response interceptors
- Automatic token management
- Refresh token mechanism
- Error handling
- Type-safe API calls

## 2. API Client Configuration

### 2.1. Axios Instance

```typescript
// services/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for refreshToken cookies
});
```

### 2.2. Request Interceptor

Thêm accessToken vào mọi request:

```typescript
// services/client.ts
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### 2.3. Response Interceptor

Xử lý errors và refresh token:

```typescript
// services/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await refreshAccessToken();
        // Retry request with new token
        return apiClient(originalRequest);
      } catch {
        // Refresh failed - clear token and continue as guest
        setAccessToken(null);
        // Remove Authorization header to continue as guest
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        // Retry request without token (as guest)
        return apiClient(originalRequest);
      }
    }

    // Extract error message from API response
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Đã có lỗi xảy ra. Vui lòng thử lại.';

    // Create Error instance
    const apiError = new Error(errorMessage);
    (apiError as Error & { code?: string }).code =
      error.response?.data?.error?.code;

    return Promise.reject(apiError);
  }
);
```

## 3. Token Management

### 3.1. Token Storage

```typescript
// services/token-manager.ts
const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function clearAccessToken(): void {
  setAccessToken(null);
}
```

### 3.2. Refresh Token Mechanism

```typescript
// services/client.ts
let refreshRequest: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshRequest) {
    refreshRequest = apiClient
      .post<ApiResponse<TokenResponse>>('/auth/refresh')
      .then((response) => {
        const newToken = response.data.data?.accessToken ?? null;
        if (!newToken) {
          throw new Error('Không nhận được access token mới');
        }
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};
```

**Lưu ý:**
- refreshToken được lưu trong HTTP-only cookie (tự động gửi với requests)
- Chỉ refresh một lần nếu có nhiều requests cùng lúc (singleton pattern)
- Nếu refresh thất bại, clear token và tiếp tục như guest

## 4. Service Layer

### 4.1. Service Structure

Mỗi domain có một service file riêng:

```
services/
├── client.ts              # Axios instance
├── token-manager.ts        # Token utilities
├── auth.service.ts         # Auth API
├── product.service.ts      # Product API
├── cart.service.ts         # Cart API
├── order.service.ts        # Order API
├── category.service.ts     # Category API
└── ...
```

### 4.2. Auth Service Example

```typescript
// services/auth.service.ts
import { apiClient } from './client';
import type { ApiResponse, LoginRequest, RegisterRequest, User, TokenResponse } from '@/types';

export const authService = {
  async register(request: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', request);
    return response.data;
  },

  async login(request: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', request);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh');
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    const response = await apiClient.get<ApiResponse<void>>(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/resend-verification', { email });
    return response.data;
  },
};
```

### 4.3. Product Service Example

```typescript
// services/product.service.ts
import { apiClient } from './client';
import type { ApiResponse, Product, ProductListParams } from '@/types';

export const productService = {
  async getAllProducts(params?: ProductListParams): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  },

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/slug/${slug}`);
    return response.data;
  },

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/search', {
      params: { q: query },
    });
    return response.data;
  },
};
```

### 4.4. Cart Service Example

```typescript
// services/cart.service.ts
import { apiClient } from './client';
import type { ApiResponse, Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types';

export const cartService = {
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },

  async addToCart(request: AddToCartRequest): Promise<ApiResponse<Cart>> {
    const response = await apiClient.post<ApiResponse<Cart>>('/cart/add', request);
    return response.data;
  },

  async updateCartItem(itemId: number, request: UpdateCartItemRequest): Promise<ApiResponse<Cart>> {
    const response = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, request);
    return response.data;
  },

  async removeCartItem(itemId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>('/cart');
    return response.data;
  },
};
```

## 5. Type Definitions

### 5.1. API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
```

### 5.2. Request/Response Types

```typescript
// types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
}

export interface TokenResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'ADMIN';
  emailVerified: boolean;
}
```

## 6. Error Handling

### 6.1. Error Types

```typescript
// types/service.ts
export interface ServiceError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiError extends Error {
  code?: string;
  status?: number;
  response?: unknown;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}
```

### 6.2. Error Handling in Components

```typescript
'use client';

import { useState } from 'react';
import { productService } from '@/services/product.service';
import { toast } from 'sonner';

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productService.getAllProducts();
        setProducts(response.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* render products */}</div>;
}
```

### 6.3. Global Error Handler

```typescript
// lib/utils/error-handler.ts
import { toast } from 'sonner';

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    // Check for specific error codes
    if (error.message.includes('401')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (error.message.includes('403')) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (error.message.includes('404')) {
      return 'Không tìm thấy dữ liệu.';
    }
    if (error.message.includes('500')) {
      return 'Lỗi server. Vui lòng thử lại sau.';
    }
    return error.message;
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function showApiError(error: unknown): void {
  const message = handleApiError(error);
  toast.error(message);
}
```

## 7. Loading States

### 7.1. Loading State Management

```typescript
'use client';

import { useState } from 'react';

export function ProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      await productService.createProduct(data);
      toast.success('Tạo sản phẩm thành công');
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Tạo sản phẩm'}
      </button>
    </form>
  );
}
```

## 8. Request Cancellation

### 8.1. AbortController

```typescript
'use client';

import { useEffect, useRef } from 'react';

export function ProductsList() {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    async function fetchProducts() {
      try {
        const response = await productService.getAllProducts();
        // Handle response
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request cancelled');
          return;
        }
        // Handle other errors
      }
    }

    fetchProducts();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
}
```

## 9. Request Retry

### 9.1. Retry Logic

```typescript
// lib/utils/retry.ts
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// Usage
const products = await retryRequest(() => productService.getAllProducts());
```

## 10. API Response Caching

### 10.1. Simple Cache

```typescript
// lib/utils/cache.ts
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Usage
const cacheKey = 'products';
let products = getCachedData<Product[]>(cacheKey);

if (!products) {
  const response = await productService.getAllProducts();
  products = response.data || [];
  setCachedData(cacheKey, products);
}
```

## 11. Best Practices

### 11.1. Service Organization

- Mỗi domain có một service file riêng
- Export named exports thay vì default export
- Type-safe với TypeScript
- Consistent error handling

### 11.2. Error Messages

- User-friendly error messages
- Không expose technical details
- Consistent error format

### 11.3. Loading States

- Hiển thị loading indicator cho async operations
- Disable buttons khi đang submit
- Optimistic updates khi có thể

### 11.4. Token Management

- Không lưu token trong code
- Clear token khi logout
- Handle token expiration gracefully

### 11.5. Request Optimization

- Debounce search requests
- Cancel pending requests khi component unmount
- Cache responses khi có thể
- Pagination cho large datasets

