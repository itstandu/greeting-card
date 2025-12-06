# Next.js Best Practices

## 1. App Router Patterns

### 1.1. Server Components (Default)

Sử dụng Server Components cho:

- Data fetching
- Static content
- SEO optimization
- Performance

```typescript
// app/products/page.tsx - Server Component
import { productService } from '@/services/product.service';

export default async function ProductsPage() {
  const response = await productService.getAllProducts();
  const products = response.data || [];

  return <ProductsList products={products} />;
}
```

### 1.2. Client Components

Chỉ sử dụng 'use client' khi cần:

- Event handlers
- React hooks (useState, useEffect, etc.)
- Browser APIs
- Interactive features

```typescript
// components/ProductCard.tsx - Client Component
'use client';

import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div>
      <button onClick={() => setIsFavorite(!isFavorite)}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

## 2. Component Design

### 2.1. Single Responsibility

Mỗi component chỉ làm một việc:

```typescript
// ✅ Good
export function ProductCard({ product }: { product: Product }) {
  return <div>{/* render product card */}</div>;
}

// ❌ Bad
export function ProductCardWithCart({ product }: { product: Product }) {
  // Mixing product display and cart logic
}
```

### 2.2. Composition over Configuration

```typescript
// ✅ Good - Flexible
export function Card({ children, className }: CardProps) {
  return <div className={cn('card', className)}>{children}</div>;
}

// ❌ Bad - Rigid
export function ProductCard({ title, description, price }: ProductCardProps) {
  return <div>{/* fixed structure */}</div>;
}
```

### 2.3. Props Interface

Luôn định nghĩa props interface:

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  // ...
}
```

## 3. Data Fetching Strategies

### 3.1. Server Components (Recommended)

```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await productService.getAllProducts();
  return <ProductsList products={products} />;
}
```

### 3.2. Client Components với useEffect

```typescript
'use client';

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getAllProducts().then((response) => {
      setProducts(response.data || []);
    });
  }, []);

  return <div>{/* render */}</div>;
}
```

### 3.3. React Query (Optional)

```typescript
import { useQuery } from '@tanstack/react-query';

export function ProductsList() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{/* render */}</div>;
}
```

## 4. Performance Optimization

### 4.1. Code Splitting

```typescript
// Dynamic import
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR if needed
});
```

### 4.2. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={500}
  priority // For above-the-fold images
  placeholder="blur" // Optional blur placeholder
/>
```

### 4.3. Memoization

```typescript
import { memo, useMemo } from 'react';

// Memoize component
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  return <div>{/* render */}</div>;
});

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

## 5. SEO Best Practices

### 5.1. Metadata API

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

### 5.2. Structured Data

```typescript
// app/products/[slug]/page.tsx
export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    price: product.price,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* product content */}
    </>
  );
}
```

## 6. Code Organization

### 6.1. File Naming

- Components: PascalCase (`ProductCard.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Types: PascalCase (`Product.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### 6.2. Folder Structure

```
components/
├── ui/              # Generic UI components
├── auth/            # Auth-related components
├── product/         # Product-related components
└── admin/           # Admin components
```

### 6.3. Barrel Exports

```typescript
// Usage
import { ProductCard, ProductList } from '@/components/product';

// components/product/index.ts
export { ProductCard } from './ProductCard';
export { ProductList } from './ProductList';
export { ProductDetail } from './ProductDetail';
```

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

### 7.2. Try-Catch trong Async Functions

```typescript
export default async function ProductsPage() {
  try {
    const products = await productService.getAllProducts();
    return <ProductsList products={products} />;
  } catch (error) {
    return <div>Error loading products</div>;
  }
}
```

## 8. Testing với Next.js

### 8.1. Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = { id: 1, name: 'Test Product', price: 100 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### 8.2. Page Testing

```typescript
import ProductsPage from '@/app/products/page';
import { render } from '@testing-library/react';

describe('ProductsPage', () => {
  it('renders products page', async () => {
    const page = await ProductsPage();
    render(page);
    // assertions
  });
});
```

## 9. Common Pitfalls và Solutions

### 9.1. Hydration Mismatch

**Problem:**

```typescript
// ❌ Bad
export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <div>{new Date().toLocaleString()}</div>;
}
```

**Solution:**

```typescript
// ✅ Good
'use client';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div>Loading...</div>;
  return <div>{new Date().toLocaleString()}</div>;
}
```

### 9.2. Unnecessary Re-renders

**Problem:**

```typescript
// ❌ Bad - Creates new object on every render
<ProductCard product={{ id: 1, name: 'Product' }} />
```

**Solution:**

```typescript
// ✅ Good - Use useMemo or define outside component
const product = { id: 1, name: 'Product' };
<ProductCard product={product} />
```

### 9.3. Missing Loading States

**Problem:**

```typescript
// ❌ Bad - No loading state
export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    productService.getAllProducts().then(setProducts);
  }, []);
  return <div>{/* render */}</div>;
}
```

**Solution:**

```typescript
// ✅ Good - With loading state
export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService.getAllProducts().then((response) => {
      setProducts(response.data || []);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  return <div>{/* render */}</div>;
}
```

## 10. Checklist Code Review

### 10.1. Component Checklist

- [ ] Component có single responsibility
- [ ] Props được type với TypeScript
- [ ] Error handling được implement
- [ ] Loading states được handle
- [ ] Accessibility (ARIA, semantic HTML)
- [ ] Responsive design

### 10.2. Performance Checklist

- [ ] Images được optimize
- [ ] Code splitting được sử dụng
- [ ] Memoization cho expensive calculations
- [ ] Lazy loading cho below-the-fold content
- [ ] Bundle size được optimize

### 10.3. SEO Checklist

- [ ] Metadata được set
- [ ] Semantic HTML được sử dụng
- [ ] Alt text cho images
- [ ] Structured data (nếu cần)
- [ ] Sitemap và robots.txt

### 10.4. Code Quality Checklist

- [ ] TypeScript types đầy đủ
- [ ] No console.logs trong production code
- [ ] Error messages user-friendly
- [ ] Code được format với Prettier
- [ ] ESLint rules được follow
- [ ] Comments cho complex logic
