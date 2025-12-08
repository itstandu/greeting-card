'use client';

import { Suspense } from 'react';
import { ProductsPageClient } from '@/components/products/ProductsPageClient';
import { Skeleton } from '@/components/ui/skeleton';

function ProductsPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

// Client component - ProductsPageClient now handles its own data fetching
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageClient />
    </Suspense>
  );
}
