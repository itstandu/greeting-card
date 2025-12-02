package iuh.fit.se.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho thông tin hình ảnh sản phẩm bao gồm URL và alt text.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequest {
  // URL của hình ảnh trên Cloudinary
  private String imageUrl;

  // Alt text cho hình ảnh (SEO, accessibility)
  private String altText;
}
