'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CartPromotionPreview } from '@/services/promotion.service';
import type { Cart } from '@/types';
import {
  AlertCircle,
  Check,
  CreditCard,
  Gift,
  LoaderIcon,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react';

interface CheckoutOrderSummaryProps {
  cart: Cart;
  promotionPreview: CartPromotionPreview | null;
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const getPromotionLabel = (type: 'BOGO' | 'BUY_X_GET_Y' | 'BUY_X_PAY_Y' | 'DISCOUNT') => {
  switch (type) {
    case 'BOGO':
      return 'Mua 1 tặng 1';
    case 'BUY_X_GET_Y':
      return 'Mua X tặng Y';
    case 'BUY_X_PAY_Y':
      return 'Mua X trả Y';
    case 'DISCOUNT':
      return 'Giảm giá';
  }
};

export function CheckoutOrderSummary({
  cart,
  promotionPreview,
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
  const [localCouponCode, setLocalCouponCode] = useState(couponCode);

  // Calculate item-level promotion discount (BUY_X_PAY_Y and DISCOUNT types)
  const itemPromotionDiscount =
    promotionPreview?.itemPromotions
      .filter(item => item.promotionType === 'BUY_X_PAY_Y' || item.promotionType === 'DISCOUNT')
      .reduce((sum, item) => sum + item.discountAmount, 0) ?? 0;

  // ORDER scope promotion discount
  const orderPromotionDiscount = promotionPreview?.orderDiscountAmount ?? 0;

  // Total promotion discount (item-level + order-level)
  const promotionDiscount = itemPromotionDiscount + orderPromotionDiscount;

  // Shipping fee from backend
  const shippingFee = promotionPreview?.shippingFee ?? 30000;
  const freeShippingThreshold = promotionPreview?.freeShippingThreshold ?? 500000;
  const subtotalAfterDiscount = cart.total - promotionDiscount - couponDiscount;
  const isFreeShipping = subtotalAfterDiscount >= freeShippingThreshold;
  const finalAmount = subtotalAfterDiscount + (isFreeShipping ? 0 : shippingFee);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Đơn hàng của bạn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product List */}
        <div className="max-h-64 space-y-3 overflow-y-auto">
          {promotionPreview?.itemPromotions.map(item => (
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
                  {formatCurrency(item.price)} x {item.quantity}
                </p>
                {item.promotionType && item.freeQuantity > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    <Gift className="mr-1 h-3 w-3" />
                    {getPromotionLabel(item.promotionType)}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(item.subtotal)}</p>
                {(item.promotionType === 'BUY_X_PAY_Y' || item.promotionType === 'DISCOUNT') &&
                  item.discountAmount > 0 && (
                    <p className="text-xs text-green-600">-{formatCurrency(item.discountAmount)}</p>
                  )}
              </div>
            </div>
          )) ??
            cart.items.map(item => (
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
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
        </div>

        {/* Free Items from Promotion */}
        {promotionPreview && promotionPreview.freeItems.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-green-600">
                <Gift className="h-4 w-4" />
                Sản phẩm được tặng
              </Label>
              <div className="space-y-2">
                {promotionPreview.freeItems.map(item => (
                  <div
                    key={`free-${item.productId}-${item.promotionId}`}
                    className="flex items-center gap-3 rounded-md bg-green-50 p-2"
                  >
                    <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.productName}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.promotionName} - x{item.freeQuantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">0₫</p>
                      <p className="text-muted-foreground text-xs line-through">
                        {formatCurrency(item.originalPrice * item.freeQuantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

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
              value={localCouponCode}
              onChange={e => {
                const value = e.target.value;
                setLocalCouponCode(value);
                onCouponCodeChange(value.toUpperCase());
              }}
              disabled={couponDiscount > 0}
              className="uppercase"
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
            <span>{formatCurrency(cart.total)}</span>
          </div>
          {itemPromotionDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Gift className="h-3 w-3" />
                Khuyến mãi sản phẩm
              </span>
              <span className="text-green-600">-{formatCurrency(itemPromotionDiscount)}</span>
            </div>
          )}
          {orderPromotionDiscount > 0 && promotionPreview?.appliedOrderPromotion && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {promotionPreview.appliedOrderPromotion.name}
              </span>
              <span className="text-green-600">-{formatCurrency(orderPromotionDiscount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã giảm giá</span>
              <span className="text-green-600">-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="h-4 w-4" />
              Phí vận chuyển
            </span>
            {isFreeShipping ? (
              <span className="text-green-600">Miễn phí</span>
            ) : (
              <span>{formatCurrency(shippingFee)}</span>
            )}
          </div>
          {!isFreeShipping && (
            <p className="text-muted-foreground text-xs">
              Miễn phí vận chuyển cho đơn hàng từ {formatCurrency(freeShippingThreshold)}
            </p>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">
              {formatCurrency(finalAmount > 0 ? finalAmount : 0)}
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
