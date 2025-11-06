package iuh.fit.se.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponResponse {
  private Boolean valid;
  private String message;
  private BigDecimal discountAmount;
  private BigDecimal finalAmount;
  private CouponResponse coupon;
}
