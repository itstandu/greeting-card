'use client';

import type { Cart } from '@/types';

interface CartHeaderProps {
  cart: Cart;
}

export function CartHeader({ cart }: CartHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-3xl font-bold">Giỏ hàng của bạn</h1>
      <p className="text-muted-foreground">
        Bạn có {cart.totalItems} {cart.totalItems === 1 ? 'sản phẩm' : 'sản phẩm'} trong giỏ hàng
      </p>
    </div>
  );
}
