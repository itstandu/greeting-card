'use client';

import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

type ProductCardVariant = 'default' | 'compact' | 'featured';
type GridDensity = 'compact' | 'normal' | 'spacious';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  variant?: ProductCardVariant;
  density?: GridDensity;
  showCategory?: boolean;
  showDescription?: boolean;
  showAddToCart?: boolean;
  showAddToWishlist?: boolean;
  onAddToCart?: (product: Product) => void;
  emptyMessage?: string;
  skeletonCount?: number;
  className?: string;
}

// Static grid classes for different densities - ensures cards maintain good width
// Optimized for 1440px screens to prevent cards from being too small
const gridDensityClasses: Record<GridDensity, string> = {
  // Compact: 2 cols mobile, 3 sm, 4 md/lg/xl - consistent gap
  compact: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2',
  // Normal: 1 col mobile, 2 sm, 3 md, 4 lg/xl - balanced for medium cards
  normal: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-3',
  // Spacious: 1 col mobile, 2 sm/md, 3 lg/xl - for featured/large cards
  spacious: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3',
};

// Variant-based grid recommendations
const variantDensityMap: Record<ProductCardVariant, GridDensity> = {
  compact: 'compact',
  default: 'normal',
  featured: 'spacious',
};

export function ProductGrid({
  products,
  loading = false,
  variant = 'default',
  density,
  showCategory = true,
  showDescription = true,
  showAddToCart = false,
  showAddToWishlist = false,
  onAddToCart,
  emptyMessage = 'Không có sản phẩm nào.',
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  // Use provided density or fallback to variant-based recommendation
  const effectiveDensity = density ?? variantDensityMap[variant];
  const gridClass = gridDensityClasses[effectiveDensity];

  if (loading) {
    return (
      <div className={cn('grid', gridClass, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid', gridClass, className)}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showCategory={showCategory}
          showDescription={showDescription}
          showAddToCart={showAddToCart}
          showAddToWishlist={showAddToWishlist}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
