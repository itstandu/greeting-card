'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/types';
import { ArrowLeft, CreditCard, XCircle } from 'lucide-react';

interface PaymentFailedCardProps {
  order: Order;
  error: string | null;
  onRetry: () => Promise<void>;
}

export function PaymentFailedCard({ order, error, onRetry }: PaymentFailedCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <XCircle className="h-6 w-6" />
          Thanh toán thất bại
        </CardTitle>
        <CardDescription>
          Không thể xử lý thanh toán cho đơn hàng{' '}
          <span className="font-semibold">{order.orderNumber}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mã đơn hàng:</span>
            <span className="font-semibold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số tiền:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.finalAmount)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={onRetry}>
            <CreditCard className="mr-2 h-4 w-4" />
            Thử lại thanh toán
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại đơn hàng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
