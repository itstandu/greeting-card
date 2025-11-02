package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
  private Long id;
  private String name;
  private String slug;
  private String description;
  private Long parentId;
  private String parentName;
  private String imageUrl;
  private Integer displayOrder;
  private Boolean isActive;
  private Boolean isFeatured;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
