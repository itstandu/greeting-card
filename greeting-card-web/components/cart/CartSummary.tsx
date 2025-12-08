'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Cart } from '@/types';

interface CartSummaryProps {
  cart: Cart;
  isAuthenticated: boolean;
}

export function CartSummary({ cart, isAuthenticated }: CartSummaryProps) {
  return (
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
  );
}
