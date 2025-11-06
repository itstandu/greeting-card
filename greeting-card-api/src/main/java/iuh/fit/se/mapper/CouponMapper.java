package iuh.fit.se.mapper;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.CouponResponse;
import iuh.fit.se.entity.Coupon;

@Component
public class CouponMapper {
  public CouponResponse toResponse(Coupon coupon) {
    if (coupon == null) {
      return null;
    }

    return CouponResponse.builder()
        .id(coupon.getId())
        .code(coupon.getCode())
        .discountType(coupon.getDiscountType())
        .discountValue(coupon.getDiscountValue())
        .minPurchase(coupon.getMinPurchase())
        .maxDiscount(coupon.getMaxDiscount())
        .validFrom(coupon.getValidFrom())
        .validUntil(coupon.getValidUntil())
        .usageLimit(coupon.getUsageLimit())
        .usedCount(coupon.getUsedCount())
        .isActive(coupon.getIsActive())
        .createdAt(coupon.getCreatedAt())
        .updatedAt(coupon.getUpdatedAt())
        .build();
  }
}
