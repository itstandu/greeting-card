'use client';

import { ProductsPageClient } from './ProductsPageClient';

// Client component - ProductsPageClient now handles its own data fetching
export default function ProductsPage() {
  return <ProductsPageClient />;
}
