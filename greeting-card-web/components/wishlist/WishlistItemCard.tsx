'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import { useAuth } from '@/hooks/use-auth';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import { addToCart } from '@/services/cart.service';
import { removeWishlistItem } from '@/services/wishlist.service';
import { WishlistItem } from '@/types';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: () => void;
}

export function WishlistItemCard({ item, onRemove }: WishlistItemCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAddToCart = async () => {
    if (item.stock <= 0) {
      toast.error('Không thể thêm vào giỏ hàng', {
        description: 'Sản phẩm đã hết hàng',
      });
      return;
    }

    // User đã đăng nhập: Gọi API
    if (isAuthenticated && user) {
      try {
        await addToCart({ productId: item.productId, quantity: 1 });

        // Dispatch event để header fetch lại từ API
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-changed'));
        }

        toast.success('Đã thêm vào giỏ hàng', {
          description: `${item.productName} đã được thêm vào giỏ hàng`,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
        toast.error('Không thể thêm vào giỏ hàng', {
          description: message,
        });
      }
      return;
    }

    // Guest: Thêm vào localStorage
    const cartItem = {
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      price: item.price,
      stock: item.stock,
    };

    cartStorage.addItem(cartItem, 1);

    toast.success('Đã thêm vào giỏ hàng', {
      description: `${item.productName} đã được thêm vào giỏ hàng`,
    });
  };

  const handleRemove = async () => {
    // User đã đăng nhập: Gọi API
    if (isAuthenticated && user) {
      try {
        await removeWishlistItem(item.productId);
        toast.info('Đã xóa khỏi yêu thích', {
          description: `${item.productName} đã được xóa khỏi danh sách yêu thích`,
        });

        // Dispatch event để header fetch lại từ API
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('wishlist-changed'));
        }
        onRemove();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
        toast.error('Không thể xóa khỏi yêu thích', {
          description: message,
        });
      }
      return;
    }

    // Guest: Xóa từ localStorage
    wishlistStorage.removeItem(item.productId);
    onRemove();

    toast.info('Đã xóa khỏi yêu thích', {
      description: `${item.productName} đã được xóa khỏi danh sách yêu thích`,
    });
  };

  const isOutOfStock = item.stock <= 0;

  return (
    <Card className="group hover:border-primary/30 flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        {/* Image Container with rounded corners */}
        <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
          <SafeImage
            src={item.productImage}
            alt={item.productName}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
              <span className="font-bold tracking-wider text-white uppercase">Hết hàng</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-1 flex-col space-y-3">
          {/* Title */}
          <h3 className="group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors">
            <Link href={`/products/${item.productSlug}`} className="hover:underline">
              {item.productName}
            </Link>
          </h3>

          {/* Price */}
          <div className="text-primary text-lg font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              item.price,
            )}
          </div>

          {/* Stock Info */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            {item.stock > 0 ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                <span>Còn {item.stock} sản phẩm</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                <span>Hết hàng</span>
              </>
            )}
          </div>

          {/* Added Date */}
          <p className="text-muted-foreground text-xs">
            Đã thêm: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="mt-auto px-4 pt-0 pb-4">
        <div className="flex w-full gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="h-9 flex-1"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 w-9 shrink-0 p-0"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khỏi yêu thích</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <span className="font-semibold">{item.productName}</span>{' '}
              khỏi danh sách yêu thích? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowDeleteDialog(false);
                await handleRemove();
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
