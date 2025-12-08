'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import { Skeleton } from '@/components/ui/skeleton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { cn, formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { Eye, ShoppingCart, Star } from 'lucide-react';

type ProductCardVariant = 'default' | 'compact' | 'featured';

interface ProductCardProps {
  product: Product;
  variant?: ProductCardVariant;
  showCategory?: boolean;
  showDescription?: boolean;
  showAddToCart?: boolean;
  showAddToWishlist?: boolean;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  variant = 'default',
  showCategory = true,
  showDescription = true,
  showAddToCart = false,
  showAddToWishlist = false,
  onAddToCart,
  className,
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isAvailable = product.isActive && product.stock > 0;

  // Compact variant - minimal information with padding
  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.slug}`} className="block">
        <Card
          className={cn(
            'group hover:border-primary/30 h-full overflow-hidden transition-all duration-300 hover:shadow-lg',
            className,
          )}
        >
          <CardContent className="p-3">
            {/* Image Container with padding */}
            <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
              <SafeImage
                src={primaryImage?.imageUrl}
                alt={primaryImage?.altText || product.name}
                className={cn(
                  'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={() => setImageLoading(false)}
              />
              {renderOverlays()}

              {/* Quick Actions */}
              {(showAddToCart || showAddToWishlist) && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {renderQuickActions()}
                  {showAddToWishlist && (
                    <WishlistButton
                      product={product}
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-lg"
                    />
                  )}
                </div>
              )}

              {/* Featured Badge */}
              {product.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-amber-500 px-1.5 py-0.5 text-xs hover:bg-amber-600">
                  <Star className="h-2.5 w-2.5 fill-current" />
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="mt-3 space-y-1.5">
              <h3 className="group-hover:text-primary line-clamp-2 min-h-10 text-sm font-medium transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <p className="text-primary text-base font-bold">{formatCurrency(product.price)}</p>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-xs text-orange-600">Còn {product.stock}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Featured variant - highlighted display with padding
  if (variant === 'featured') {
    return (
      <Link href={`/products/${product.slug}`} className="block">
        <Card
          className={cn(
            'group hover:border-primary/30 h-full overflow-hidden transition-all duration-300 hover:shadow-xl',
            className,
          )}
        >
          <CardContent className="p-4">
            {/* Image Container */}
            <div className="bg-muted relative aspect-4/3 overflow-hidden rounded-xl">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
              <SafeImage
                src={primaryImage?.imageUrl}
                alt={primaryImage?.altText || product.name}
                className={cn(
                  'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                  imageLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={() => setImageLoading(false)}
              />
              {renderOverlays()}

              {/* Price Tag */}
              <div className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
                <span className="text-primary text-sm font-bold">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Featured Badge */}
              {product.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Nổi bật
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="mt-4 space-y-3">
              {showCategory && product.category && (
                <Badge variant="secondary" className="text-xs">
                  {product.category.name}
                </Badge>
              )}

              <h3 className="group-hover:text-primary line-clamp-2 min-h-14 text-lg font-bold transition-colors">
                {product.name}
              </h3>

              {showDescription && product.description && (
                <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">
                  {product.description}
                </p>
              )}

              {/* Stock Status */}
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                {product.stock > 0 ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Còn {product.stock} sản phẩm</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>Hết hàng</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>

          {/* Actions */}
          {(showAddToCart || showAddToWishlist) && (
            <CardFooter className="px-4 pt-0 pb-4">
              <div className="flex w-full gap-2">
                {showAddToCart && (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="h-9 flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Thêm vào giỏ
                  </Button>
                )}
                {showAddToWishlist && (
                  <WishlistButton
                    product={product}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 shrink-0 p-0"
                  />
                )}
              </div>
            </CardFooter>
          )}
        </Card>
      </Link>
    );
  }

  // Default variant - standard card with padding
  return (
    <Link href={`/product/${product.slug}`} className="block">
      <Card
        className={cn(
          'group hover:border-primary/30 flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg',
          className,
        )}
      >
        <CardContent className="p-4">
          {/* Image Container with rounded corners */}
          <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
            {imageLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
            <SafeImage
              src={primaryImage?.imageUrl}
              alt={primaryImage?.altText || product.name}
              className={cn(
                'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                imageLoading ? 'opacity-0' : 'opacity-100',
              )}
              onLoad={() => setImageLoading(false)}
            />
            {renderOverlays()}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isFeatured && (
                <Badge className="bg-amber-500 text-xs hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Nổi bật
                </Badge>
              )}
              {!isAvailable && (
                <Badge variant="destructive" className="text-xs">
                  {!product.isActive ? 'Ngừng KD' : 'Hết hàng'}
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 flex flex-1 flex-col space-y-3">
            {/* Category Badge */}
            {showCategory && product.category && (
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs font-normal">
                  {product.category.name}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h3 className="group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <div className="text-primary text-lg font-bold">{formatCurrency(product.price)}</div>

            {/* Description */}
            {showDescription && product.description && (
              <p className="text-muted-foreground line-clamp-2 flex-1 text-sm">
                {product.description}
              </p>
            )}

            {/* Stock Info */}
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              {product.stock > 0 ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span>Còn {product.stock} sản phẩm</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  <span>Hết hàng</span>
                </>
              )}
            </div>
          </div>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="mt-auto px-4 pt-0 pb-4">
          <div className="flex w-full gap-2">
            <Button className="h-9 flex-1" size="sm" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </Button>
            {showAddToCart && (
              <Button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                size="sm"
                className="h-9 w-9 shrink-0 p-0"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
            {showAddToWishlist && (
              <WishlistButton
                product={product}
                variant="outline"
                size="sm"
                className="h-9 w-9 shrink-0 p-0"
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );

  function renderOverlays() {
    if (!product.isActive) {
      return (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
          <span className="text-sm font-bold tracking-wider text-white uppercase">
            Ngừng kinh doanh
          </span>
        </div>
      );
    }
    if (product.stock === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
          <span className="text-sm font-bold tracking-wider text-white uppercase">Hết hàng</span>
        </div>
      );
    }
    return null;
  }

  function renderQuickActions() {
    return (
      <>
        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        )}
      </>
    );
  }
}

// Loading skeleton for ProductCard
export function ProductCardSkeleton({ variant = 'default' }: { variant?: ProductCardVariant }) {
  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="h-full overflow-hidden">
        <CardContent className="p-4">
          <Skeleton className="aspect-4/3 rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </CardContent>
        <CardFooter className="px-4 pt-0 pb-4">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardContent className="flex-1 p-4">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
      <CardFooter className="px-4 pt-0 pb-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}
