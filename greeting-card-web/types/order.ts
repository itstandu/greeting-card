export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type UserAddress = {
  id: number;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  isDefault: boolean;
};

export type OrderPaymentMethod = {
  id: number;
  name: string;
  code: string;
  description?: string;
};

export type Order = {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  shippingAddress: UserAddress;
  paymentMethod: OrderPaymentMethod;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderSimple = {
  id: number;
  orderNumber: string;
  orderDate: string;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalItems: number;
};

export type OrderStatusHistory = {
  id: number;
  status: OrderStatus;
  notes?: string;
  changedBy: string;
  createdAt: string;
};

export type CreateOrderRequest = {
  shippingAddressId: number;
  paymentMethodId: number;
  couponCode?: string;
  notes?: string;
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
  notes?: string;
};
