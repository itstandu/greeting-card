export type PromotionType = 'DISCOUNT' | 'BOGO' | 'BUY_X_GET_Y' | 'BUY_X_PAY_Y';

// Promotion uses FIXED, Coupon uses FIXED_AMOUNT
export type PromotionDiscountType = 'PERCENTAGE' | 'FIXED';

export type PromotionScope = 'ORDER' | 'PRODUCT' | 'CATEGORY';

export type Promotion = {
  id: number;
  name: string;
  description?: string;
  type: PromotionType;
  scope: PromotionScope;
  discountType?: PromotionDiscountType;
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  payQuantity?: number;
  productIds?: number[];
  categoryId?: number;
  categoryName?: string;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePromotionRequest = {
  name: string;
  description?: string;
  type: PromotionType;
  scope: PromotionScope;
  discountType?: PromotionDiscountType;
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  payQuantity?: number;
  productIds?: number[];
  categoryId?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  isActive?: boolean;
};

export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;
