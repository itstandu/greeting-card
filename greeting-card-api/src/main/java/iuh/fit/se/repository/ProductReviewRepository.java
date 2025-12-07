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

  // Fetch reviews with user info (optimized)
  @Query(
      "SELECT r FROM ProductReview r "
          + "LEFT JOIN FETCH r.user "
          + "WHERE r.product.id = :productId")
  List<ProductReview> findByProductId(@Param("productId") Long productId);

  @Query(
      "SELECT r FROM ProductReview r " + "LEFT JOIN FETCH r.product " + "WHERE r.user.id = :userId")
  List<ProductReview> findByUserId(@Param("userId") Long userId);

  // Customer: get approved reviews for a product with user info
  @Query(
      value =
          "SELECT r FROM ProductReview r "
              + "LEFT JOIN FETCH r.user "
              + "WHERE r.product.id = :productId AND r.isApproved = true",
      countQuery =
          "SELECT COUNT(r) FROM ProductReview r "
              + "WHERE r.product.id = :productId AND r.isApproved = true")
  Page<ProductReview> findByProductIdAndIsApprovedTrue(
      @Param("productId") Long productId, Pageable pageable);

  // Customer: get approved reviews with rating filter
  @Query(
      value =
          "SELECT r FROM ProductReview r "
              + "LEFT JOIN FETCH r.user "
              + "WHERE r.product.id = :productId AND r.isApproved = true AND r.rating = :rating",
      countQuery =
          "SELECT COUNT(r) FROM ProductReview r "
              + "WHERE r.product.id = :productId AND r.isApproved = true AND r.rating = :rating")
  Page<ProductReview> findByProductIdAndIsApprovedTrueAndRating(
      @Param("productId") Long productId, @Param("rating") Integer rating, Pageable pageable);

  // Admin: get all reviews with filters (optimized with JOIN FETCH)
  @Query(
      value =
          "SELECT r FROM ProductReview r "
              + "LEFT JOIN FETCH r.user "
              + "LEFT JOIN FETCH r.product "
              + "WHERE (:productId IS NULL OR r.product.id = :productId) "
              + "AND (:isApproved IS NULL OR r.isApproved = :isApproved) "
              + "AND (:rating IS NULL OR r.rating = :rating) "
              + "AND (:search IS NULL OR r.comment LIKE %:search% OR r.user.fullName LIKE %:search%)",
      countQuery =
          "SELECT COUNT(r) FROM ProductReview r "
              + "WHERE (:productId IS NULL OR r.product.id = :productId) "
              + "AND (:isApproved IS NULL OR r.isApproved = :isApproved) "
              + "AND (:rating IS NULL OR r.rating = :rating) "
              + "AND (:search IS NULL OR r.comment LIKE %:search% OR r.user.fullName LIKE %:search%)")
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
