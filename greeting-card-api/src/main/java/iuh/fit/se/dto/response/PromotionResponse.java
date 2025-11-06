package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.PromotionScope;
import iuh.fit.se.entity.enumeration.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
  private Long id;
  private String name;
  private String description;
  private PromotionType type;
  private PromotionScope scope;
  private DiscountType discountType;
  private BigDecimal discountValue;
  private BigDecimal minPurchase;
  private BigDecimal maxDiscount;
  private Integer buyQuantity;
  private Integer getQuantity;
  private Integer payQuantity;
  private List<Long> productIds;
  private Long categoryId;
  private String categoryName;
  private LocalDateTime validFrom;
  private LocalDateTime validUntil;
  private Integer usageLimit;
  private Integer usedCount;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
