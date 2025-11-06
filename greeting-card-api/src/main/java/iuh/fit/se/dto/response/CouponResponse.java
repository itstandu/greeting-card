package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
  private Long id;
  private String code;
  private DiscountType discountType;
  private BigDecimal discountValue;
  private BigDecimal minPurchase;
  private BigDecimal maxDiscount;
  private LocalDateTime validFrom;
  private LocalDateTime validUntil;
  private Integer usageLimit;
  private Integer usedCount;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
