package iuh.fit.se.dto.response;

import java.math.BigDecimal;

import iuh.fit.se.entity.enumeration.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
  private Long id;
  private Long productId;
  private String productName;
  private String productImage; // URL hình ảnh chính
  private Integer quantity;
  private BigDecimal price;
  private BigDecimal subtotal;

  // Promotion info
  private Long promotionId;
  private String promotionName;
  private PromotionType promotionType;
  private BigDecimal promotionDiscountAmount;
  private Integer promotionQuantityFree; // Số lượng được tặng miễn phí
}
