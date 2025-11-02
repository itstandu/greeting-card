package iuh.fit.se.mapper;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.CategoryResponse;
import iuh.fit.se.entity.Category;

@Component
public class CategoryMapper {

  public CategoryResponse toResponse(Category category) {
    if (category == null) {
      return null;
    }

    return CategoryResponse.builder()
        .id(category.getId())
        .name(category.getName())
        .slug(category.getSlug())
        .description(category.getDescription())
        .parentId(category.getParent() != null ? category.getParent().getId() : null)
        .parentName(category.getParent() != null ? category.getParent().getName() : null)
        .imageUrl(category.getImageUrl())
        .displayOrder(category.getDisplayOrder())
        .isActive(category.getIsActive())
        .isFeatured(category.getIsFeatured())
        .createdAt(category.getCreatedAt())
        .updatedAt(category.getUpdatedAt())
        .build();
  }
}
