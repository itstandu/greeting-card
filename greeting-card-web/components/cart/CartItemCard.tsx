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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/safe-image';
import { useAuth } from '@/hooks/use-auth';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { removeCartItem, updateCartItem } from '@/services/cart.service';
import { CartItem } from '@/types';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: () => void;
}

export function CartItemCard({ item, onUpdate }: CartItemCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemove();
      return;
    }

    if (newQuantity > item.stock) {
      toast.error('Không đủ hàng', {
        description: `Số lượng tồn kho chỉ còn ${item.stock} sản phẩm`,
      });
      return;
    }

    // User đã đăng nhập: Gọi API
    if (isAuthenticated && user) {
      try {
        await updateCartItem(item.productId, { quantity: newQuantity });
        toast.success('Đã cập nhật số lượng');

        // Dispatch event để header fetch lại từ API
        window.dispatchEvent(new Event('cart-changed'));
        onUpdate();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
        toast.error('Không thể cập nhật số lượng', {
          description: message,
        });
      }
      return;
    }

    // Guest: Cập nhật localStorage
    cartStorage.updateItemQuantity(item.productId, newQuantity);
    toast.success('Đã cập nhật số lượng');

    // Dispatch event để header cập nhật số lượng
    window.dispatchEvent(new Event('cart-changed'));
    onUpdate();
  };

  const handleRemove = async () => {
    // User đã đăng nhập: Gọi API
    if (isAuthenticated && user) {
      try {
        await removeCartItem(item.productId);
        toast.info('Đã xóa sản phẩm khỏi giỏ hàng', {
          description: `${item.productName} đã được xóa khỏi giỏ hàng`,
        });

        // Dispatch event để header fetch lại từ API
        window.dispatchEvent(new Event('cart-changed'));
        onUpdate();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
        toast.error('Không thể xóa sản phẩm', {
          description: message,
        });
      }
      return;
    }

    // Guest: Xóa từ localStorage
    cartStorage.removeItem(item.productId);
    toast.info('Đã xóa sản phẩm khỏi giỏ hàng', {
      description: `${item.productName} đã được xóa khỏi giỏ hàng`,
    });

    // Dispatch event để header cập nhật số lượng
    window.dispatchEvent(new Event('cart-changed'));
    onUpdate();
  };

  const subtotal = item.price * item.quantity;
  const isOutOfStock = item.stock <= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Product Image */}
          <Link href={`/product/${item.productSlug}`} className="shrink-0">
            <div className="bg-muted relative h-36 w-36 overflow-hidden rounded-lg sm:h-48 sm:w-48">
              <SafeImage
                src={item.productImage}
                alt={item.productName}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex flex-1 flex-col gap-2">
            <Link href={`/product/${item.productSlug}`} className="hover:underline">
              <h3 className="font-semibold">{item.productName}</h3>
            </Link>
            <div className="text-primary text-lg font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                item.price,
              )}
            </div>
            {isOutOfStock && (
              <p className="text-destructive text-sm font-medium">Sản phẩm đã hết hàng</p>
            )}
            {!isOutOfStock && item.stock < 10 && (
              <p className="text-muted-foreground text-sm">
                Còn lại: <span className="font-medium">{item.stock} sản phẩm</span>
              </p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={item.stock}
                value={item.quantity}
                onChange={e => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1) {
                    handleQuantityChange(value);
                  }
                }}
                className="h-8 w-16 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <div className="text-primary text-lg font-bold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  subtotal,
                )}
              </div>
              {item.quantity > 1 && (
                <p className="text-muted-foreground text-xs">
                  {item.quantity} ×{' '}
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    item.price,
                  )}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <span className="font-semibold">{item.productName}</span>{' '}
              khỏi giỏ hàng? Hành động này không thể hoàn tác.
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
