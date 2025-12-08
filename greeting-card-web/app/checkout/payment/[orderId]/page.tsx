'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  PaymentErrorState,
  PaymentFailedCard,
  PaymentProcessingCard,
  PaymentSuccessCard,
} from '@/components/payment';
import { Spinner } from '@/components/ui/spinner';
import { usePaymentProcessing } from '@/hooks/use-payment-processing';
import { ArrowLeft } from 'lucide-react';

export default function PaymentProcessingPage() {
  const params = useParams();
  const orderId = params?.orderId ? Number(params.orderId) : null;
  const { order, paymentStatus, loading, error, retryPayment } = usePaymentProcessing(orderId);

  if (loading && !order) {
    return <Spinner message="Đang tải thông tin đơn hàng..." />;
  }

  if (error && !order) {
    return <PaymentErrorState error={error} />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {paymentStatus === 'processing' && <PaymentProcessingCard order={order} />}
        {paymentStatus === 'success' && <PaymentSuccessCard order={order} />}
        {paymentStatus === 'failed' && (
          <PaymentFailedCard order={order} error={error} onRetry={retryPayment} />
        )}

        {/* Back link */}
        <div className="mt-4">
          <Link
            href="/orders"
            className="text-muted-foreground hover:text-primary inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
