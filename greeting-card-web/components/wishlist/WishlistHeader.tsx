'use client';

import { Button } from '@/components/ui/button';
import type { Wishlist } from '@/types';

interface WishlistHeaderProps {
  wishlist: Wishlist;
  onClearClick: () => void;
}

export function WishlistHeader({ wishlist, onClearClick }: WishlistHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Danh sách yêu thích</h1>
        <p className="text-muted-foreground">
          Bạn có {wishlist.totalItems} sản phẩm trong danh sách yêu thích
        </p>
      </div>
      {wishlist.items.length > 0 && (
        <Button variant="outline" onClick={onClearClick}>
          Xóa tất cả
        </Button>
      )}
    </div>
  );
}
