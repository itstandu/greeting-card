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
public class BestSellingProductResponse {
  private Long productId;
  private String productName;
  private String productSlug;
  private String productImage;
  private Long totalSold;
  private BigDecimal totalRevenue;
}
