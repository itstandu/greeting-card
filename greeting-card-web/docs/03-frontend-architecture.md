# Kiến Trúc Frontend

## 1. Tổng Quan Kiến Trúc

Dự án sử dụng **Next.js 16 App Router** kết hợp với **React 19** và **TypeScript** để xây dựng frontend application cho hệ thống bán thiệp trực tuyến.

## 2. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (UI)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Pages (App Router)                        │  │
│  │  - Server Components (default)                    │  │
│  │  - Client Components ('use client')               │  │
│  │  - Layouts                                        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Components (React)                       │  │
│  │  - UI Components (shadcn/ui)                     │  │
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
│  │  - Cart Slice                                    │  │
│  │  - UI Slice                                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Custom Hooks                             │  │
│  │  - useAuth                                       │  │
│  │  - useDebounce                                   │  │
│  │  - useWishlist                                   │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Service Layer                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │         API Services                              │  │
│  │  - auth.service.ts                                │  │
│  │  - product.service.ts                             │  │
│  │  - cart.service.ts                                │  │
│  │  - order.service.ts                               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         API Client (Axios)                       │  │
│  │  - Request Interceptors                           │  │
│  │  - Response Interceptors                          │  │
│  │  - Token Management                               │  │
│  │  - Error Handling                                 │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Backend API (Spring Boot)                  │
└─────────────────────────────────────────────────────────┘
```

## 3. Cấu Trúc Thư Mục

### 3.1. App Directory (Next.js App Router)

```
app/
├── layout.tsx                 # Root layout (Server Component)
├── page.tsx                   # Home page (Server Component)
├── globals.css                # Global styles
├── not-found.tsx              # 404 page
├── auth/                      # Authentication routes
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx
│   └── resend-verification/
│       └── page.tsx
├── admin/                     # Admin routes
│   ├── layout.tsx             # Admin layout với sidebar
│   ├── page.tsx               # Dashboard
│   ├── products/
│   │   └── page.tsx
│   ├── orders/
│   │   └── page.tsx
│   └── ...
├── products/                  # Product routes
│   ├── page.tsx               # Product list
│   └── [slug]/
│       └── page.tsx           # Product detail
├── categories/                # Category routes
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── cart/                      # Cart page
│   └── page.tsx
├── checkout/                  # Checkout routes
│   ├── page.tsx
│   └── payment/
│       └── page.tsx
└── ...
```

### 3.2. Components Directory

```
components/
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── auth/                      # Auth components
│   ├── ProtectedRoute.tsx
│   ├── AdminRoute.tsx
│   ├── GuestRoute.tsx
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── admin/                     # Admin components
│   ├── AdminSidebar.tsx
│   ├── dashboard/
│   ├── products/
│   └── ...
├── product/                   # Product components
│   ├── ProductCard.tsx
│   ├── ProductDetail.tsx
│   └── ...
├── cart/                      # Cart components
│   └── CartItemCard.tsx
├── Header.tsx                 # Header component
├── HeaderWrapper.tsx          # Header wrapper (client)
└── FooterWrapper.tsx           # Footer wrapper
```

### 3.3. Services Directory

```
services/
├── client.ts                  # Axios instance với interceptors
├── token-manager.ts           # Token management utilities
├── auth.service.ts            # Auth API calls
├── product.service.ts         # Product API calls
├── cart.service.ts            # Cart API calls
├── order.service.ts           # Order API calls
├── category.service.ts        # Category API calls
└── ...
```

### 3.4. Lib Directory

```
lib/
├── store/                     # Redux store
│   ├── index.ts              # Store configuration
│   ├── Provider.tsx          # Redux Provider
│   ├── hooks.ts              # Typed hooks
│   └── slices/               # Redux slices
│       ├── auth.slice.ts
│       └── ...
├── utils/                     # Utility functions
│   ├── cn.ts                 # className utility
│   ├── cart-sync.ts          # Cart sync utilities
│   └── ...
└── constants/                 # Constants
    └── ...
```

### 3.5. Types Directory

```
types/
├── index.ts                  # Re-export all types
├── api.ts                    # API response types
├── auth.ts                   # Auth types
├── product.ts                # Product types
├── cart.ts                   # Cart types
├── order.ts                  # Order types
└── ...
```

### 3.6. Hooks Directory

```
hooks/
├── use-auth.ts               # Auth hook
├── use-debounce.ts           # Debounce hook
├── use-mobile.ts             # Mobile detection hook
├── use-toast.ts              # Toast hook
└── use-wishlist.ts           # Wishlist hook
```

## 4. Component Architecture

### 4.1. Server Components vs Client Components

**Server Components (Default):**
- Render trên server
- Không có JavaScript bundle
- Có thể truy cập database trực tiếp
- Không thể sử dụng hooks, event handlers
- Sử dụng cho static content, data fetching

**Client Components ('use client'):**
- Render trên client
- Có JavaScript bundle
- Có thể sử dụng hooks, event handlers
- Sử dụng cho interactive components

**Ví dụ:**

```typescript
// app/page.tsx - Server Component
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';

export default function Home() {
  return (
    <div>
      <FeaturedProductsSection />
    </div>
  );
}
```

```typescript
// components/auth/LoginForm.tsx - Client Component
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  // ... form logic
}
```

### 4.2. Component Patterns

#### Container/Presentational Pattern

```typescript
// Container Component (Client)
'use client';

import { ProductList } from './ProductList';
import { useProducts } from '@/hooks/use-products';

export function ProductsPageClient() {
  const { products, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <ProductList products={products} />;
}
```

```typescript
// Presentational Component
interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Compound Components Pattern

```typescript
// components/ui/card.tsx
export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-lg border', className)}>{children}</div>;
}

Card.Header = function CardHeader({ children }: CardHeaderProps) {
  return <div className="p-6">{children}</div>;
};

Card.Content = function CardContent({ children }: CardContentProps) {
  return <div className="p-6 pt-0">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

## 5. State Management

### 5.1. Redux Toolkit Architecture

```
lib/store/
├── index.ts                  # Store configuration
├── Provider.tsx              # Redux Provider component
├── hooks.ts                  # Typed hooks (useAppDispatch, useAppSelector)
└── slices/
    ├── auth.slice.ts         # Auth state
    ├── cart.slice.ts          # Cart state (if needed)
    └── ui.slice.ts            # UI state (if needed)
```

### 5.2. Auth Slice Example

```typescript
// lib/store/slices/auth.slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
}

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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
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

### 5.3. Local State vs Global State

**Local State (useState):**
- Component-specific state
- Form inputs
- UI toggles
- Temporary data

**Global State (Redux):**
- User authentication
- Cart (if needed globally)
- Theme preferences
- Global UI state

## 6. Routing và Navigation

### 6.1. App Router Structure

Next.js 16 sử dụng **App Router** với file-based routing:

- `app/page.tsx` → `/`
- `app/products/page.tsx` → `/products`
- `app/products/[slug]/page.tsx` → `/products/:slug`
- `app/admin/layout.tsx` → Layout cho tất cả `/admin/**` routes

### 6.2. Route Protection

```typescript
// app/checkout/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}
```

### 6.3. Dynamic Routes

```typescript
// app/product/[slug]/page.tsx
interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  return <ProductDetail product={product} />;
}
```

## 7. Data Fetching

### 7.1. Server Components (Recommended)

```typescript
// app/products/page.tsx
import { productService } from '@/services/product.service';

export default async function ProductsPage() {
  const products = await productService.getAllProducts();

  return <ProductsList products={products} />;
}
```

### 7.2. Client Components

```typescript
// components/products/ProductsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 7.3. React Query (Optional)

Có thể sử dụng React Query cho data fetching và caching:

```typescript
import { useQuery } from '@tanstack/react-query';

export function ProductsList() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* render products */}</div>;
}
```

## 8. Styling Architecture

### 8.1. Tailwind CSS

- Utility-first CSS framework
- Responsive design với breakpoints
- Dark mode support
- Custom theme configuration

### 8.2. Component Styling

```typescript
// Using Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold">Title</h2>
</div>

// Using cn utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center',
  isActive && 'bg-blue-500',
  className
)}>
  Content
</div>
```

### 8.3. shadcn/ui Components

- Pre-built accessible components
- Customizable với Tailwind
- Based on Radix UI primitives

## 9. Form Handling

### 9.1. React Hook Form + Zod

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        Đăng nhập
      </button>
    </form>
  );
}
```

## 10. Error Handling

### 10.1. Error Boundaries

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

### 10.2. API Error Handling

```typescript
// services/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle 401 - try refresh token
    }

    const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);
```

## 11. Performance Optimization

### 11.1. Code Splitting

- Automatic với Next.js App Router
- Dynamic imports cho heavy components

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### 11.2. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={500}
  priority // For above-the-fold images
/>
```

### 11.3. Lazy Loading

- Automatic với Next.js
- Lazy load components below the fold

## 12. SEO

### 12.1. Metadata API

```typescript
// app/products/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}
```

### 12.2. Sitemap

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
    },
    // ... more URLs
  ];
}
```

