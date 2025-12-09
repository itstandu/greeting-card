'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  CheckoutAddressForm,
  CheckoutLoadingState,
  CheckoutNotesForm,
  CheckoutOrderSummary,
  CheckoutPageHeader,
  CheckoutPaymentMethod,
} from '@/components/checkout';
import { useAuth } from '@/hooks/use-auth';
import { useCheckout } from '@/hooks/use-checkout';
import { useCheckoutForm } from '@/hooks/use-checkout-form';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { cart, addresses, paymentMethods, promotionPreview, loading } = useCheckout(
    isAuthenticated,
    authLoading,
  );

  const {
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
    updatedAddresses,
  } = useCheckoutForm({
    cart,
    addresses,
    paymentMethods,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  // Redirect to cart if empty
  useEffect(() => {
    if (!loading && cart.items.length === 0 && isAuthenticated) {
      toast({
        title: 'Giỏ hàng trống',
        description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
        variant: 'destructive',
      });
      router.push('/cart');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, cart.items.length, isAuthenticated]);

  if (authLoading || loading) {
    return <CheckoutLoadingState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutPageHeader cart={cart} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Forms */}
        <div className="space-y-6 lg:col-span-2">
          <CheckoutAddressForm
            addresses={updatedAddresses}
            selectedAddressId={selectedAddressId}
            showNewAddressForm={showNewAddressForm}
            newAddress={newAddress}
            newAddressLoading={newAddressLoading}
            onAddressSelect={setSelectedAddressId}
            onShowNewAddressForm={setShowNewAddressForm}
            onNewAddressChange={setNewAddress}
            onCreateAddress={handleCreateAddress}
          />

          <CheckoutPaymentMethod
            paymentMethods={paymentMethods}
            selectedPaymentMethodId={selectedPaymentMethodId}
            onPaymentMethodSelect={setSelectedPaymentMethodId}
          />

          <CheckoutNotesForm notes={notes} onNotesChange={setNotes} />
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <CheckoutOrderSummary
            cart={cart}
            promotionPreview={promotionPreview}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            couponValidating={couponValidating}
            couponError={couponError}
            submitting={submitting}
            selectedAddressId={selectedAddressId}
            selectedPaymentMethodId={selectedPaymentMethodId}
            onCouponCodeChange={setCouponCode}
            onValidateCoupon={handleValidateCoupon}
            onSubmitOrder={handleSubmitOrder}
          />
        </div>
      </div>
    </div>
  );
}
