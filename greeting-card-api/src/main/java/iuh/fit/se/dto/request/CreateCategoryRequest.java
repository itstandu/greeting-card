package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCategoryRequest {
  @NotBlank(message = "Tên danh mục không được để trống")
  @Size(
      min = 2,
      max = 255,
      message = "Tên danh mục phải có ít nhất 2 ký tự và không được vượt quá 255 ký tự")
  private String name;

  private String description;

  private Long parentId; // Optional - for hierarchical categories

  private String imageUrl;

  private Integer displayOrder = 0;

  private Boolean isActive = true;

  private Boolean isFeatured = false;
}
