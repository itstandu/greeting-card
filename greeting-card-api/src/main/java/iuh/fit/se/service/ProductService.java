package iuh.fit.se.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateProductRequest;
import iuh.fit.se.dto.request.ProductImageRequest;
import iuh.fit.se.dto.request.UpdateProductRequest;
import iuh.fit.se.dto.response.ProductResponse;
import iuh.fit.se.entity.Category;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.ProductImage;
import iuh.fit.se.entity.ProductTag;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.ProductMapper;
import iuh.fit.se.repository.CartItemRepository;
import iuh.fit.se.repository.CategoryRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.ProductTagRepository;
import iuh.fit.se.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final ProductTagRepository productTagRepository;
  private final ProductMapper productMapper;
  private final CloudinaryService cloudinaryService;
  private final WishlistItemRepository wishlistItemRepository;
  private final CartItemRepository cartItemRepository;

  /**
   * Get products with optional user-specific flags (inWishlist, inCart).
   *
   * @param userId User ID (can be null for guest users)
   */
  @Transactional(readOnly = true)
  public Page<ProductResponse> getProducts(
      Long categoryId,
      Boolean isActive,
      Boolean isFeatured,
      String keyword,
      Pageable pageable,
      Long userId) {
    Pageable pageableWithoutSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

    // Create keyword pattern for LIKE query (avoid CONCAT/LENGTH in JPQL to prevent PostgreSQL
    // bytea casting issues)
    // Process keyword in Java to avoid PostgreSQL type casting problems
    String keywordPattern = null;
    if (keyword != null && !keyword.trim().isEmpty()) {
      keywordPattern = "%" + keyword.trim() + "%";
    }

    Page<Product> productPage =
        productRepository.searchProducts(
            categoryId, isActive, isFeatured, keywordPattern, pageableWithoutSort);

    // Query wishlist/cart product IDs once for the user (not per product!)
    Set<Long> wishlistProductIds = Collections.emptySet();
    Set<Long> cartProductIds = Collections.emptySet();

    if (userId != null) {
      // Single query to get all product IDs in user's wishlist
      wishlistProductIds = wishlistItemRepository.findProductIdsByUserId(userId);
      // Single query to get all product IDs in user's cart
      cartProductIds = cartItemRepository.findProductIdsByUserId(userId);
    }

    // Use final variables for lambda
    final Set<Long> finalWishlistIds = wishlistProductIds;
    final Set<Long> finalCartIds = cartProductIds;

    // Initialize collections to trigger batch loading within transaction
    // This ensures images and tags are loaded efficiently via @BatchSize
    productPage
        .getContent()
        .forEach(
            product -> {
              product.getImages().size(); // Trigger batch load for images
              product.getTags().size(); // Trigger batch load for tags
            });

    return productPage.map(
        product -> productMapper.toResponse(product, finalWishlistIds, finalCartIds));
  }

  /** Get products without user context (for backward compatibility). */
  @Transactional(readOnly = true)
  public Page<ProductResponse> getProducts(
      Long categoryId, Boolean isActive, Boolean isFeatured, String keyword, Pageable pageable) {
    return getProducts(categoryId, isActive, isFeatured, keyword, pageable, null);
  }

  @Transactional(readOnly = true)
  public ProductResponse getProductBySlug(String slug, Long userId) {
    // Use optimized query that fetches all related data in one query
    Product product =
        productRepository
            .findBySlugWithDetails(slug)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy sản phẩm với slug: " + slug));
    return toProductResponseWithUserFlags(product, userId);
  }

  @Transactional(readOnly = true)
  public ProductResponse getProductBySlug(String slug) {
    return getProductBySlug(slug, null);
  }

  @Transactional(readOnly = true)
  @SuppressWarnings("null")
  public ProductResponse getProductById(Long id, Long userId) {
    // Use optimized query that fetches all related data in one query
    Product product =
        productRepository
            .findByIdWithDetails(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    return toProductResponseWithUserFlags(product, userId);
  }

  @Transactional(readOnly = true)
  public ProductResponse getProductById(Long id) {
    return getProductById(id, null);
  }

  /** Helper method to convert Product to ProductResponse with user flags. */
  private ProductResponse toProductResponseWithUserFlags(Product product, Long userId) {
    if (userId == null) {
      return productMapper.toResponse(product);
    }

    Set<Long> wishlistProductIds = wishlistItemRepository.findProductIdsByUserId(userId);
    Set<Long> cartProductIds = cartItemRepository.findProductIdsByUserId(userId);
    return productMapper.toResponse(product, wishlistProductIds, cartProductIds);
  }

  @Transactional
  @SuppressWarnings("null")
  public ProductResponse createProduct(CreateProductRequest request) {
    Category category =
        categoryRepository
            .findById(request.getCategoryId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Không tìm thấy danh mục với ID: " + request.getCategoryId()));

    Product product = new Product();
    product.setName(request.getName());
    product.setSlug(generateUniqueSlug(request.getName()));
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setStock(request.getStock());
    product.setSku(request.getSku() != null ? request.getSku() : generateSku());
    product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
    product.setCategory(category);

    if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
      List<ProductTag> tags = productTagRepository.findAllById(request.getTagIds());
      product.setTags(new HashSet<>(tags));
    }

    if (request.getImages() != null && !request.getImages().isEmpty()) {
      addImagesToProduct(product, request.getImages());
    }

    product = productRepository.save(product);

    return productMapper.toResponse(product);
  }

  @Transactional
  @SuppressWarnings("null")
  public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
    Product product =
        productRepository
            .findByIdWithImages(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

    if (request.getCategoryId() != null) {
      Category category =
          categoryRepository
              .findById(request.getCategoryId())
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          "Không tìm thấy danh mục với ID: " + request.getCategoryId()));
      product.setCategory(category);
    }

    product.setName(request.getName());

    if (request.getDescription() != null) {
      product.setDescription(request.getDescription());
    }
    product.setPrice(request.getPrice());
    product.setStock(request.getStock());
    if (request.getSku() != null) {
      product.setSku(request.getSku());
    }
    if (request.getIsActive() != null) {
      product.setIsActive(request.getIsActive());
    }
    if (request.getIsFeatured() != null) {
      product.setIsFeatured(request.getIsFeatured());
    }

    if (request.getTagIds() != null) {
      List<ProductTag> tags = productTagRepository.findAllById(request.getTagIds());
      product.setTags(new HashSet<>(tags));
    }

    if (request.getImages() != null) {
      updateProductImages(product, request.getImages());
    }

    product = productRepository.save(product);
    return productMapper.toResponse(product);
  }

  @Transactional
  @SuppressWarnings("null")
  public void deleteProduct(Long id) {
    Product product =
        productRepository
            .findByIdWithImages(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

    // Check if product has any order items - safeguard against deleting products with existing
    // orders
    if (productRepository.hasOrderItems(id)) {
      throw new IllegalArgumentException(
          "Không thể xóa sản phẩm này vì đã có đơn hàng liên quan. "
              + "Bạn có thể vô hiệu hóa sản phẩm bằng cách đặt trạng thái 'Ngừng kinh doanh' thay vì xóa.");
    }

    List<String> imageUrls =
        product.getImages().stream()
            .map(ProductImage::getImageUrl)
            .filter(url -> url != null && !url.trim().isEmpty() && url.contains("cloudinary.com"))
            .toList();

    for (String imageUrl : imageUrls) {
      try {
        cloudinaryService.deleteFile(imageUrl);
      } catch (Exception e) {
        log.warn("Failed to delete image from Cloudinary: {}", imageUrl, e);
      }
    }

    productRepository.deleteById(id);
  }

  private String generateUniqueSlug(String name) {
    String baseSlug = toSlug(name);
    String slug = baseSlug;
    int counter = 1;
    while (productRepository.existsBySlug(slug)) {
      slug = baseSlug + "-" + counter;
      counter++;
    }
    return slug;
  }

  private String generateSku() {
    return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
  }

  private String toSlug(String input) {
    if (input == null) return "";
    return input.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
  }

  private void addImagesToProduct(Product product, List<ProductImageRequest> imageRequests) {
    for (int i = 0; i < imageRequests.size(); i++) {
      ProductImageRequest imageRequest = imageRequests.get(i);
      if (isValidImageRequest(imageRequest)) {
        ProductImage image = new ProductImage();
        image.setImageUrl(imageRequest.getImageUrl().trim());
        image.setAltText(imageRequest.getAltText());
        image.setProduct(product);
        image.setIsPrimary(i == 0);
        image.setDisplayOrder(i);
        product.getImages().add(image);
      }
    }
  }

  private void updateProductImages(Product product, List<ProductImageRequest> imageRequests) {
    product.getImages().size(); // Initialize collection if lazy loaded

    List<String> oldImageUrls =
        product.getImages().stream()
            .map(ProductImage::getImageUrl)
            .filter(url -> url != null && !url.trim().isEmpty())
            .toList();

    product.getImages().clear();

    if (!imageRequests.isEmpty()) {
      addImagesToProduct(product, imageRequests);
    }

    List<String> newImageUrls =
        product.getImages().stream()
            .map(ProductImage::getImageUrl)
            .filter(url -> url != null && !url.trim().isEmpty())
            .toList();

    deleteUnusedImages(oldImageUrls, newImageUrls);
  }

  private void deleteUnusedImages(List<String> oldImageUrls, List<String> newImageUrls) {
    for (String oldUrl : oldImageUrls) {
      if (oldUrl.contains("cloudinary.com") && !newImageUrls.contains(oldUrl)) {
        try {
          cloudinaryService.deleteFile(oldUrl);
        } catch (Exception e) {
          log.warn("Failed to delete old image from Cloudinary: {}", oldUrl, e);
        }
      }
    }
  }

  private boolean isValidImageRequest(ProductImageRequest request) {
    return request != null
        && request.getImageUrl() != null
        && !request.getImageUrl().trim().isEmpty();
  }
}
