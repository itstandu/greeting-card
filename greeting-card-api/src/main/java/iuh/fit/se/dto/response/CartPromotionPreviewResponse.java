package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.util.List;

import iuh.fit.se.entity.enumeration.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartPromotionPreviewResponse {
  private BigDecimal originalTotal;
  private BigDecimal promotionDiscount;
  private BigDecimal shippingFee;
  private BigDecimal freeShippingThreshold;
  private BigDecimal finalTotal;
  private List<ItemPromotion> itemPromotions;
  private List<FreeItem> freeItems;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ItemPromotion {
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private Long promotionId;
    private String promotionName;
    private PromotionType promotionType;
    private Integer freeQuantity;
    private BigDecimal discountAmount;
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class FreeItem {
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal originalPrice;
    private Integer freeQuantity;
    private Long promotionId;
    private String promotionName;
    private PromotionType promotionType;
  }
}
