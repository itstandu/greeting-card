import { useEffect, useState } from 'react';
import { mapCartResponseToCart } from '@/lib/utils/cart';
import { getMyAddresses } from '@/services/address.service';
import { getCart } from '@/services/cart.service';
import { getPaymentMethods } from '@/services/payment-method.service';
import type { Cart, PaymentMethod, UserAddress } from '@/types';

export function useCheckout(isAuthenticated: boolean, authLoading: boolean) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, totalItems: 0 });
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || authLoading) return;

      setLoading(true);
      setError(null);
      try {
        const [cartResponse, addressesResponse, paymentMethodsResponse] = await Promise.all([
          getCart(),
          getMyAddresses(),
          getPaymentMethods(),
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
    loading,
    error,
  };
}
