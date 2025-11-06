package iuh.fit.se.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCouponRequest {
  private DiscountType discountType;

  @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
  private BigDecimal discountValue;

  @DecimalMin(value = "0", message = "Giá trị đơn hàng tối thiểu phải >= 0")
  private BigDecimal minPurchase;

  @DecimalMin(value = "0", message = "Giảm giá tối đa phải >= 0")
  private BigDecimal maxDiscount;

  private LocalDateTime validFrom;

  private LocalDateTime validUntil;

  @Positive(message = "Giới hạn sử dụng phải > 0")
  private Integer usageLimit;

  private Boolean isActive;
}
