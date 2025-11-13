'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { useAuth } from '@/hooks/use-auth';
import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import { clearWishlist, getWishlist } from '@/services/wishlist.service';
import { Wishlist, WishlistResponse } from '@/types';
import { ShoppingBag } from 'lucide-react';

// Helper function để convert WishlistResponse sang Wishlist
function convertWishlistResponseToWishlist(wishlistResponse: WishlistResponse): Wishlist {
  return {
    items: wishlistResponse.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.imageUrl,
      price: Number(item.product.price),
      stock: item.product.stock,
      addedAt: item.addedAt,
    })),
    totalItems: wishlistResponse.totalItems,
  };
}

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist>(() => wishlistStorage.getWishlist());
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Fetch wishlist từ API hoặc localStorage
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated && user) {
        // User đã đăng nhập: Fetch từ API
        try {
          setLoading(true);
          const response = await getWishlist();
          if (response.data) {
            setWishlist(convertWishlistResponseToWishlist(response.data));
          } else {
            setWishlist({ items: [], totalItems: 0 });
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
          setWishlist({ items: [], totalItems: 0 });
        } finally {
          setLoading(false);
        }
      } else {
        // Guest: Lấy từ localStorage
        setWishlist(wishlistStorage.getWishlist());
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user]);

  // Listen for wishlist changes
  useEffect(() => {
    const updateWishlist = async () => {
      if (isAuthenticated && user) {
        // User đã đăng nhập: Fetch từ API
        try {
          const response = await getWishlist();
          if (response.data) {
            setWishlist(convertWishlistResponseToWishlist(response.data));
          } else {
            setWishlist({ items: [], totalItems: 0 });
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        }
      } else {
        // Guest: Lấy từ localStorage
        setWishlist(wishlistStorage.getWishlist());
      }
    };

    window.addEventListener('wishlist-changed', updateWishlist);
    window.addEventListener('storage', e => {
      if (e.key === 'greeting_card_wishlist' && !isAuthenticated) {
        updateWishlist();
      }
    });

    return () => {
      window.removeEventListener('wishlist-changed', updateWishlist);
      window.removeEventListener('storage', updateWishlist);
    };
  }, [isAuthenticated, user]);

  const handleRemoveItem = async () => {
    if (isAuthenticated && user) {
      // Fetch lại từ API
      try {
        const response = await getWishlist();
        if (response.data) {
          setWishlist(convertWishlistResponseToWishlist(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    } else {
      // Lấy từ localStorage
      setWishlist(wishlistStorage.getWishlist());
    }
  };

  const handleClearAll = async () => {
    if (isAuthenticated && user) {
      // User đã đăng nhập: Gọi API
      try {
        await clearWishlist();
        setWishlist({ items: [], totalItems: 0 });
        window.dispatchEvent(new Event('wishlist-changed'));
      } catch (error: any) {
        console.error('Failed to clear wishlist:', error);
      }
    } else {
      // Guest: Xóa từ localStorage
      wishlistStorage.clearWishlist();
      setWishlist({ items: [], totalItems: 0 });
      window.dispatchEvent(new Event('wishlist-changed'));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground mb-4">Đang tải danh sách yêu thích...</div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.items.length === 0) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Danh sách yêu thích</h1>
          <p className="text-muted-foreground">
            Bạn có {wishlist.totalItems} sản phẩm trong danh sách yêu thích
          </p>
        </div>
        {wishlist.items.length > 0 && (
          <Button variant="outline" onClick={() => setShowClearDialog(true)}>
            Xóa tất cả
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.items.map(item => (
          <WishlistItemCard key={item.productId} item={item} onRemove={handleRemoveItem} />
        ))}
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tất cả danh sách yêu thích</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích? Hành động này
              không thể hoàn tác.
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
