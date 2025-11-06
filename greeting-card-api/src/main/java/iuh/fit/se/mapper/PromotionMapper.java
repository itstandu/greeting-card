package iuh.fit.se.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.PromotionResponse;
import iuh.fit.se.entity.Promotion;

@Component
public class PromotionMapper {
  public PromotionResponse toResponse(Promotion promotion) {
    if (promotion == null) {
      return null;
    }

    return PromotionResponse.builder()
        .id(promotion.getId())
        .name(promotion.getName())
        .description(promotion.getDescription())
        .type(promotion.getType())
        .scope(promotion.getScope())
        .discountType(promotion.getDiscountType())
        .discountValue(promotion.getDiscountValue())
        .minPurchase(promotion.getMinPurchase())
        .maxDiscount(promotion.getMaxDiscount())
        .buyQuantity(promotion.getBuyQuantity())
        .getQuantity(promotion.getGetQuantity())
        .payQuantity(promotion.getPayQuantity())
        .productIds(
            promotion.getProducts() != null
                ? promotion.getProducts().stream().map(p -> p.getId()).collect(Collectors.toList())
                : null)
        .categoryId(promotion.getCategory() != null ? promotion.getCategory().getId() : null)
        .categoryName(promotion.getCategory() != null ? promotion.getCategory().getName() : null)
        .validFrom(promotion.getValidFrom())
        .validUntil(promotion.getValidUntil())
        .usageLimit(promotion.getUsageLimit())
        .usedCount(promotion.getUsedCount())
        .isActive(promotion.getIsActive())
        .createdAt(promotion.getCreatedAt())
        .updatedAt(promotion.getUpdatedAt())
        .build();
  }
}
