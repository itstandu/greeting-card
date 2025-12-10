'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { ArrowRight, FolderOpen, Grid3X3, Star, Tag } from 'lucide-react';

type CategoryCardVariant = 'default' | 'compact' | 'featured' | 'horizontal';

interface CategoryCardProps {
  category: Category;
  variant?: CategoryCardVariant;
  productCount?: number;
  showDescription?: boolean;
  className?: string;
}

export function CategoryCard({
  category,
  variant = 'default',
  productCount,
  showDescription = true,
  className,
}: CategoryCardProps) {
  const [imageLoading, setImageLoading] = useState(!!category.imageUrl);
  const imageRef = useRef<HTMLImageElement>(null);
  const displayProductCount = productCount ?? 0;

  // Check if image is already loaded (from cache) when component mounts
  useEffect(() => {
    if (!category.imageUrl) {
      setTimeout(() => {
        setImageLoading(false);
      }, 100);
      return;
    }

    if (imageRef.current?.complete && imageRef.current.naturalHeight !== 0) {
      setTimeout(() => {
        setImageLoading(false);
      }, 100);
    }
  }, [category.imageUrl]);

  // Compact variant - minimal card with padding
  if (variant === 'compact') {
    return (
      <Link href={`/categories/${category.slug}`} className="block">
        <Card
          className={cn(
            'group hover:border-primary/30 h-full overflow-hidden transition-all duration-300 hover:shadow-lg',
            className,
          )}
        >
          <CardContent className="px-3">
            {/* Image Container with rounded corners */}
            <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
              {category.imageUrl ? (
                <SafeImage
                  ref={imageRef}
                  src={category.imageUrl}
                  alt={category.name}
                  className={cn(
                    'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                    imageLoading ? 'opacity-0' : 'opacity-100',
                  )}
                  onLoad={() => setImageLoading(false)}
                />
              ) : (
                <div className="from-primary/10 to-primary/5 flex h-full w-full items-center justify-center bg-linear-to-br">
                  <FolderOpen className="text-primary/40 h-10 w-10" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 rounded-lg bg-linear-to-t from-black/40 via-transparent to-transparent" />

              {/* Product Count Badge */}
              {displayProductCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2 bg-white/90 text-xs shadow-sm backdrop-blur-sm"
                >
                  {displayProductCount} SP
                </Badge>
              )}

              {/* Featured Badge */}
              {category.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-amber-500 px-1.5 py-0.5 text-xs hover:bg-amber-600">
                  <Star className="h-2.5 w-2.5 fill-current" />
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="mt-3 text-center">
              <h3 className="group-hover:text-primary line-clamp-2 min-h-10 text-sm font-semibold transition-colors">
                {category.name}
              </h3>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Horizontal variant - sidebar style with padding
  if (variant === 'horizontal') {
    return (
      <Link href={`/categories/${category.slug}`} className="block">
        <Card
          className={cn(
            'group hover:border-primary/30 overflow-hidden transition-all duration-300 hover:shadow-lg',
            className,
          )}
        >
          <CardContent className="px-3 sm:px-4">
            <div className="flex gap-4">
              {/* Image Container */}
              <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
                {imageLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
                {category.imageUrl ? (
                  <SafeImage
                    ref={imageRef}
                    src={category.imageUrl}
                    alt={category.name}
                    className={cn(
                      'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                      imageLoading ? 'opacity-0' : 'opacity-100',
                    )}
                    onLoad={() => setImageLoading(false)}
                  />
                ) : (
                  <div className="from-primary/10 to-primary/5 flex h-full w-full items-center justify-center bg-linear-to-br">
                    <Tag className="text-primary/40 h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h3 className="group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors">
                    {category.name}
                  </h3>
                  {category.isFeatured && (
                    <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />
                  )}
                </div>

                {showDescription && category.description && (
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                    {category.description}
                  </p>
                )}

                {displayProductCount > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {displayProductCount} sản phẩm
                    </Badge>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex shrink-0 items-center">
                <ArrowRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Featured variant - prominent display with padding
  if (variant === 'featured') {
    return (
      <Link href={`/categories/${category.slug}`} className="block">
        <Card
          className={cn(
            'group hover:border-primary/30 h-full overflow-hidden transition-all duration-300 hover:shadow-xl',
            className,
          )}
        >
          <CardContent className="px-4">
            {/* Image Container */}
            <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
              {category.imageUrl ? (
                <SafeImage
                  ref={imageRef}
                  src={category.imageUrl}
                  alt={category.name}
                  className={cn(
                    'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                    imageLoading ? 'opacity-0' : 'opacity-100',
                  )}
                  onLoad={() => setImageLoading(false)}
                />
              ) : (
                <div className="from-primary/15 to-primary/5 flex h-full w-full items-center justify-center bg-linear-to-br">
                  <Grid3X3 className="text-primary/40 h-16 w-16" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 rounded-xl bg-linear-to-t from-black/60 via-black/20 to-transparent" />

              {/* Featured Badge */}
              {category.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Nổi bật
                </Badge>
              )}

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <h3 className="line-clamp-2 text-xl font-bold drop-shadow-lg">{category.name}</h3>
                {displayProductCount > 0 && (
                  <p className="mt-1 text-sm text-white/90 drop-shadow">
                    {displayProductCount} sản phẩm
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-3">
              {showDescription && category.description && (
                <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">
                  {category.description}
                </p>
              )}

              <Button variant="outline" className="group/btn w-full">
                <span>Khám phá danh mục</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant - standard card with padding
  return (
    <Link href={`/categories/${category.slug}`} className="block">
      <Card
        className={cn(
          'group hover:border-primary/30 h-full overflow-hidden transition-all duration-300 hover:shadow-lg',
          className,
        )}
      >
        <CardContent className="px-4">
          {/* Image Container with rounded corners */}
          <div className="bg-muted relative aspect-4/3 overflow-hidden rounded-xl">
            {imageLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
            {category.imageUrl ? (
              <SafeImage
                ref={imageRef}
                src={category.imageUrl}
                alt={category.name}
                className={cn(
                  'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={() => setImageLoading(false)}
              />
            ) : (
              <div className="from-primary/10 to-primary/5 flex h-full w-full items-center justify-center bg-linear-to-br">
                <FolderOpen className="text-primary/40 h-12 w-12" />
              </div>
            )}

            {/* Gradient Overlay on hover */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {category.isFeatured && (
                <Badge className="bg-amber-500 hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Nổi bật
                </Badge>
              )}
            </div>

            {/* Product Count Badge */}
            {displayProductCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-white/95 shadow-sm backdrop-blur-sm"
              >
                {displayProductCount} sản phẩm
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="mt-4 space-y-2">
            <h3 className="group-hover:text-primary line-clamp-2 min-h-14 text-lg font-semibold transition-colors">
              {category.name}
            </h3>

            {showDescription && category.description && (
              <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">
                {category.description}
              </p>
            )}

            {/* Explore Link */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-primary flex items-center text-sm font-medium">
                Xem danh mục
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading states
export function CategoryCardSkeleton({ variant = 'default' }: { variant?: CategoryCardVariant }) {
  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="px-3">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="mt-3">
            <Skeleton className="mx-auto h-4 w-full" />
            <Skeleton className="mx-auto mt-1 h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="px-3 sm:px-4">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
            <div className="flex flex-1 flex-col justify-center space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="h-full overflow-hidden">
        <CardContent className="px-4">
          <Skeleton className="aspect-video rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="px-4">
        <Skeleton className="aspect-4/3 rounded-xl" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
