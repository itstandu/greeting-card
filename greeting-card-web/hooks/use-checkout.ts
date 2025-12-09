import { useEffect, useState } from 'react';
import { mapCartResponseToCart } from '@/lib/utils/cart';
import { getMyAddresses } from '@/services/address.service';
import { getCart } from '@/services/cart.service';
import { getPaymentMethods } from '@/services/payment-method.service';
import { CartPromotionPreview, getCartPromotionPreview } from '@/services/promotion.service';
import type { Cart, PaymentMethod, UserAddress } from '@/types';

export function useCheckout(isAuthenticated: boolean, authLoading: boolean) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, totalItems: 0 });
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [promotionPreview, setPromotionPreview] = useState<CartPromotionPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || authLoading) return;

      setLoading(true);
      setError(null);
      try {
        const [cartResponse, addressesResponse, paymentMethodsResponse, promotionResponse] =
          await Promise.all([
            getCart(),
            getMyAddresses(),
            getPaymentMethods(),
            getCartPromotionPreview(),
          ]);

        if (cartResponse.data) {
          const cartData = mapCartResponseToCart(cartResponse.data);
          setCart(cartData);
        }

        if (addressesResponse.data) {
          setAddresses(addressesResponse.data);
        }

        if (paymentMethodsResponse.data) {
          setPaymentMethods(paymentMethodsResponse.data);
        }

        if (promotionResponse.data) {
          setPromotionPreview(promotionResponse.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Không thể tải thông tin thanh toán';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, authLoading]);

  return {
    cart,
    addresses,
    paymentMethods,
    promotionPreview,
    loading,
    error,
  };
}
