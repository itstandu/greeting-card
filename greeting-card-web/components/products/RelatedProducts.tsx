'use client';

import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface RelatedProductsProps {
  products: Product[];
  currentProductId: number;
  title?: string;
  showViewAll?: boolean;
  categorySlug?: string;
}

export function RelatedProducts({
  products,
  currentProductId,
  title = 'Sản phẩm liên quan',
  showViewAll = true,
  categorySlug,
}: RelatedProductsProps) {
  const relatedProducts = products.filter(p => p.id !== currentProductId && p.isActive).slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="text-primary h-5 w-5" />
          {title}
        </h2>
        {showViewAll && categorySlug && (
          <Button variant="ghost" asChild className="group">
            <Link href={`/categories/${categorySlug}`} className="flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            variant="default"
            showCategory={false}
            showDescription={false}
            showAddToWishlist
          />
        ))}
      </div>
    </div>
  );
}
