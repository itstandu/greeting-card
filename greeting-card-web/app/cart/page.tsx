'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CartItemCard } from '@/components/cart/CartItemCard';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { clearCart, getCart } from '@/services/cart.service';
import { Cart, CartResponse } from '@/types';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

// Helper function để convert CartResponse sang Cart
function convertCartResponseToCart(cartResponse: CartResponse): Cart {
  return {
    items: cartResponse.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.imageUrl,
      price: Number(item.product.price),
      quantity: item.quantity,
      stock: item.product.stock,
    })),
    total: Number(cartResponse.total),
    totalItems: cartResponse.totalItems,
  };
}

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart>(() => cartStorage.getCart());
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Fetch cart từ API hoặc localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated && user) {
        // User đã đăng nhập: Fetch từ API
        try {
          setLoading(true);
          const response = await getCart();
          if (response.data) {
            setCart(convertCartResponseToCart(response.data));
          } else {
            setCart({ items: [], total: 0, totalItems: 0 });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          setCart({ items: [], total: 0, totalItems: 0 });
        } finally {
          setLoading(false);
        }
      } else {
        // Guest: Lấy từ localStorage
        setCart(cartStorage.getCart());
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, user]);

  // Listen for cart changes
  useEffect(() => {
    const updateCart = async () => {
      if (isAuthenticated && user) {
        // User đã đăng nhập: Fetch từ API
        try {
          const response = await getCart();
          if (response.data) {
            setCart(convertCartResponseToCart(response.data));
          } else {
            setCart({ items: [], total: 0, totalItems: 0 });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      } else {
        // Guest: Lấy từ localStorage
        setCart(cartStorage.getCart());
      }
    };

    window.addEventListener('cart-changed', updateCart);
    window.addEventListener('storage', e => {
      if (e.key === 'greeting_card_cart' && !isAuthenticated) {
        updateCart();
      }
    });

    return () => {
      window.removeEventListener('cart-changed', updateCart);
      window.removeEventListener('storage', updateCart);
    };
  }, [isAuthenticated, user]);

  const handleUpdate = async () => {
    if (isAuthenticated && user) {
      // Fetch lại từ API
      try {
        const response = await getCart();
        if (response.data) {
          setCart(convertCartResponseToCart(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    } else {
      // Lấy từ localStorage
      setCart(cartStorage.getCart());
    }
  };

  const handleClearAll = async () => {
    if (isAuthenticated && user) {
      // User đã đăng nhập: Gọi API
      try {
        await clearCart();
        setCart({ items: [], total: 0, totalItems: 0 });
        window.dispatchEvent(new Event('cart-changed'));
      } catch (error: unknown) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      // Guest: Xóa từ localStorage
      cartStorage.clearCart();
      setCart({ items: [], total: 0, totalItems: 0 });
      window.dispatchEvent(new Event('cart-changed'));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground mb-4">Đang tải giỏ hàng...</div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <ShoppingCart className="text-muted-foreground h-16 w-16" />
          <h2 className="text-2xl font-semibold">Giỏ hàng của bạn đang trống</h2>
          <p className="text-muted-foreground max-w-md text-center">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Khám phá sản phẩm
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Giỏ hàng của bạn</h1>
        <p className="text-muted-foreground">
          Bạn có {cart.totalItems} {cart.totalItems === 1 ? 'sản phẩm' : 'sản phẩm'} trong giỏ hàng
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sản phẩm</h2>
            {cart.items.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowClearDialog(true)}>
                Xóa tất cả
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {cart.items.map(item => (
              <CartItemCard key={item.productId} item={item} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Card className="py-6">
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    cart.total,
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-primary text-xl font-bold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    cart.total,
                  )}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full" size="lg">
                <Link href={isAuthenticated ? '/checkout' : '/auth/login?redirect=/checkout'}>
                  Thanh toán
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/products">Tiếp tục mua sắm</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tất cả giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowClearDialog(false);
                await handleClearAll();
              }}
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
