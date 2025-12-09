'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils';
import { processPayment } from '@/services';
import type { Order, OrderPaymentMethod, Payment, ProcessPaymentRequest } from '@/types';
import { Building2, CheckCircle2, CreditCard, Smartphone, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type PaymentProcessingProps = {
  order: Order;
  paymentMethod: OrderPaymentMethod;
  onPaymentSuccess?: (payment: Payment) => void;
  onPaymentFailure?: (error: string) => void;
};

export function PaymentProcessing({
  order,
  paymentMethod,
  onPaymentSuccess,
  onPaymentFailure,
}: PaymentProcessingProps) {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<Partial<ProcessPaymentRequest>>({});
  const [error, setError] = useState<string | null>(null);

  const handleProcessPayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      const request: ProcessPaymentRequest = {
        orderId: order.id,
        ...paymentData,
      };

      const response = await processPayment(request);

      if (response.data.status === 'PAID') {
        toast.success('Thanh toán thành công!');
        setOpen(false);
        onPaymentSuccess?.(response.data);
      } else if (response.data.status === 'FAILED') {
        toast.error(response.data.failureReason || 'Thanh toán thất bại');
        onPaymentFailure?.(response.data.failureReason || 'Thanh toán thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thanh toán';
      setError(errorMessage);
      toast.error(errorMessage);
      onPaymentFailure?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod.code) {
      case 'COD':
        return (
          <Alert>
            <AlertDescription>
              Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Không cần thanh toán trước.
            </AlertDescription>
          </Alert>
        );

      case 'CREDIT_CARD':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Số thẻ</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber || ''}
                onChange={e => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                maxLength={19}
              />
            </div>
            <div>
              <Label htmlFor="cardHolderName">Tên chủ thẻ</Label>
              <Input
                id="cardHolderName"
                placeholder="NGUYEN VAN A"
                value={paymentData.cardHolderName || ''}
                onChange={e => setPaymentData({ ...paymentData, cardHolderName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate || ''}
                  onChange={e => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentData.cvv || ''}
                  onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value })}
                  maxLength={3}
                  type="password"
                />
              </div>
            </div>
          </div>
        );

      case 'BANK_TRANSFER':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Ngân hàng</Label>
              <Input
                id="bankName"
                placeholder="Vietcombank"
                value={paymentData.bankName || ''}
                onChange={e => setPaymentData({ ...paymentData, bankName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bankAccount">Số tài khoản</Label>
              <Input
                id="bankAccount"
                placeholder="1234567890"
                value={paymentData.bankAccount || ''}
                onChange={e => setPaymentData({ ...paymentData, bankAccount: e.target.value })}
              />
            </div>
          </div>
        );

      case 'MOMO':
      case 'ZALOPAY':
        return (
          <div>
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <Input
              id="phoneNumber"
              placeholder="0901234567"
              value={paymentData.phoneNumber || ''}
              onChange={e => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getPaymentIcon = () => {
    switch (paymentMethod.code) {
      case 'CREDIT_CARD':
        return <CreditCard className="h-5 w-5" />;
      case 'BANK_TRANSFER':
        return <Building2 className="h-5 w-5" />;
      case 'MOMO':
      case 'ZALOPAY':
        return <Smartphone className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (order.paymentStatus === 'PAID') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Đã thanh toán
          </CardTitle>
          <CardDescription>Đơn hàng đã được thanh toán thành công</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (paymentMethod.code === 'COD') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán khi nhận hàng (COD)</CardTitle>
          <CardDescription>
            Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Không cần thanh toán trước.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPaymentIcon()}
            {paymentMethod.name}
          </CardTitle>
          <CardDescription>
            Số tiền cần thanh toán: {formatCurrency(order.finalAmount)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)} className="w-full">
            Thanh toán ngay
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thanh toán đơn hàng {order.orderNumber}</DialogTitle>
            <DialogDescription>Số tiền: {formatCurrency(order.finalAmount)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {renderPaymentForm()}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={processing}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button onClick={handleProcessPayment} disabled={processing} className="flex-1">
                {processing ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận thanh toán'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
