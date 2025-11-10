export type PaymentStatusType = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePaymentMethodRequest = {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdatePaymentMethodRequest = {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdatePaymentMethodOrderRequest = {
  items: Array<{
    id: number;
    displayOrder: number;
  }>;
};

export type Payment = {
  id: number;
  orderId: number;
  orderNumber: string;
  paymentMethodId: number;
  paymentMethodName: string;
  paymentMethodCode: string;
  amount: number;
  status: PaymentStatusType;
  transactionId?: string;
  gatewayResponse?: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProcessPaymentRequest = {
  orderId: number;
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
  bankAccount?: string;
  bankName?: string;
  phoneNumber?: string;
  simulateFailure?: boolean;
  failureReason?: string;
};

export type RefundPaymentRequest = {
  paymentId: number;
  refundAmount: number;
  reason?: string;
};
