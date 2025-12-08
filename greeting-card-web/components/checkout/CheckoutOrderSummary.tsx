'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Cart } from '@/types';
import { AlertCircle, Check, CreditCard, LoaderIcon, ShoppingBag, Tag, Truck } from 'lucide-react';

interface CheckoutOrderSummaryProps {
  cart: Cart;
  couponCode: string;
  couponDiscount: number;
  couponValidating: boolean;
  couponError: string;
  submitting: boolean;
  selectedAddressId: number | null;
  selectedPaymentMethodId: number | null;
  onCouponCodeChange: (code: string) => void;
  onValidateCoupon: () => Promise<void>;
  onSubmitOrder: () => Promise<void>;
}

export function CheckoutOrderSummary({
  cart,
  couponCode,
  couponDiscount,
  couponValidating,
  couponError,
  submitting,
  selectedAddressId,
  selectedPaymentMethodId,
  onCouponCodeChange,
  onValidateCoupon,
  onSubmitOrder,
}: CheckoutOrderSummaryProps) {
  const finalAmount = cart.total - couponDiscount;

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Đơn hàng của bạn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product List */}
        <div className="max-h-64 space-y-3 overflow-y-auto">
          {cart.items.map(item => (
            <div key={item.productId} className="flex gap-3">
              <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{item.productName}</p>
                <p className="text-muted-foreground text-sm">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.price)}{' '}
                  x {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Coupon */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Mã giảm giá
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={e => {
                onCouponCodeChange(e.target.value.toUpperCase());
              }}
              disabled={couponDiscount > 0}
            />
            <Button
              variant="outline"
              onClick={onValidateCoupon}
              disabled={couponValidating || couponDiscount > 0 || !couponCode.trim()}
            >
              {couponValidating ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : couponDiscount > 0 ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                'Áp dụng'
              )}
            </Button>
          </div>
          {couponError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-sm">{couponError}</AlertDescription>
            </Alert>
          )}
          {couponDiscount > 0 && (
            <p className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-3 w-3" />
              Đã áp dụng mã giảm giá
            </p>
          )}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(cart.total)}
            </span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá</span>
              <span className="text-green-600">
                -
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(couponDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="h-4 w-4" />
              Phí vận chuyển
            </span>
            <span className="text-green-600">Miễn phí</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(finalAmount)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={onSubmitOrder}
          disabled={submitting || !selectedAddressId || !selectedPaymentMethodId}
        >
          {submitting ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Đặt hàng
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
