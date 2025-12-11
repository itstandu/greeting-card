package iuh.fit.se.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
  // Find product by slug with eager fetch of category
  @Query(
      "SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.slug = :slug AND p.deletedAt IS NULL")
  Optional<Product> findBySlug(@Param("slug") String slug);

  // Find product by slug with category (images/tags loaded via @BatchSize)
  @Query(
      "SELECT p FROM Product p "
          + "LEFT JOIN FETCH p.category "
          + "WHERE p.slug = :slug AND p.deletedAt IS NULL")
  Optional<Product> findBySlugWithDetails(@Param("slug") String slug);

  // Find product by ID with category and images
  @Query(
      "SELECT p FROM Product p "
          + "LEFT JOIN FETCH p.category "
          + "LEFT JOIN FETCH p.images "
          + "WHERE p.id = :id AND p.deletedAt IS NULL")
  Optional<Product> findByIdWithImages(@Param("id") Long id);

  // Find product by ID with category (images/tags loaded via @BatchSize)
  @Query(
      "SELECT p FROM Product p "
          + "LEFT JOIN FETCH p.category "
          + "WHERE p.id = :id AND p.deletedAt IS NULL")
  Optional<Product> findByIdWithDetails(@Param("id") Long id);

  boolean existsBySlug(String slug);

  boolean existsBySku(String sku);

  @Query(
      value =
          """
            SELECT DISTINCT p.* FROM products p
            LEFT JOIN categories c ON c.id = p.category_id AND c.deleted_at IS NULL
            WHERE p.deleted_at IS NULL
            AND (:categoryId IS NULL OR p.category_id = :categoryId)
            AND (:isActive IS NULL OR p.is_active = :isActive)
            AND (:isFeatured IS NULL OR p.is_featured = :isFeatured)
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR (:inStock = false))
            AND (:keywordPattern IS NULL
                OR LOWER(p.name) LIKE LOWER(:keywordPattern)
                OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(:keywordPattern))
                OR LOWER(p.sku) LIKE LOWER(:keywordPattern)
            )
            ORDER BY p.created_at DESC
            """,
      countQuery =
          """
            SELECT COUNT(DISTINCT p.id) FROM products p
            LEFT JOIN categories c ON c.id = p.category_id AND c.deleted_at IS NULL
            WHERE p.deleted_at IS NULL
            AND (:categoryId IS NULL OR p.category_id = :categoryId)
            AND (:isActive IS NULL OR p.is_active = :isActive)
            AND (:isFeatured IS NULL OR p.is_featured = :isFeatured)
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR (:inStock = false))
            AND (:keywordPattern IS NULL
                OR LOWER(p.name) LIKE LOWER(:keywordPattern)
                OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(:keywordPattern))
                OR LOWER(p.sku) LIKE LOWER(:keywordPattern)
            )
            """,
      nativeQuery = true)
  Page<Product> searchProducts(
      @Param("categoryId") Long categoryId,
      @Param("isActive") Boolean isActive,
      @Param("isFeatured") Boolean isFeatured,
      @Param("minPrice") Double minPrice,
      @Param("maxPrice") Double maxPrice,
      @Param("inStock") Boolean inStock,
      @Param("keywordPattern") String keywordPattern,
      Pageable pageable);

  // Search products with multiple category IDs
  @Query(
      value =
          """
            SELECT DISTINCT p.* FROM products p
            LEFT JOIN categories c ON c.id = p.category_id AND c.deleted_at IS NULL
            WHERE p.deleted_at IS NULL
            AND p.category_id IN (:categoryIds)
            AND (:isActive IS NULL OR p.is_active = :isActive)
            AND (:isFeatured IS NULL OR p.is_featured = :isFeatured)
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR (:inStock = false))
            AND (:keywordPattern IS NULL
                OR LOWER(p.name) LIKE LOWER(:keywordPattern)
                OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(:keywordPattern))
                OR LOWER(p.sku) LIKE LOWER(:keywordPattern)
            )
            ORDER BY p.created_at DESC
            """,
      countQuery =
          """
            SELECT COUNT(DISTINCT p.id) FROM products p
            LEFT JOIN categories c ON c.id = p.category_id AND c.deleted_at IS NULL
            WHERE p.deleted_at IS NULL
            AND p.category_id IN (:categoryIds)
            AND (:isActive IS NULL OR p.is_active = :isActive)
            AND (:isFeatured IS NULL OR p.is_featured = :isFeatured)
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR (:inStock = false))
            AND (:keywordPattern IS NULL
                OR LOWER(p.name) LIKE LOWER(:keywordPattern)
                OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(:keywordPattern))
                OR LOWER(p.sku) LIKE LOWER(:keywordPattern)
            )
            """,
      nativeQuery = true)
  Page<Product> searchProductsByCategories(
      @Param("categoryIds") List<Long> categoryIds,
      @Param("isActive") Boolean isActive,
      @Param("isFeatured") Boolean isFeatured,
      @Param("minPrice") Double minPrice,
      @Param("maxPrice") Double maxPrice,
      @Param("inStock") Boolean inStock,
      @Param("keywordPattern") String keywordPattern,
      Pageable pageable);

  // Dashboard: Get low stock products
  @Query(
      "SELECT p FROM Product p "
          + "LEFT JOIN FETCH p.category "
          + "LEFT JOIN FETCH p.images "
          + "WHERE p.deletedAt IS NULL "
          + "  AND p.stock <= :threshold "
          + "  AND p.isActive = true "
          + "ORDER BY p.stock ASC")
  List<Product> findLowStockProducts(@Param("threshold") Integer threshold, Pageable pageable);

  // Dashboard: Get best-selling products
  @Query(
      value =
          """
          SELECT p.id as productId,
                 p.name as productName,
                 p.slug as productSlug,
                 (SELECT pi.image_url
                  FROM product_images pi
                  WHERE pi.product_id = p.id
                  ORDER BY pi.is_primary DESC, pi.display_order ASC
                  LIMIT 1) as productImage,
                 COALESCE(SUM(oi.quantity), 0) as totalSold,
                 COALESCE(SUM(oi.subtotal), 0) as totalRevenue
          FROM products p
          LEFT JOIN order_items oi ON p.id = oi.product_id
          LEFT JOIN orders o ON oi.order_id = o.id
          WHERE p.deleted_at IS NULL
            AND (o.status IS NULL OR o.status != 'CANCELLED')
          GROUP BY p.id, p.name, p.slug
          ORDER BY totalSold DESC
          """,
      nativeQuery = true)
  List<Object[]> findBestSellingProducts(Pageable pageable);

  // Dashboard: Count active products
  long countByIsActiveAndDeletedAtIsNull(Boolean isActive);

  // Dashboard: Count low stock products
  @Query(
      "SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL AND p.isActive = true AND p.stock <= :threshold")
  Long countLowStockProducts(@Param("threshold") Integer threshold);

  // Check if product has any order items (for deletion safeguard)
  @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.product.id = :productId")
  boolean hasOrderItems(@Param("productId") Long productId);
}
