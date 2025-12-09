'use client';

import { forwardRef } from 'react';
import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import { cn } from '@/lib/utils';

export const FALLBACK_IMAGE_SRC = '/images/fallback-image.jpg';

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null | undefined;
  fallbackSrc?: string;
};

export const SafeImage = forwardRef<HTMLImageElement, SafeImageProps>(
  ({ src, alt, className, fallbackSrc = FALLBACK_IMAGE_SRC, onError, ...props }, ref) => {
    const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
      const imageElement = event.currentTarget;

      if (!imageElement || imageElement.src.endsWith(fallbackSrc)) {
        return;
      }

      imageElement.src = fallbackSrc;

      if (onError) {
        onError(event);
      }
    };

    return (
      <img
        {...props}
        ref={ref}
        src={src || fallbackSrc}
        alt={alt}
        onError={handleError}
        className={cn('object-cover', className)}
        loading={props.loading ?? 'lazy'}
        decoding={props.decoding ?? 'async'}
      />
    );
  },
);

SafeImage.displayName = 'SafeImage';
