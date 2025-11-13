'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistButtonProps {
  product: Product;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function WishlistButton({
  product,
  variant = 'ghost',
  size = 'icon',
  className,
  showText = false,
}: WishlistButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  // Check wishlist status using hook (O(1) lookup, no API call)
  const isInWishlistStatus = isInWishlist(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // User đã đăng nhập: Sử dụng Redux store với optimistic update
      if (isAuthenticated && user) {
        if (isInWishlistStatus) {
          // Xóa khỏi wishlist
          await removeFromWishlist(product.id);
          toast.info('Đã xóa khỏi yêu thích', {
            description: `${product.name} đã được xóa khỏi danh sách yêu thích`,
          });
        } else {
          // Thêm vào wishlist
          await addToWishlist(product.id);
          toast.success('Đã thêm vào yêu thích', {
            description: `${product.name} đã được thêm vào danh sách yêu thích`,
          });
        }

        // Dispatch event để header biết wishlist đã thay đổi
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('wishlist-changed'));
        }
      } else {
        // Guest: Dùng localStorage
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

        const wishlistItem = {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: primaryImage?.imageUrl || '',
          price: product.price,
          stock: product.stock,
        };

        const updatedWishlist = wishlistStorage.toggleItem(wishlistItem);
        const nowInWishlist = updatedWishlist.items.some(item => item.productId === product.id);

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('wishlist-changed'));

        if (nowInWishlist) {
          toast.success('Đã thêm vào yêu thích', {
            description: `${product.name} đã được thêm vào danh sách yêu thích`,
          });
        } else {
          toast.info('Đã xóa khỏi yêu thích', {
            description: `${product.name} đã được xóa khỏi danh sách yêu thích`,
          });
        }
      }
    } catch (error: any) {
      toast.error('Có lỗi xảy ra', {
        description: error.message || 'Không thể cập nhật danh sách yêu thích',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      loading={isLoading}
      className={cn(
        'relative transition-all',
        isInWishlistStatus && 'bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900',
        className,
      )}
      aria-label={isInWishlistStatus ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          isInWishlistStatus
            ? 'animate-in zoom-in-50 fill-red-500 text-red-500 duration-200'
            : 'text-muted-foreground hover:text-red-500',
        )}
      />
      {showText && (
        <span className={cn('ml-2', isInWishlistStatus && 'font-semibold text-red-600')}>
          {isInWishlistStatus ? 'Đã thích' : 'Yêu thích'}
        </span>
      )}
      {isInWishlistStatus && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
        </span>
      )}
    </Button>
  );
}
