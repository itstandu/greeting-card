'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { createAddress, CreateAddressRequest, getMyAddresses } from '@/services/address.service';
import { getCart } from '@/services/cart.service';
import { validateCoupon } from '@/services/coupon.service';
import { createOrder } from '@/services/order.service';
import { getPaymentMethods } from '@/services/payment-method.service';
import { Cart, CartResponse, PaymentMethod, UserAddress } from '@/types';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react';

// Helper function để convert CartResponse sang Cart
function convertCartResponseToCart(cartResponse: CartResponse): Cart {
  return {
    items: cartResponse.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.imageUrl,
      price: Number(item.product.price),
      quantity: item.quantity,
      stock: item.product.stock,
    })),
    total: Number(cartResponse.total),
    totalItems: cartResponse.totalItems,
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // State
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, totalItems: 0 });
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [notes, setNotes] = useState('');

  // New address form
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || authLoading) return;

      setLoading(true);
      try {
        // Fetch cart, addresses, and payment methods in parallel
        const [cartResponse, addressesResponse, paymentMethodsResponse] = await Promise.all([
          getCart(),
          getMyAddresses(),
          getPaymentMethods(),
        ]);

        if (cartResponse.data) {
          const cartData = convertCartResponseToCart(cartResponse.data);
          setCart(cartData);

          // Redirect to cart if empty
          if (cartData.items.length === 0) {
            toast({
              title: 'Giỏ hàng trống',
              description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
              variant: 'destructive',
            });
            router.push('/cart');
            return;
          }
        }

        if (addressesResponse.data) {
          setAddresses(addressesResponse.data);
          // Auto-select default address
          const defaultAddress = addressesResponse.data.find(a => a.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (addressesResponse.data.length > 0) {
            setSelectedAddressId(addressesResponse.data[0].id);
          }
        }

        if (paymentMethodsResponse.data) {
          setPaymentMethods(paymentMethodsResponse.data);
          // Auto-select first payment method
          if (paymentMethodsResponse.data.length > 0) {
            setSelectedPaymentMethodId(paymentMethodsResponse.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch checkout data:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  // Handle coupon validation
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponValidating(true);
    setCouponError('');
    setCouponDiscount(0);

    try {
      const response = await validateCoupon({ code: couponCode.trim(), orderTotal: cart.total });
      if (response.data && response.data.valid) {
        // Use the discount amount directly from the response
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
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
    } finally {
      setCouponValidating(false);
    }
  };

  // Handle new address creation
  const handleCreateAddress = async () => {
    if (
      !newAddress.recipientName.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.addressLine1.trim() ||
      !newAddress.city.trim()
    ) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

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
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể thêm địa chỉ mới',
        variant: 'destructive',
      });
    } finally {
      setNewAddressLoading(false);
    }
  };

  // Handle order submission
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
        // Clear local cart storage as well
        cartStorage.clearCart();
        window.dispatchEvent(new Event('cart-changed'));

        toast({
          title: '🎉 Đặt hàng thành công!',
          description: `Mã đơn hàng: ${response.data.orderNumber}. Đang chuyển đến trang thanh toán...`,
        });

        // Redirect to payment processing page
        router.push(`/checkout/payment/${response.data.id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi đặt hàng',
        description: error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const finalAmount = cart.total - couponDiscount;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/cart"
          className="text-muted-foreground hover:text-primary mb-4 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại giỏ hàng
        </Link>
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <p className="text-muted-foreground mt-2">
          Hoàn tất đơn hàng của bạn ({cart.totalItems} sản phẩm)
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping Address */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 && !showNewAddressForm ? (
                <div className="py-8 text-center">
                  <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
                  <Button onClick={() => setShowNewAddressForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm địa chỉ mới
                  </Button>
                </div>
              ) : (
                <>
                  <RadioGroup
                    value={selectedAddressId?.toString()}
                    onValueChange={value => setSelectedAddressId(parseInt(value))}
                  >
                    {addresses.map(address => (
                      <div
                        key={address.id}
                        className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <RadioGroupItem
                          value={address.id.toString()}
                          id={`address-${address.id}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`address-${address.id}`}
                              className="cursor-pointer font-semibold"
                            >
                              {address.recipientName}
                            </Label>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Mặc định
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1 text-sm">{address.phone}</p>
                          <p className="text-muted-foreground text-sm">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {[address.ward, address.district, address.city]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  {!showNewAddressForm && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowNewAddressForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm địa chỉ mới
                    </Button>
                  )}
                </>
              )}

              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                  <h4 className="font-semibold">Thêm địa chỉ mới</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">
                        Tên người nhận <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="recipientName"
                        placeholder="Nguyễn Văn A"
                        value={newAddress.recipientName}
                        onChange={e =>
                          setNewAddress(prev => ({ ...prev, recipientName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Số điện thoại <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="0912345678"
                        value={newAddress.phone}
                        onChange={e => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">
                      Địa chỉ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="addressLine1"
                      placeholder="Số nhà, tên đường"
                      value={newAddress.addressLine1}
                      onChange={e =>
                        setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="ward">Phường/Xã</Label>
                      <Input
                        id="ward"
                        placeholder="Phường 1"
                        value={newAddress.ward}
                        onChange={e => setNewAddress(prev => ({ ...prev, ward: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">Quận/Huyện</Label>
                      <Input
                        id="district"
                        placeholder="Quận 1"
                        value={newAddress.district}
                        onChange={e =>
                          setNewAddress(prev => ({ ...prev, district: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        Thành phố/Tỉnh <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="TP. Hồ Chí Minh"
                        value={newAddress.city}
                        onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateAddress}
                      disabled={newAddressLoading}
                    >
                      {newAddressLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Lưu địa chỉ
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPaymentMethodId?.toString()}
                onValueChange={value => setSelectedPaymentMethodId(parseInt(value))}
              >
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors ${
                      selectedPaymentMethodId === method.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPaymentMethodId(method.id)}
                  >
                    <RadioGroupItem value={method.id.toString()} id={`payment-${method.id}`} />
                    <div className="flex-1">
                      <Label
                        htmlFor={`payment-${method.id}`}
                        className="cursor-pointer font-semibold"
                      >
                        {method.name}
                      </Label>
                      {method.description && (
                        <p className="text-muted-foreground text-sm">{method.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ghi chú đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ghi chú về đơn hàng, ví dụ: yêu cầu giao hàng vào buổi sáng..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
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
                      <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                        {item.quantity}
                      </span>
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
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    disabled={couponDiscount > 0}
                  />
                  <Button
                    variant="outline"
                    onClick={handleValidateCoupon}
                    disabled={couponValidating || couponDiscount > 0 || !couponCode.trim()}
                  >
                    {couponValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : couponDiscount > 0 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      'Áp dụng'
                    )}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-destructive flex items-center gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {couponError}
                  </p>
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
                onClick={handleSubmitOrder}
                disabled={submitting || !selectedAddressId || !selectedPaymentMethodId}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        </div>
      </div>
    </div>
  );
}
