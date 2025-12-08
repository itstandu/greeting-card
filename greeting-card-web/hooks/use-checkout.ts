import { useEffect, useState } from 'react';
import { getMyAddresses } from '@/services/address.service';
import { getCart } from '@/services/cart.service';
import { getPaymentMethods } from '@/services/payment-method.service';
import type { Cart, CartResponse, PaymentMethod, UserAddress } from '@/types';

function getProductImage(product: CartResponse['items'][number]['product']): string | undefined {
  // Prefer primary image; fall back to the first image if none is marked primary.
  if (product.images && product.images.length > 0) {
    const primary = product.images.find(img => img.isPrimary);
    return (primary ?? product.images[0])?.imageUrl;
  }
  return product.imageUrl || undefined;
}

function convertCartResponseToCart(cartResponse: CartResponse): Cart {
  return {
    items: cartResponse.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: getProductImage(item.product),
      price: Number(item.product.price),
      quantity: item.quantity,
      stock: item.product.stock,
    })),
    total: Number(cartResponse.total),
    totalItems: cartResponse.totalItems,
  };
}

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
          const cartData = convertCartResponseToCart(cartResponse.data);
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
