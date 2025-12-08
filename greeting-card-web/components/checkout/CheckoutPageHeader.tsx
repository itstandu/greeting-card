'use client';

import Link from 'next/link';
import type { Cart } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface CheckoutPageHeaderProps {
  cart: Cart;
}

export function CheckoutPageHeader({ cart }: CheckoutPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/cart"
        className="text-muted-foreground hover:text-primary mb-4 inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại giỏ hàng
      </Link>
      <h1 className="text-3xl font-bold">Thanh toán</h1>
      <p className="text-muted-foreground mt-2">
        Hoàn tất đơn hàng của bạn ({cart.totalItems} sản phẩm)
      </p>
    </div>
  );
}
