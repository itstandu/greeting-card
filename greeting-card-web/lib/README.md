# Auth & Users Service - Documentation

## Cấu Trúc Dự Án

Dự án được tổ chức theo kiến trúc phân tầng rõ ràng, tách biệt client và server:

```
lib/
├── api/
│   ├── client.ts              # Axios client với interceptors
│   └── services/
│       ├── auth.service.ts    # Auth API services
│       ├── users.service.ts   # Users API services
│       └── index.ts           # Service exports
├── store/
│   ├── auth/
│   │   └── auth.slice.ts      # Auth Redux slice
│   ├── users/
│   │   └── users.slice.ts     # Users Redux slice
│   ├── Provider.tsx           # Redux Provider component
│   ├── hooks.ts               # Typed Redux hooks
│   └── index.ts               # Store configuration
├── types/
│   ├── api.ts                 # API response types
│   ├── auth.ts                # Auth types
│   ├── users.ts               # Users types
│   └── index.ts               # Type exports
└── hooks/
    └── use-auth.ts            # Custom auth hook
```

## Các Layer

### 1. Types Layer (`lib/types/`)

Định nghĩa tất cả các types và interfaces:

- `api.ts`: ApiResponse, PaginationResponse, etc.
- `auth.ts`: User, LoginRequest, RegisterRequest, AuthState, etc.
- `users.ts`: UpdateUserRequest, ChangePasswordRequest, UsersState, etc.

### 2. API Client Layer (`lib/api/`)

- `client.ts`: Axios instance với interceptors xử lý:
  - Request: Thêm credentials (cookies tự động)
  - Response: Error handling, token refresh tự động
  - Cookies được tự động gửi với `withCredentials: true`

### 3. Services Layer (`lib/api/services/`)

Tầng service chứa tất cả API calls:

- `auth.service.ts`: register, login, logout, verifyEmail, etc.
- `users.service.ts`: getUserById, updateUser, changePassword

### 4. Redux Store Layer (`lib/store/`)

- **Slices**: Quản lý state cho auth và users
- **Provider**: Redux Provider component
- **Hooks**: Typed hooks (useAppDispatch, useAppSelector)

### 5. Custom Hooks Layer (`lib/hooks/`)

- `use-auth.ts`: Hook tiện lợi để sử dụng auth state và actions

## Components

### Auth Components (`components/auth/`)

- `LoginForm.tsx`: Form đăng nhập
- `RegisterForm.tsx`: Form đăng ký
- `ProtectedRoute.tsx`: Component bảo vệ routes cần authentication
- `VerifyEmailPage.tsx`: Component xác thực email

### Users Components (`components/users/`)

- `UpdateProfileForm.tsx`: Form cập nhật thông tin cá nhân
- `ChangePasswordForm.tsx`: Form đổi mật khẩu

## Cách Sử Dụng

### 1. Sử dụng Auth Hook

```tsx
import { useAuth } from '@/lib/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <p>Hello, {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Sử dụng Redux Store trực tiếp

```tsx
import { loginUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Success
    } catch (err) {
      // Handle error
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### 3. Bảo vệ Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### 4. Sử dụng Services trực tiếp

```tsx
import { getCurrentUser } from '@/lib/api/services/auth.service';

async function fetchUser() {
  try {
    const user = await getCurrentUser();
    console.log(user);
  } catch (error) {
    console.error(error);
  }
}
```

## Environment Variables

Thêm vào `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Best Practices

1. **Luôn sử dụng hooks**: Dùng `useAuth()` thay vì truy cập store trực tiếp
2. **Error Handling**: Luôn wrap async calls trong try-catch
3. **Loading States**: Hiển thị loading state khi đang fetch data
4. **Protected Routes**: Sử dụng `ProtectedRoute` cho các trang cần auth
5. **Type Safety**: Sử dụng types từ `lib/types` để đảm bảo type safety

## Notes

- Refresh token được lưu trong HTTP-only cookie, access token quản lý bởi Redux store
- Token refresh được xử lý tự động trong axios interceptor
- Tất cả forms sử dụng react-hook-form với zod validation
- UI components tái sử dụng từ `components/ui`
- Sử dụng padding/margin thay vì space utilities của Tailwind
