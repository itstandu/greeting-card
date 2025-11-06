package iuh.fit.se.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
  @NotBlank(message = "Mã coupon không được để trống")
  private String code;

  @NotNull(message = "Tổng tiền đơn hàng không được để trống")
  @DecimalMin(value = "0.01", message = "Tổng tiền đơn hàng phải lớn hơn 0")
  private BigDecimal orderTotal;
}
