package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
  private Long id;
  private String name;
  private String slug;
  private String description;
  private BigDecimal price;
  private Integer stock;
  private String sku;
  private Boolean isActive;
  private Boolean isFeatured;
  private CategoryResponse category;
  private List<ProductImageResponse> images;
  private Set<ProductTagResponse> tags;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // User-specific flags (only set when user is authenticated)
  private Boolean inWishlist;
  private Boolean inCart;
}
