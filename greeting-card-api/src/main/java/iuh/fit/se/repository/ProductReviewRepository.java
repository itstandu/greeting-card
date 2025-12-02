package iuh.fit.se.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.ProductReview;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
  Optional<ProductReview> findByProductIdAndUserId(Long productId, Long userId);

  List<ProductReview> findByProductId(Long productId);

  List<ProductReview> findByUserId(Long userId);

  // Customer: get approved reviews for a product
  Page<ProductReview> findByProductIdAndIsApprovedTrue(Long productId, Pageable pageable);

  // Customer: get approved reviews with rating filter
  Page<ProductReview> findByProductIdAndIsApprovedTrueAndRating(
      Long productId, Integer rating, Pageable pageable);

  // Admin: get all reviews with filters
  @Query(
      "SELECT r FROM ProductReview r WHERE "
          + "(:productId IS NULL OR r.product.id = :productId) AND "
          + "(:isApproved IS NULL OR r.isApproved = :isApproved) AND "
          + "(:rating IS NULL OR r.rating = :rating) AND "
          + "(:search IS NULL OR r.comment LIKE %:search% OR r.user.fullName LIKE %:search%)")
  Page<ProductReview> findAllWithFilters(
      @Param("productId") Long productId,
      @Param("isApproved") Boolean isApproved,
      @Param("rating") Integer rating,
      @Param("search") String search,
      Pageable pageable);

  // Stats queries
  @Query(
      "SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.isApproved = true")
  Double getAverageRatingByProductId(@Param("productId") Long productId);

  @Query(
      "SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.isApproved = true")
  Long countApprovedByProductId(@Param("productId") Long productId);

  @Query(
      "SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.isApproved = true GROUP BY r.rating")
  List<Object[]> getRatingDistributionByProductId(@Param("productId") Long productId);

  // Check if user has purchased product
  @Query(
      "SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi "
          + "WHERE oi.product.id = :productId AND oi.order.user.id = :userId AND oi.order.status = 'DELIVERED'")
  boolean hasUserPurchasedProduct(@Param("productId") Long productId, @Param("userId") Long userId);
}
