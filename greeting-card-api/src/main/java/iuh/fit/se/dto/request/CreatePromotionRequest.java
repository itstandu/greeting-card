package iuh.fit.se.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.PromotionScope;
import iuh.fit.se.entity.enumeration.PromotionType;
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
public class CreatePromotionRequest {
  @NotBlank(message = "Tên khuyến mãi không được để trống")
  @Size(min = 3, max = 255, message = "Tên khuyến mãi phải từ 3-255 ký tự")
  private String name;

  private String description;

  @NotNull(message = "Loại khuyến mãi không được để trống")
  private PromotionType type;

  @NotNull(message = "Phạm vi áp dụng không được để trống")
  private PromotionScope scope;

  // Cho DISCOUNT type
  private DiscountType discountType;
  private BigDecimal discountValue;
  private BigDecimal minPurchase;
  private BigDecimal maxDiscount;

  // Cho BUY_X_GET_Y và BUY_X_PAY_Y types
  @Positive(message = "Số lượng mua phải > 0")
  private Integer buyQuantity;

  @Positive(message = "Số lượng tặng phải > 0")
  private Integer getQuantity;

  @Positive(message = "Số lượng tính tiền phải > 0")
  private Integer payQuantity;

  // Cho PRODUCT scope
  private List<Long> productIds;

  // Cho CATEGORY scope
  private Long categoryId;

  @NotNull(message = "Ngày bắt đầu không được để trống")
  @FutureOrPresent(message = "Ngày bắt đầu phải từ hiện tại trở đi")
  private LocalDateTime validFrom;

  @NotNull(message = "Ngày kết thúc không được để trống")
  private LocalDateTime validUntil;

  @Positive(message = "Giới hạn sử dụng phải > 0")
  private Integer usageLimit;

  private Boolean isActive = true;
}
