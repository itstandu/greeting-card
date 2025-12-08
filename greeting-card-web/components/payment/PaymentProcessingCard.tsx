'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/types';
import { LoaderIcon } from 'lucide-react';

interface PaymentProcessingCardProps {
  order: Order;
}

export function PaymentProcessingCard({ order }: PaymentProcessingCardProps) {
  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LoaderIcon className="text-primary h-6 w-6 animate-spin" />
          Đang xử lý thanh toán
        </CardTitle>
        <CardDescription>
          Vui lòng đợi trong giây lát, chúng tôi đang xử lý thanh toán cho đơn hàng{' '}
          <span className="font-semibold">{order.orderNumber}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số tiền thanh toán:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.finalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phương thức thanh toán:</span>
            <span className="font-medium">{order.paymentMethod.name}</span>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Đang kết nối với cổng thanh toán...</p>
        </div>
      </CardContent>
    </Card>
  );
}
