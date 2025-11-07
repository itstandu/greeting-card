package iuh.fit.se.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockProductResponse {
  private Long productId;
  private String productName;
  private String productSlug;
  private String productImage;
  private Integer currentStock;
  private String categoryName;
}
