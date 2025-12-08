'use client';

import { useState } from 'react';
import {
  CartClearDialog,
  CartEmptyState,
  CartHeader,
  CartItemCard,
  CartLoadingState,
  CartSummary,
} from '@/components/cart';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCartPage } from '@/hooks/use-cart-page';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, handleUpdate, handleClearAll } = useCartPage();
  const [showClearDialog, setShowClearDialog] = useState(false);

  if (loading) {
    return <CartLoadingState />;
  }

  if (cart.items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CartHeader cart={cart} />

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
          <CartSummary cart={cart} isAuthenticated={isAuthenticated} />
        </div>
      </div>

      <CartClearDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearAll}
      />
    </div>
  );
}
