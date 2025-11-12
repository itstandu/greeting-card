export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type Coupon = {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCouponRequest = {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  isActive?: boolean;
};

export type UpdateCouponRequest = {
  discountType?: DiscountType;
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  isActive?: boolean;
};

export type ValidateCouponRequest = {
  code: string;
  orderTotal: number;
};

export type ValidateCouponResponse = {
  valid: boolean;
  message: string;
  discountAmount: number;
  finalAmount: number;
  coupon: Coupon;
};
