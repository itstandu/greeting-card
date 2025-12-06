'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/types';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  isOutOfStock?: boolean;
}

export function ProductImageGallery({
  images,
  productName,
  isOutOfStock = false,
}: ProductImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [thumbApi, setThumbApi] = useState<CarouselApi>();

  // Sync main carousel with thumbnail selection
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    thumbApi?.scrollTo(api.selectedScrollSnap());
  }, [api, thumbApi]);

  useEffect(() => {
    if (!api) return;
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  if (!images || images.length === 0) {
    return (
      <div className="bg-muted flex aspect-square items-center justify-center rounded-xl">
        <span className="text-muted-foreground">Không có hình ảnh</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="group relative">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="relative aspect-square overflow-hidden rounded-xl border bg-white">
                  <SafeImage
                    src={image.imageUrl}
                    alt={image.altText || `${productName} - ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding={index === 0 ? 'sync' : 'async'}
                  />

                  {/* Zoom Icon */}
                  <div className="absolute top-4 right-4 rounded-full bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>

                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-xl font-bold tracking-wider text-white uppercase">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-3 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 right-3 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter & Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  current === index ? 'w-4 bg-white' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {images.length > 1 && (
        <Carousel
          setApi={setThumbApi}
          opts={{
            align: 'start',
            containScroll: 'keepSnaps',
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {images.map((image, index) => (
              <CarouselItem key={image.id} className="basis-1/5 pl-2">
                <button
                  onClick={() => scrollTo(index)}
                  className={cn(
                    'hover:border-primary relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                    current === index ? 'border-primary ring-primary' : 'border-transparent',
                  )}
                >
                  <SafeImage
                    src={image.imageUrl}
                    alt={image.altText || `${productName} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
