package iuh.fit.se.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCouponRequest {
  @NotBlank(message = "Mã coupon không được để trống")
  @Size(min = 3, max = 50, message = "Mã coupon phải từ 3-50 ký tự")
  private String code;

  @NotNull(message = "Loại giảm giá không được để trống")
  private DiscountType discountType;

  @NotNull(message = "Giá trị giảm không được để trống")
  @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
  private BigDecimal discountValue;

  @DecimalMin(value = "0", message = "Giá trị đơn hàng tối thiểu phải >= 0")
  private BigDecimal minPurchase;

  @DecimalMin(value = "0", message = "Giảm giá tối đa phải >= 0")
  private BigDecimal maxDiscount;

  @NotNull(message = "Ngày bắt đầu không được để trống")
  @FutureOrPresent(message = "Ngày bắt đầu phải từ hiện tại trở đi")
  private LocalDateTime validFrom;

  @NotNull(message = "Ngày kết thúc không được để trống")
  private LocalDateTime validUntil;

  @Positive(message = "Giới hạn sử dụng phải > 0")
  private Integer usageLimit;

  private Boolean isActive = true;
}
