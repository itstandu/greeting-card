# Kiến Trúc Kỹ Thuật

## 1. Tổng Quan Kiến Trúc

Dự án sử dụng **Next.js 16 App Router** kết hợp với **React 19** và **TypeScript** để xây dựng frontend application cho hệ thống bán thiệp trực tuyến.

## 2. Kiến Trúc Phân Lớp

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (UI)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Pages (App Router)                        │  │
│  │  - Server Components (default)                   │  │
│  │  - Client Components ('use client')               │  │
│  │  - Layouts                                        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Components (React)                       │  │
│  │  - UI Components (shadcn/ui)                    │  │
│  │  - Feature Components                            │  │
│  │  - Layout Components                             │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Application Layer                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         State Management (Redux Toolkit)         │  │
│  │  - Auth Slice                                    │  │
│  │  - Cart Slice (if needed)                        │  │
│  │  - UI Slice (if needed)                          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Custom Hooks                           │  │
│  │  - useAuth                                      │  │
│  │  - useDebounce                                  │  │
│  │  - useWishlist                                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Form Handling                           │  │
│  │  - React Hook Form                              │  │
│  │  - Zod Validation                               │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Service Layer                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │         API Services                             │  │
│  │  - auth.service.ts                                │  │
│  │  - product.service.ts                             │  │
│  │  - cart.service.ts                                │  │
│  │  - order.service.ts                               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         API Client (Axios)                      │  │
│  │  - Request Interceptors                          │  │
│  │  - Response Interceptors                         │  │
│  │  - Token Management                              │  │
│  │  - Error Handling                                │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Backend API (Spring Boot)                  │
└─────────────────────────────────────────────────────────┘
```

## 3. Các Thành Phần Chính

### 3.1. Presentation Layer (Pages & Components)

**Trách nhiệm:**
- Render UI
- Handle user interactions
- Display data
- Form handling

**Pages (App Router):**
- Server Components: Data fetching, SEO
- Client Components: Interactivity, hooks

**Components:**
- UI Components: Reusable, generic components
- Feature Components: Domain-specific components
- Layout Components: Page structure

### 3.2. Application Layer (State & Logic)

**State Management:**
- Redux Toolkit cho global state
- React useState cho local state
- Custom hooks cho reusable logic

**Form Handling:**
- React Hook Form cho form management
- Zod cho schema validation
- Type-safe form handling

### 3.3. Service Layer (API Integration)

**API Services:**
- Domain-specific service functions
- Type-safe API calls
- Error handling

**API Client:**
- Axios instance với interceptors
- Token management
- Request/Response transformation

## 4. Next.js 16 App Router

### 4.1. App Router Features

- **File-based Routing:** Routes dựa trên file structure
- **Server Components:** Default, render trên server
- **Client Components:** 'use client' directive
- **Layouts:** Shared UI across routes
- **Loading States:** loading.tsx
- **Error Handling:** error.tsx
- **Metadata API:** SEO optimization

### 4.2. Server Components vs Client Components

**Server Components:**
- Render trên server
- Không có JavaScript bundle
- Có thể fetch data trực tiếp
- Không thể sử dụng hooks, event handlers
- Sử dụng cho static content, data fetching

**Client Components:**
- Render trên client
- Có JavaScript bundle
- Có thể sử dụng hooks, event handlers
- Sử dụng cho interactive components

### 4.3. Data Fetching

**Server Components:**
```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await productService.getAllProducts();
  return <ProductsList products={products} />;
}
```

**Client Components:**
```typescript
'use client';

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getAllProducts().then(setProducts);
  }, []);

  return <div>{/* render */}</div>;
}
```

## 5. React Ecosystem Components

### 5.1. React 19

- **Concurrent Features:** Automatic batching, transitions
- **Server Components:** Built-in support
- **Suspense:** Loading states
- **Error Boundaries:** Error handling

### 5.2. Redux Toolkit

**Store Configuration:**
```typescript
// lib/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Typed Hooks:**
```typescript
// lib/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### 5.3. React Hook Form + Zod

**Form Schema:**
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

**Form Component:**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Handle login
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

## 6. Design Patterns

### 6.1. Component Composition

- **Container/Presentational:** Tách logic và presentation
- **Compound Components:** Components làm việc cùng nhau
- **Render Props:** Share logic giữa components

### 6.2. Custom Hooks

- **useAuth:** Authentication logic
- **useDebounce:** Debounce values
- **useWishlist:** Wishlist operations

### 6.3. Service Layer Pattern

- Tách API calls khỏi components
- Reusable service functions
- Type-safe API calls

## 7. Error Handling

### 7.1. Error Boundaries

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Đã có lỗi xảy ra!</h2>
      <button onClick={() => reset()}>Thử lại</button>
    </div>
  );
}
```

### 7.2. API Error Handling

- Global error handler trong Axios interceptor
- User-friendly error messages
- Toast notifications cho errors

## 8. Performance Optimization

### 8.1. Code Splitting

- Automatic với Next.js App Router
- Dynamic imports cho heavy components

### 8.2. Image Optimization

- Next.js Image component
- Automatic optimization
- Lazy loading

### 8.3. Caching

- API response caching
- Static page generation
- Incremental Static Regeneration (ISR)

## 9. Security

### 9.1. XSS Protection

- React tự động escape HTML
- Không sử dụng `dangerouslySetInnerHTML` trừ khi cần thiết

### 9.2. CSRF Protection

- SameSite cookies
- Token-based authentication

### 9.3. Input Validation

- Client-side validation với Zod
- Server-side validation (backend)

## 10. Testing Strategy

### 10.1. Unit Tests

- Test components với React Testing Library
- Test utilities và hooks

### 10.2. Integration Tests

- Test API integration
- Test user flows

### 10.3. E2E Tests

- Test critical user journeys
- Test authentication flow

## 11. Build & Deployment

### 11.1. Build Process

```bash
npm run build
```

- TypeScript compilation
- Next.js optimization
- Code splitting
- Asset optimization

### 11.2. Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 11.3. Deployment

- Static export (nếu cần)
- Server deployment với Node.js
- Vercel deployment (recommended)

