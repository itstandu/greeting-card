package iuh.fit.se.mapper;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.CategoryResponse;
import iuh.fit.se.dto.response.ProductImageResponse;
import iuh.fit.se.dto.response.ProductResponse;
import iuh.fit.se.dto.response.ProductTagResponse;
import iuh.fit.se.entity.Category;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.ProductImage;
import iuh.fit.se.entity.ProductTag;

@Component
public class ProductMapper {

  public ProductResponse toResponse(Product product) {
    return toResponse(product, Collections.emptySet(), Collections.emptySet());
  }

  /**
   * Convert Product to ProductResponse with wishlist/cart flags.
   *
   * @param product The product entity
   * @param wishlistProductIds Set of product IDs in user's wishlist (empty if not authenticated)
   * @param cartProductIds Set of product IDs in user's cart (empty if not authenticated)
   */
  public ProductResponse toResponse(
      Product product, Set<Long> wishlistProductIds, Set<Long> cartProductIds) {
    if (product == null) {
      return null;
    }

    // Check if product is in wishlist/cart using Set.contains() - O(1) lookup
    Boolean inWishlist =
        wishlistProductIds.isEmpty() ? null : wishlistProductIds.contains(product.getId());
    Boolean inCart = cartProductIds.isEmpty() ? null : cartProductIds.contains(product.getId());

    return ProductResponse.builder()
        .id(product.getId())
        .name(product.getName())
        .slug(product.getSlug())
        .description(product.getDescription())
        .price(product.getPrice())
        .stock(product.getStock())
        .sku(product.getSku())
        .isActive(product.getIsActive())
        .isFeatured(product.getIsFeatured())
        .category(toCategoryResponse(product.getCategory()))
        .images(
            product.getImages().stream()
                .map(this::toProductImageResponse)
                .collect(Collectors.toList()))
        .tags(
            product.getTags().stream().map(this::toProductTagResponse).collect(Collectors.toSet()))
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .inWishlist(inWishlist)
        .inCart(inCart)
        .build();
  }

  private CategoryResponse toCategoryResponse(Category category) {
    if (category == null) {
      return null;
    }
    return CategoryResponse.builder()
        .id(category.getId())
        .name(category.getName())
        .slug(category.getSlug())
        .description(category.getDescription())
        .isFeatured(category.getIsFeatured())
        .build();
  }

  private ProductImageResponse toProductImageResponse(ProductImage image) {
    if (image == null) {
      return null;
    }
    return ProductImageResponse.builder()
        .id(image.getId())
        .imageUrl(image.getImageUrl())
        .altText(image.getAltText())
        .isPrimary(image.getIsPrimary())
        .displayOrder(image.getDisplayOrder())
        .build();
  }

  private ProductTagResponse toProductTagResponse(ProductTag tag) {
    if (tag == null) {
      return null;
    }
    return ProductTagResponse.builder()
        .id(tag.getId())
        .name(tag.getName())
        .slug(tag.getSlug())
        .build();
  }
}
