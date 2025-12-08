import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { createAddress, type CreateAddressRequest } from '@/services/address.service';
import { validateCoupon } from '@/services/coupon.service';
import { createOrder } from '@/services/order.service';
import type { Cart, PaymentMethod, UserAddress } from '@/types';
import { AxiosError } from 'axios';

interface UseCheckoutFormOptions {
  cart: Cart;
  addresses: UserAddress[];
  paymentMethods: PaymentMethod[];
}

interface UseCheckoutFormReturn {
  // Form state
  selectedAddressId: number | null;
  selectedPaymentMethodId: number | null;
  couponCode: string;
  couponDiscount: number;
  couponValidating: boolean;
  couponError: string;
  notes: string;
  showNewAddressForm: boolean;
  newAddress: CreateAddressRequest;
  newAddressLoading: boolean;
  submitting: boolean;
  // Setters
  setSelectedAddressId: (id: number | null) => void;
  setSelectedPaymentMethodId: (id: number | null) => void;
  setCouponCode: (code: string) => void;
  setNotes: (notes: string) => void;
  setShowNewAddressForm: (show: boolean) => void;
  setNewAddress: (address: CreateAddressRequest) => void;
  // Handlers
  handleValidateCoupon: () => Promise<void>;
  handleCreateAddress: () => Promise<void>;
  handleSubmitOrder: () => Promise<void>;
  // Computed
  finalAmount: number;
  updatedAddresses: UserAddress[];
}

export function useCheckoutForm({
  cart,
  addresses: initialAddresses,
  paymentMethods,
}: UseCheckoutFormOptions): UseCheckoutFormReturn {
  const router = useRouter();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(() => {
    const defaultAddress = initialAddresses.find(a => a.isDefault);
    return defaultAddress?.id || (initialAddresses.length > 0 ? initialAddresses[0].id : null);
  });
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(
    paymentMethods.length > 0 ? paymentMethods[0].id : null,
  );
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [notes, setNotes] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressLoading, setNewAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    ward: '',
    postalCode: '',
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAddresses(initialAddresses);

    setSelectedAddressId(prevSelected => {
      if (prevSelected) return prevSelected;
      const defaultAddress = initialAddresses.find(address => address.isDefault);
      const fallbackAddress = defaultAddress ?? initialAddresses[0];
      return fallbackAddress ? fallbackAddress.id : null;
    });
  }, [initialAddresses]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponValidating(true);
    setCouponError('');
    setCouponDiscount(0);

    try {
      const response = await validateCoupon({ code: couponCode.trim(), orderTotal: cart.total });
      if (response.data && response.data.valid) {
        const discount = response.data.discountAmount;
        setCouponDiscount(discount);
        toast({
          title: 'Áp dụng mã giảm giá thành công',
          description: `Bạn được giảm ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(discount)}`,
        });
      } else {
        setCouponError(response.data?.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error: unknown) {
      let errorMessage = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setCouponError(errorMessage);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleCreateAddress = async () => {
    setNewAddressLoading(true);
    try {
      const response = await createAddress(newAddress);
      if (response.data) {
        setAddresses(prev => [response.data, ...prev]);
        setSelectedAddressId(response.data.id);
        setShowNewAddressForm(false);
        setNewAddress({
          recipientName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          district: '',
          ward: '',
          postalCode: '',
          isDefault: false,
        });
        toast({
          title: 'Thành công',
          description: 'Đã thêm địa chỉ mới',
        });
      }
    } catch (error: unknown) {
      let errorMessage = 'Không thể thêm địa chỉ mới';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setNewAddressLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn địa chỉ giao hàng',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPaymentMethodId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn phương thức thanh toán',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await createOrder({
        shippingAddressId: selectedAddressId,
        paymentMethodId: selectedPaymentMethodId,
        couponCode: couponCode.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (response.data) {
        cartStorage.clearCart();
        window.dispatchEvent(new Event('cart-changed'));

        toast({
          title: '🎉 Đặt hàng thành công!',
          description: `Mã đơn hàng: ${response.data.orderNumber}. Đang chuyển đến trang thanh toán...`,
        });

        router.push(`/checkout/payment/${response.data.id}`);
      }
    } catch (error: unknown) {
      let errorMessage = 'Không thể đặt hàng. Vui lòng thử lại.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Lỗi đặt hàng',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const finalAmount = cart.total - couponDiscount;

  return {
    selectedAddressId,
    selectedPaymentMethodId,
    couponCode,
    couponDiscount,
    couponValidating,
    couponError,
    notes,
    showNewAddressForm,
    newAddress,
    newAddressLoading,
    submitting,
    setSelectedAddressId,
    setSelectedPaymentMethodId,
    setCouponCode,
    setNotes,
    setShowNewAddressForm,
    setNewAddress,
    handleValidateCoupon,
    handleCreateAddress,
    handleSubmitOrder,
    finalAmount,
    updatedAddresses: addresses,
  };
}
