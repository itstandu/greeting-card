export const USER_ROLE = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  ADMIN: 'Quản trị viên',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao hàng',
  DELIVERED: 'Đã nhận hàng',
  CANCELLED: 'Đã hủy',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  SHIPPED: 'bg-purple-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-500',
  PAID: 'bg-green-500',
  FAILED: 'bg-red-500',
  REFUNDED: 'bg-gray-500',
};

export const PAYMENT_STATUS_VARIANTS: Record<
  PaymentStatus,
  'default' | 'secondary' | 'destructive'
> = {
  PENDING: 'secondary',
  PAID: 'default',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
};

export const NOTIFICATION_TYPE = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  ORDER: 'Đơn hàng',
  PRODUCT: 'Sản phẩm',
  SYSTEM: 'Hệ thống',
};

export const DISCOUNT_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: 'Phần trăm',
  FIXED_AMOUNT: 'Số tiền cố định',
};

export const PROMOTION_TYPE = {
  DISCOUNT: 'DISCOUNT',
  BOGO: 'BOGO',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
  BUY_X_PAY_Y: 'BUY_X_PAY_Y',
} as const;

export type PromotionType = (typeof PROMOTION_TYPE)[keyof typeof PROMOTION_TYPE];

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  DISCOUNT: 'Giảm giá',
  BOGO: 'Mua 1 tặng 1',
  BUY_X_GET_Y: 'Mua X tặng Y',
  BUY_X_PAY_Y: 'Mua X trả Y',
};

export const PROMOTION_SCOPE = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
} as const;

export type PromotionScope = (typeof PROMOTION_SCOPE)[keyof typeof PROMOTION_SCOPE];

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  ORDER: 'Toàn bộ đơn hàng',
  PRODUCT: 'Sản phẩm',
  CATEGORY: 'Danh mục',
};

export const STOCK_TRANSACTION_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

export type StockTransactionType =
  (typeof STOCK_TRANSACTION_TYPE)[keyof typeof STOCK_TRANSACTION_TYPE];

export const STOCK_TRANSACTION_TYPE_LABELS: Record<StockTransactionType, string> = {
  IN: 'Nhập kho',
  OUT: 'Xuất kho',
  ADJUSTMENT: 'Điều chỉnh',
};

export const STOCK_TRANSACTION_TYPE_COLORS: Record<StockTransactionType, string> = {
  IN: 'bg-green-500',
  OUT: 'bg-red-500',
  ADJUSTMENT: 'bg-blue-500',
};

// Get label for order status
export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] || status;
}

// Get color for order status badge
export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status] || 'bg-gray-500';
}

// Get label for payment status
export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] || status;
}

// Get color for payment status badge
export function getPaymentStatusColor(status: PaymentStatus): string {
  return PAYMENT_STATUS_COLORS[status] || 'bg-gray-500';
}

// Get variant for payment status badge
export function getPaymentStatusVariant(
  status: PaymentStatus,
): 'default' | 'secondary' | 'destructive' {
  return PAYMENT_STATUS_VARIANTS[status] || 'secondary';
}

// Get label for notification type
export function getNotificationTypeLabel(type: NotificationType): string {
  return NOTIFICATION_TYPE_LABELS[type] || type;
}

// Get label for discount type
export function getDiscountTypeLabel(type: DiscountType): string {
  return DISCOUNT_TYPE_LABELS[type] || type;
}

// Get label for promotion type
export function getPromotionTypeLabel(type: PromotionType): string {
  return PROMOTION_TYPE_LABELS[type] || type;
}

// Get label for promotion scope
export function getPromotionScopeLabel(scope: PromotionScope): string {
  return PROMOTION_SCOPE_LABELS[scope] || scope;
}

// Get label for stock transaction type
export function getStockTransactionTypeLabel(type: StockTransactionType): string {
  return STOCK_TRANSACTION_TYPE_LABELS[type] || type;
}

// Get color for stock transaction type badge
export function getStockTransactionTypeColor(type: StockTransactionType): string {
  return STOCK_TRANSACTION_TYPE_COLORS[type] || 'bg-gray-500';
}

// Get label for user role
export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] || role;
}

export const CONTACT_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type ContactStatus = (typeof CONTACT_STATUS)[keyof typeof CONTACT_STATUS];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã phản hồi',
  CLOSED: 'Đã đóng',
};

export const CONTACT_STATUS_VARIANTS: Record<
  ContactStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  NEW: 'secondary',
  IN_PROGRESS: 'default',
  RESOLVED: 'outline',
  CLOSED: 'destructive',
};

export const CONTACT_CATEGORY_LABELS: Record<string, string> = {
  support: 'Hỗ trợ kỹ thuật',
  sales: 'Tư vấn bán hàng',
  feedback: 'Góp ý',
  partnership: 'Hợp tác',
  other: 'Khác',
};

export const CONTACT_CATEGORIES = [
  { value: 'support', label: 'Hỗ trợ kỹ thuật' },
  { value: 'sales', label: 'Tư vấn bán hàng' },
  { value: 'feedback', label: 'Góp ý' },
  { value: 'partnership', label: 'Hợp tác' },
  { value: 'other', label: 'Khác' },
] as const;

export function getContactStatusLabel(status: ContactStatus): string {
  return CONTACT_STATUS_LABELS[status] || status;
}
