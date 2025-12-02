package iuh.fit.se.dto.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateProductRequest {
  @NotBlank(message = "Tên sản phẩm không được để trống")
  private String name;

  private String description;

  @NotNull(message = "Giá sản phẩm không được để trống")
  @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
  private BigDecimal price;

  @NotNull(message = "Số lượng tồn kho không được để trống")
  @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
  private Integer stock;

  private String sku;

  @NotNull(message = "Danh mục không được để trống")
  private Long categoryId;

  private Boolean isActive = true;

  private Boolean isFeatured = false;

  private List<ProductImageRequest> images; // List of images with URL and alt text

  private Set<Long> tagIds;
}
