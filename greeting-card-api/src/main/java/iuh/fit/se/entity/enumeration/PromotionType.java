package iuh.fit.se.entity.enumeration;

// Enum định nghĩa loại khuyến mãi
public enum PromotionType {
  DISCOUNT, // Giảm giá (giống coupon - PERCENTAGE hoặc FIXED_AMOUNT)
  BOGO, // Buy 1 Get 1 Free
  BUY_X_GET_Y, // Mua X tặng Y (ví dụ: mua 2 tặng 1)
  BUY_X_PAY_Y // Mua X tính tiền Y (ví dụ: mua 2 tính tiền 1)
}
