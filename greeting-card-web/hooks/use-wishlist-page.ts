import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import { clearWishlist, getWishlist } from '@/services/wishlist.service';
import type { Wishlist, WishlistResponse } from '@/types';

function convertWishlistResponseToWishlist(wishlistResponse: WishlistResponse): Wishlist {
  return {
    items: wishlistResponse.items.map(item => {
      const primaryImage =
        item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
      const productImage = primaryImage?.imageUrl || '';

      return {
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage,
        price: Number(item.product.price),
        stock: item.product.stock,
        addedAt: item.addedAt,
      };
    }),
    totalItems: wishlistResponse.totalItems,
  };
}

export function useWishlistPage() {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist>(() => wishlistStorage.getWishlist());
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const response = await getWishlist();
        if (response.data) {
          setWishlist(convertWishlistResponseToWishlist(response.data));
        } else {
          setWishlist({ items: [], totalItems: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        setWishlist({ items: [], totalItems: 0 });
      }
    } else {
      setWishlist(wishlistStorage.getWishlist());
    }
  }, [isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      await fetchWishlist();
      setLoading(false);
    };

    loadWishlist();
  }, [fetchWishlist]);

  // Listen for wishlist changes
  useEffect(() => {
    const updateWishlist = async () => {
      await fetchWishlist();
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
  }, [fetchWishlist, isAuthenticated]);

  const handleRemoveItem = async () => {
    await fetchWishlist();
  };

  const handleClearAll = async () => {
    if (isAuthenticated && user) {
      try {
        await clearWishlist();
        setWishlist({ items: [], totalItems: 0 });
        window.dispatchEvent(new Event('wishlist-changed'));
      } catch (error: unknown) {
        console.error('Failed to clear wishlist:', error);
      }
    } else {
      wishlistStorage.clearWishlist();
      setWishlist({ items: [], totalItems: 0 });
      window.dispatchEvent(new Event('wishlist-changed'));
    }
  };

  return {
    wishlist,
    loading,
    handleRemoveItem,
    handleClearAll,
  };
}
