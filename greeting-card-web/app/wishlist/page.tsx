'use client';

import { useState } from 'react';
import {
  WishlistClearDialog,
  WishlistEmptyState,
  WishlistHeader,
  WishlistItemCard,
  WishlistLoadingState,
} from '@/components/wishlist';
import { useWishlistPage } from '@/hooks/use-wishlist-page';

export default function WishlistPage() {
  const { wishlist, loading, handleRemoveItem, handleClearAll } = useWishlistPage();
  const [showClearDialog, setShowClearDialog] = useState(false);

  if (loading) {
    return <WishlistLoadingState />;
  }

  if (wishlist.items.length === 0) {
    return <WishlistEmptyState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WishlistHeader wishlist={wishlist} onClearClick={() => setShowClearDialog(true)} />

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.items.map(item => (
          <WishlistItemCard key={item.productId} item={item} onRemove={handleRemoveItem} />
        ))}
      </div>

      <WishlistClearDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearAll}
      />
    </div>
  );
}
