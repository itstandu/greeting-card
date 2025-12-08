'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export function WishlistEmptyState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">Danh sách yêu thích trống</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và thêm những sản phẩm
          bạn thích!
        </p>
        <Button asChild className="mt-4">
          <Link href="/">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Khám phá sản phẩm
          </Link>
        </Button>
      </div>
    </div>
  );
}
