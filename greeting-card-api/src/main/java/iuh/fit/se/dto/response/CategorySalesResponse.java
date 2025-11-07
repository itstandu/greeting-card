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
public class CategorySalesResponse {
  private Long categoryId;
  private String categoryName;
  private String categorySlug;
  private BigDecimal revenue;
  private Long orderCount;
  private Long productCount;
}
