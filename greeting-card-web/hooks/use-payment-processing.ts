import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { getOrderDetail } from '@/services/order.service';
import { processPayment } from '@/services/payment.service';
import type { Order } from '@/types';
import { AxiosError } from 'axios';

type PaymentStatus = 'processing' | 'success' | 'failed';

interface UsePaymentProcessingReturn {
  order: Order | null;
  paymentStatus: PaymentStatus;
  loading: boolean;
  error: string | null;
  retryPayment: () => Promise<void>;
}

export function usePaymentProcessing(orderId: number | null): UsePaymentProcessingReturn {
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processPaymentWithDelay = async (orderData: Order) => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      // Giả lập delay 2-3 giây để xử lý thanh toán
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      // Gọi API thanh toán
      const paymentResponse = await processPayment({
        orderId: orderData.id,
      });

      if (paymentResponse.data && paymentResponse.data.status === 'PAID') {
        setPaymentStatus('success');
        toast({
          title: '🎉 Thanh toán thành công!',
          description: `Đơn hàng ${orderData.orderNumber} đã được thanh toán thành công.`,
        });
      } else {
        setPaymentStatus('failed');
        setError(paymentResponse.data?.failureReason || 'Thanh toán thất bại');
        toast({
          title: 'Thanh toán thất bại',
          description: paymentResponse.data?.failureReason || 'Vui lòng thử lại sau.',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      let errorMessage = 'Có lỗi xảy ra khi xử lý thanh toán';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setPaymentStatus('failed');
      setError(errorMessage);
      toast({
        title: 'Lỗi thanh toán',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy đơn hàng');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await getOrderDetail(orderId);
        if (response.data) {
          setOrder(response.data);

          // Nếu đã thanh toán rồi, hiển thị success
          if (response.data.paymentStatus === 'PAID') {
            setPaymentStatus('success');
            setLoading(false);
            return;
          }

          // Nếu COD, không cần thanh toán
          if (response.data.paymentMethod.code === 'COD') {
            setPaymentStatus('success');
            setLoading(false);
            return;
          }

          // Bắt đầu xử lý thanh toán tự động
          processPaymentWithDelay(response.data);
        }
      } catch (err: unknown) {
        let errorMessage = 'Không thể tải thông tin đơn hàng';
        if (err instanceof AxiosError && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const retryPayment = async () => {
    if (order) {
      await processPaymentWithDelay(order);
    }
  };

  return {
    order,
    paymentStatus,
    loading,
    error,
    retryPayment,
  };
}
