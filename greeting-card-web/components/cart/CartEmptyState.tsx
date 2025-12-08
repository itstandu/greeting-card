'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

export function CartEmptyState() {
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
