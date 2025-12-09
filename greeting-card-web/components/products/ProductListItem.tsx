'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import { Skeleton } from '@/components/ui/skeleton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { cn, formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { Eye, ShoppingCart, Star } from 'lucide-react';

interface ProductListItemProps {
  product: Product;
  showCategory?: boolean;
  showAddToCart?: boolean;
  showAddToWishlist?: boolean;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductListItem({
  product,
  showCategory = true,
  showAddToCart = false,
  showAddToWishlist = false,
  onAddToCart,
  className,
}: ProductListItemProps) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const [imageLoading, setImageLoading] = useState(!!primaryImage?.imageUrl);
  const imageRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded (from cache) when component mounts
  useEffect(() => {
    if (!primaryImage?.imageUrl) {
      setImageLoading(false);
      return;
    }

    if (imageRef.current?.complete && imageRef.current.naturalHeight !== 0) {
      setImageLoading(false);
    }
  }, [primaryImage?.imageUrl]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isAvailable = product.isActive && product.stock > 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card
        className={cn(
          'group hover:border-primary/50 overflow-hidden transition-all hover:shadow-lg',
          className,
        )}
      >
        <CardContent className="flex gap-4 p-4 sm:gap-6">
          {/* Image */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-32 md:h-40 md:w-40">
            {imageLoading && <Skeleton className="absolute inset-0" />}
            <SafeImage
              ref={imageRef}
              src={primaryImage?.imageUrl}
              alt={primaryImage?.altText || product.name}
              className={cn(
                'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                imageLoading ? 'opacity-0' : 'opacity-100',
              )}
              onLoad={() => setImageLoading(false)}
            />
            {/* Out of Stock Overlay */}
            {!isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  {!product.isActive ? 'Ngừng KD' : 'Hết hàng'}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="space-y-1.5">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {showCategory && product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category.name}
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-amber-500 text-xs hover:bg-amber-600">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    Nổi bật
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors sm:text-lg">
                {product.name}
              </h3>

              {/* Description - Hidden on mobile */}
              {product.description && (
                <p className="text-muted-foreground line-clamp-2 hidden text-sm sm:block">
                  {product.description}
                </p>
              )}

              {/* SKU */}
              <p className="text-muted-foreground text-xs">SKU: {product.sku}</p>
            </div>

            {/* Bottom Row */}
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-primary text-xl font-bold sm:text-2xl">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Eye className="mr-1 h-4 w-4" />
                  Chi tiết
                </Button>
                {showAddToCart && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="hidden sm:flex"
                  >
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    Thêm vào giỏ
                  </Button>
                )}
                {showAddToWishlist && (
                  <WishlistButton
                    product={product}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductListItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-4 p-4 sm:gap-6">
        <Skeleton className="h-24 w-24 shrink-0 rounded-lg sm:h-32 sm:w-32 md:h-40 md:w-40" />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="hidden h-4 w-full sm:block" />
            <Skeleton className="hidden h-4 w-2/3 sm:block" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="hidden h-9 w-24 sm:block" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
