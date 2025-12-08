package iuh.fit.se.dto.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProductRequest {
  @NotBlank(message = "Tên sản phẩm không được để trống")
  @Size(min = 2, message = "Tên sản phẩm phải có ít nhất 2 ký tự")
  private String name;

  private String description;

  @NotNull(message = "Giá sản phẩm không được để trống")
  @DecimalMin(value = "1000", message = "Giá phải lớn hơn 1.000đ")
  private BigDecimal price;

  @NotNull(message = "Số lượng tồn kho không được để trống")
  @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
  private Integer stock;

  private String sku;

  private Long categoryId;

  private Boolean isActive;

  private Boolean isFeatured;

  private List<ProductImageRequest> images;

  private Set<Long> tagIds;
}
