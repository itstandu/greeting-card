# Hướng Dẫn Triển Khai

## 1. Yêu Cầu Hệ Thống

### 1.1. Phần Mềm Cần Thiết

- **Node.js:** 18+ hoặc cao hơn
- **npm:** 9+ hoặc **yarn** hoặc **pnpm**
- **Git:** Để quản lý source code
- **IDE:** VS Code (recommended) với extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

### 1.2. Công Cụ Khác

- **Browser DevTools:** Chrome DevTools hoặc Firefox DevTools
- **Postman/Insomnia:** Để test API (optional)
- **Git:** Để quản lý source code

## 2. Cài Đặt Môi Trường

### 2.1. Clone Repository

```bash
git clone <repository-url>
cd greeting-card-web
```

### 2.2. Cài Đặt Dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 2.3. Cấu Hình Environment Variables

Tạo file `.env.local` trong thư mục root:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Lưu ý:** File `.env.local` nên được thêm vào `.gitignore` để không commit lên repository.

## 3. Cấu Trúc Thư Mục Đề Xuất

```
greeting-card-web/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── auth/                      # Auth pages
│   ├── admin/                     # Admin pages
│   ├── products/                  # Product pages
│   └── ...
├── components/                     # React Components
│   ├── ui/                        # shadcn/ui components
│   ├── auth/                      # Auth components
│   ├── admin/                     # Admin components
│   └── ...
├── services/                      # API Service Layer
│   ├── client.ts                  # Axios instance
│   ├── auth.service.ts
│   └── ...
├── lib/                           # Utilities & Config
│   ├── store/                     # Redux store
│   ├── utils/                     # Utility functions
│   └── constants/                 # Constants
├── hooks/                         # Custom React Hooks
├── types/                         # TypeScript Types
└── public/                        # Static assets
```

## 4. Các Bước Triển Khai

### 4.1. Bước 1: Setup Project

**Tạo Next.js Project:**

```bash
npx create-next-app@latest greeting-card-web --typescript --tailwind --app
```

**Cài đặt dependencies:**

```bash
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-hook-form @hookform/resolvers zod
npm install sonner
npm install lucide-react
npm install date-fns
```

**Cài đặt shadcn/ui:**

```bash
npx shadcn@latest init
```

### 4.2. Bước 2: Cấu Hình Redux Store

**Tạo store:**

```typescript
// lib/store/index.ts
import authReducer from './slices/auth.slice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Tạo typed hooks:**

```typescript
// lib/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

**Tạo Provider:**

```typescript
// lib/store/Provider.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from './index';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

**Wrap app với Provider:**

```typescript
// app/layout.tsx
import { StoreProvider } from '@/lib/store/Provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

### 4.3. Bước 3: Tạo API Client

**Tạo Axios instance:**

```typescript
// services/client.ts
import { getAccessToken } from './token-manager';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Handle errors
    return Promise.reject(error);
  },
);
```

**Tạo token manager:**

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
```

### 4.4. Bước 4: Tạo Auth Service

```typescript
// services/auth.service.ts
import { apiClient } from './client';
import type { ApiResponse, LoginRequest, RegisterRequest, TokenResponse, User } from '@/types';

export const authService = {
  async register(request: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', request);
    return response.data;
  },

  async login(request: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', request);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};
```

### 4.5. Bước 5: Tạo Auth Slice

```typescript
// lib/store/slices/auth.slice.ts
import * as authService from '@/services/auth.service';
import { setAccessToken } from '@/services/token-manager';
import type { AuthState, LoginRequest, RegisterRequest, User } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(request);
      setAccessToken(response.data?.accessToken ?? null);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.user ?? null;
        state.accessToken = action.payload?.accessToken ?? null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

### 4.6. Bước 6: Tạo useAuth Hook

```typescript
// hooks/use-auth.ts
import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, hasCheckedAuth } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!hasCheckedAuth && !isAuthenticated && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, isLoading, hasCheckedAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasCheckedAuth,
  };
}
```

### 4.7. Bước 7: Tạo Protected Route Component

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 4.8. Bước 8: Tạo Login Form

```typescript
// components/auth/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch } from '@/lib/store/hooks';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success('Đăng nhập thành công');
      // Redirect to home or previous page
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input {...register('email')} type="email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Mật khẩu</label>
        <input {...register('password')} type="password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
```

### 4.9. Bước 9: Tạo Product Service

```typescript
// services/product.service.ts
import { apiClient } from './client';
import type { ApiResponse, Product } from '@/types';

export const productService = {
  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data;
  },

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },
};
```

### 4.10. Bước 10: Tạo Product Page

```typescript
// app/products/page.tsx
import { productService } from '@/services/product.service';
import { ProductsList } from '@/components/product/ProductsList';

export default async function ProductsPage() {
  const response = await productService.getAllProducts();
  const products = response.data || [];

  return (
    <div>
      <h1>Sản phẩm</h1>
      <ProductsList products={products} />
    </div>
  );
}
```

## 5. Validation Rules

### 5.1. Form Validation với Zod

```typescript
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional(),
});
```

## 6. Testing

### 6.1. Unit Tests

```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
```

## 7. Checklist Triển Khai

### 7.1. Setup

- [ ] Cài đặt Node.js và npm
- [ ] Clone repository
- [ ] Cài đặt dependencies
- [ ] Cấu hình environment variables

### 7.2. Core Features

- [ ] Setup Redux store
- [ ] Tạo API client
- [ ] Tạo auth service và slice
- [ ] Tạo useAuth hook
- [ ] Tạo protected routes

### 7.3. Pages

- [ ] Home page
- [ ] Products page
- [ ] Product detail page
- [ ] Login/Register pages
- [ ] Cart page
- [ ] Checkout page
- [ ] Admin pages

### 7.4. Components

- [ ] UI components (shadcn/ui)
- [ ] Auth components
- [ ] Product components
- [ ] Cart components
- [ ] Admin components

### 7.5. Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (optional)

## 8. Lưu Ý Quan Trọng

1. **TypeScript:** Luôn sử dụng TypeScript cho type safety
2. **Error Handling:** Xử lý errors một cách graceful
3. **Loading States:** Hiển thị loading indicators
4. **Validation:** Validate ở cả client và server
5. **Security:** Không lưu sensitive data trong code
6. **Performance:** Optimize images, code splitting
7. **SEO:** Sử dụng Metadata API
8. **Accessibility:** Sử dụng semantic HTML, ARIA attributes

## 9. Troubleshooting

### 9.1. Build Errors

- Kiểm tra TypeScript errors: `npm run type:check`
- Kiểm tra ESLint errors: `npm run lint:check`
- Clear cache: `rm -rf .next node_modules && npm install`

### 9.2. API Connection Issues

- Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`
- Kiểm tra backend API đang chạy
- Kiểm tra CORS configuration

### 9.3. Authentication Issues

- Kiểm tra token trong localStorage
- Kiểm tra refresh token mechanism
- Kiểm tra API response format
