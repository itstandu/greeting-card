# Authentication Flow

## 1. Tổng Quan Authentication

Frontend application sử dụng **JWT (JSON Web Token)** authentication với:

- **accessToken:** Ngắn hạn (15 phút), lưu trong localStorage
- **refreshToken:** Dài hạn (7 ngày), lưu trong HTTP-only cookie

## 2. Authentication Flow Chi Tiết

### 2.1. Đăng Ký (Register)

**Flow:**

1. User điền form đăng ký
2. Frontend gửi request đến `/api/auth/register`
3. Backend tạo user mới và gửi email xác thực
4. Frontend hiển thị thông báo và chuyển đến trang verify email

**Implementation:**

```typescript
// components/auth/RegisterForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch } from '@/lib/store/hooks';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
      router.push('/auth/verify-email');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng ký thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

### 2.2. Xác Thực Email (Email Verification)

**Flow:**

1. User nhận email với link xác thực
2. Click link hoặc nhập token vào trang `/auth/verify-email`
3. Frontend gửi request đến `/api/auth/verify-email?token=...`
4. Backend xác thực token và set `emailVerified = true`
5. Frontend hiển thị thông báo thành công

**Implementation:**

```typescript
// app/auth/verify-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setIsVerifying(true);
      await authService.verifyEmail(token);
      setIsVerified(true);
      toast.success('Xác thực email thành công! Bạn có thể đăng nhập ngay.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xác thực email thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return <div>Đang xác thực email...</div>;
  }

  if (isVerified) {
    return <div>Email đã được xác thực thành công!</div>;
  }

  return <div>Vui lòng kiểm tra email và click vào link xác thực.</div>;
}
```

### 2.3. Đăng Nhập (Login)

**Flow:**

1. User điền email và password
2. Frontend gửi request đến `/api/auth/login`
3. Backend kiểm tra credentials và email đã xác thực
4. Backend tạo accessToken và refreshToken
5. Backend set refreshToken vào HTTP-only cookie
6. Backend trả về accessToken trong response body
7. Frontend lưu accessToken vào localStorage
8. Frontend sync cart từ localStorage lên server
9. Frontend redirect đến trang chủ hoặc trang trước đó

**Implementation:**

```typescript
// lib/store/slices/auth.slice.ts
export const loginUser = createAsyncThunk(
  'auth/login',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(request);
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        throw new Error('Không nhận được access token');
      }

      // Save accessToken to localStorage
      setAccessToken(accessToken);

      // Sync cart from localStorage to server
      try {
        await syncCartAfterLogin();
      } catch (syncError) {
        console.error('Failed to sync cart:', syncError);
        // Don't block login if cart sync fails
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  },
);
```

### 2.4. Refresh Token Mechanism

**Flow:**

1. User thực hiện API request với accessToken
2. Nếu accessToken hết hạn (401), interceptor tự động gọi `/api/auth/refresh`
3. Backend kiểm tra refreshToken từ HTTP-only cookie
4. Backend tạo accessToken mới và trả về
5. Frontend lưu accessToken mới vào localStorage
6. Frontend retry request ban đầu với accessToken mới
7. Nếu refresh thất bại, clear token và tiếp tục như guest

**Implementation:**

```typescript
// services/client.ts
let refreshRequest: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshRequest) {
    refreshRequest = apiClient
      .post<ApiResponse<TokenResponse>>('/auth/refresh')
      .then(response => {
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

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return apiClient(originalRequest);
      } catch {
        setAccessToken(null);
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
```

### 2.5. Get Current User

**Flow:**

1. App load, `useAuth` hook được gọi
2. Hook dispatch `getCurrentUser` thunk
3. Thunk gửi request đến `/api/auth/me` với accessToken
4. Nếu 401, interceptor tự động refresh token và retry
5. Backend trả về user info
6. Frontend update Redux state với user info

**Implementation:**

```typescript
// lib/store/slices/auth.slice.ts
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      // If 401, user is not authenticated (token expired or invalid)
      // This is expected for guest users, so we don't treat it as an error
      if (error instanceof Error && error.message.includes('401')) {
        return null;
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi xác thực');
    }
  },
);

// hooks/use-auth.ts
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

### 2.6. Đăng Xuất (Logout)

**Flow:**

1. User click nút "Đăng xuất"
2. Frontend gửi request đến `/api/auth/logout`
3. Backend xóa refreshToken từ database và cookie
4. Frontend xóa accessToken khỏi localStorage
5. Frontend clear Redux state
6. Frontend redirect đến trang chủ

**Implementation:**

```typescript
// lib/store/slices/auth.slice.ts
export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    clearAccessToken();
    return null;
  } catch (error) {
    // Even if logout fails on server, clear local state
    clearAccessToken();
    return rejectWithValue(error instanceof Error ? error.message : 'Đăng xuất thất bại');
  }
});

// hooks/use-auth.ts
export function useAuth() {
  const dispatch = useAppDispatch();
  const { logout: logoutAction } = authSlice.actions;

  const logout = async () => {
    await dispatch(logoutUser());
    // Additional cleanup if needed
  };

  return {
    // ... other returns
    logout,
  };
}
```

## 3. Protected Routes

### 3.1. ProtectedRoute Component

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, router]);

  if (isLoading || !hasCheckedAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 3.2. AdminRoute Component

```typescript
// components/auth/AdminRoute.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasCheckedAuth && !isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, user, router]);

  if (isLoading || !hasCheckedAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
```

## 4. Token Storage

### 4.1. AccessToken (localStorage)

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

### 4.2. RefreshToken (HTTP-only Cookie)

- Được set bởi backend trong HTTP-only cookie
- Tự động gửi với mọi request (withCredentials: true)
- Không thể truy cập từ JavaScript (bảo mật hơn)

## 5. Security Best Practices

### 5.1. Token Security

- **AccessToken:** Lưu trong localStorage (có thể truy cập từ JavaScript)
- **RefreshToken:** Lưu trong HTTP-only cookie (không thể truy cập từ JavaScript)
- **XSS Protection:** React tự động escape HTML
- **CSRF Protection:** SameSite cookies

### 5.2. Route Protection

- Client-side protection cho UX
- Server-side validation là bắt buộc
- Không trust client-side checks

### 5.3. Error Handling

- Không expose technical details trong error messages
- User-friendly error messages
- Log errors để debug

## 6. Testing Strategies

### 6.1. Unit Tests

```typescript
// __tests__/hooks/use-auth.test.ts
import { useAuth } from '@/hooks/use-auth';
import { renderHook } from '@testing-library/react';

describe('useAuth', () => {
  it('returns auth state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### 6.2. Integration Tests

```typescript
// __tests__/auth/login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

describe('LoginForm', () => {
  it('submits login form', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    // Assertions
  });
});
```

## 7. Troubleshooting

### 7.1. Token Not Found

- Kiểm tra localStorage có accessToken
- Kiểm tra cookie có refreshToken
- Clear và login lại

### 7.2. Refresh Token Failed

- Kiểm tra refreshToken cookie
- Kiểm tra backend API
- Clear tokens và login lại

### 7.3. 401 Unauthorized

- Token đã hết hạn
- Refresh token mechanism không hoạt động
- Backend validation failed
