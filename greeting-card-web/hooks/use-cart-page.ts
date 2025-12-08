import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { mapCartResponseToCart } from '@/lib/utils/cart';
import { clearCart, getCart } from '@/services/cart.service';
import type { Cart } from '@/types';

export function useCartPage() {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart>(() => cartStorage.getCart());
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const response = await getCart();
        if (response.data) {
          setCart(mapCartResponseToCart(response.data));
        } else {
          setCart({ items: [], total: 0, totalItems: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        setCart({ items: [], total: 0, totalItems: 0 });
      }
    } else {
      setCart(cartStorage.getCart());
    }
  }, [isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };

    loadCart();
  }, [fetchCart]);

  // Listen for cart changes
  useEffect(() => {
    const updateCart = async () => {
      await fetchCart();
    };

    window.addEventListener('cart-changed', updateCart);
    window.addEventListener('storage', e => {
      if (e.key === 'greeting_card_cart' && !isAuthenticated) {
        updateCart();
      }
    });

    return () => {
      window.removeEventListener('cart-changed', updateCart);
      window.removeEventListener('storage', updateCart);
    };
  }, [fetchCart, isAuthenticated]);

  const handleUpdate = async () => {
    await fetchCart();
  };

  const handleClearAll = async () => {
    if (isAuthenticated && user) {
      try {
        await clearCart();
        setCart({ items: [], total: 0, totalItems: 0 });
        window.dispatchEvent(new Event('cart-changed'));
      } catch (error: unknown) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      cartStorage.clearCart();
      setCart({ items: [], total: 0, totalItems: 0 });
      window.dispatchEvent(new Event('cart-changed'));
    }
  };

  return {
    cart,
    loading,
    handleUpdate,
    handleClearAll,
  };
}
