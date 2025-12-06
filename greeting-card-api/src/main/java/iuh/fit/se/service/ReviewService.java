package iuh.fit.se.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateReviewRequest;
import iuh.fit.se.dto.request.UpdateReviewRequest;
import iuh.fit.se.dto.response.ReviewResponse;
import iuh.fit.se.dto.response.ReviewStatsResponse;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.ProductReview;
import iuh.fit.se.entity.User;
import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.ProductReviewRepository;
import iuh.fit.se.repository.UserRepository;
import iuh.fit.se.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReviewService {
  private final ProductReviewRepository reviewRepository;
  private final ProductRepository productRepository;
  private final UserRepository userRepository;

  // Customer: Get reviews for a product
  public Page<ReviewResponse> getProductReviews(
      Long productId, Integer rating, int page, int size) {
    Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());

    Page<ProductReview> reviews;
    if (rating != null) {
      reviews =
          reviewRepository.findByProductIdAndIsApprovedTrueAndRating(productId, rating, pageable);
    } else {
      reviews = reviewRepository.findByProductIdAndIsApprovedTrue(productId, pageable);
    }

    return reviews.map(this::toResponse);
  }

  // Customer: Get review stats for a product
  public ReviewStatsResponse getProductReviewStats(Long productId) {
    Double averageRating = reviewRepository.getAverageRatingByProductId(productId);
    Long totalReviews = reviewRepository.countApprovedByProductId(productId);
    List<Object[]> distribution = reviewRepository.getRatingDistributionByProductId(productId);

    Map<Integer, Long> ratingDistribution = new HashMap<>();
    for (int i = 1; i <= 5; i++) {
      ratingDistribution.put(i, 0L);
    }
    for (Object[] row : distribution) {
      Integer ratingValue = (Integer) row[0];
      Long count = (Long) row[1];
      ratingDistribution.put(ratingValue, count);
    }

    return ReviewStatsResponse.builder()
        .averageRating(averageRating != null ? averageRating : 0.0)
        .totalReviews(totalReviews)
        .ratingDistribution(ratingDistribution)
        .build();
  }

  // Customer: Create a review
  @Transactional
  @SuppressWarnings("null")
  public ReviewResponse createReview(Long productId, CreateReviewRequest request) {
    Long userId = SecurityUtils.getCurrentUserId();

    // Check if product exists
    Product product =
        productRepository
            .findById(productId)
            .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", ErrorCode.NOT_FOUND));

    // Check if user exists
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new AppException("Không tìm thấy người dùng", ErrorCode.NOT_FOUND));

    // Check if user already reviewed this product
    if (reviewRepository.findByProductIdAndUserId(productId, userId).isPresent()) {
      throw new AppException("Bạn đã đánh giá sản phẩm này rồi", ErrorCode.REVIEW_ALREADY_EXISTS);
    }

    // Check if user has purchased this product - REQUIRED for review
    boolean isVerifiedPurchase = reviewRepository.hasUserPurchasedProduct(productId, userId);
    if (!isVerifiedPurchase) {
      throw new AppException(
          "Bạn cần mua sản phẩm này trước khi có thể đánh giá", ErrorCode.REVIEW_NOT_PURCHASED);
    }

    ProductReview review = new ProductReview();
    review.setProduct(product);
    review.setUser(user);
    review.setRating(request.getRating());
    review.setComment(request.getComment());
    review.setIsVerifiedPurchase(isVerifiedPurchase);
    review.setIsApproved(false); // Needs admin approval

    review = reviewRepository.save(review);
    log.info("Created review {} for product {} by user {}", review.getId(), productId, userId);

    return toResponse(review);
  }

  // Customer: Update own review
  @Transactional
  @SuppressWarnings("null")
  public ReviewResponse updateReview(Long productId, Long reviewId, UpdateReviewRequest request) {
    Long userId = SecurityUtils.getCurrentUserId();

    ProductReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", ErrorCode.NOT_FOUND));

    // Check ownership
    if (!review.getUser().getId().equals(userId)) {
      throw new AppException("Bạn không có quyền sửa đánh giá này", ErrorCode.FORBIDDEN);
    }

    // Check if review belongs to this product
    if (!review.getProduct().getId().equals(productId)) {
      throw new AppException("Đánh giá không thuộc sản phẩm này", ErrorCode.NOT_FOUND);
    }

    if (request.getRating() != null) {
      review.setRating(request.getRating());
    }
    if (request.getComment() != null) {
      review.setComment(request.getComment());
    }
    // Reset approval status after update
    review.setIsApproved(false);

    review = reviewRepository.save(review);
    log.info("Updated review {} by user {}", reviewId, userId);

    return toResponse(review);
  }

  // Customer: Delete own review
  @Transactional
  @SuppressWarnings("null")
  public void deleteReview(Long productId, Long reviewId) {
    Long userId = SecurityUtils.getCurrentUserId();

    ProductReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", ErrorCode.NOT_FOUND));

    // Check ownership
    if (!review.getUser().getId().equals(userId)) {
      throw new AppException("Bạn không có quyền xóa đánh giá này", ErrorCode.FORBIDDEN);
    }

    // Check if review belongs to this product
    if (!review.getProduct().getId().equals(productId)) {
      throw new AppException("Đánh giá không thuộc sản phẩm này", ErrorCode.NOT_FOUND);
    }

    reviewRepository.delete(review);
    log.info("Deleted review {} by user {}", reviewId, userId);
  }

  // Customer: Check if user has reviewed product
  public boolean hasUserReviewedProduct(Long productId) {
    Long userId = SecurityUtils.getCurrentUserId();
    return reviewRepository.findByProductIdAndUserId(productId, userId).isPresent();
  }

  // Customer: Check if user can review product (has purchased and not reviewed yet)
  public boolean canUserReviewProduct(Long productId) {
    Long userId = SecurityUtils.getCurrentUserId();
    // Check if already reviewed
    if (reviewRepository.findByProductIdAndUserId(productId, userId).isPresent()) {
      return false;
    }
    // Check if has purchased
    return reviewRepository.hasUserPurchasedProduct(productId, userId);
  }

  // Admin: Get all reviews with filters
  public Page<ReviewResponse> getAllReviews(
      Long productId,
      Boolean isApproved,
      Integer rating,
      String search,
      int page,
      int size,
      String sortBy,
      String sortDir) {
    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<ProductReview> reviews =
        reviewRepository.findAllWithFilters(productId, isApproved, rating, search, pageable);

    return reviews.map(this::toResponse);
  }

  // Admin: Get review by ID
  @SuppressWarnings("null")
  public ReviewResponse getReviewById(Long reviewId) {
    ProductReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", ErrorCode.NOT_FOUND));
    return toResponse(review);
  }

  // Admin: Approve review
  @Transactional
  @SuppressWarnings("null")
  public ReviewResponse approveReview(Long reviewId) {
    ProductReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", ErrorCode.NOT_FOUND));

    review.setIsApproved(true);
    review = reviewRepository.save(review);
    log.info("Approved review {}", reviewId);

    return toResponse(review);
  }

  // Admin: Reject review
  @Transactional
  @SuppressWarnings("null")
  public ReviewResponse rejectReview(Long reviewId, String reason) {
    ProductReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", ErrorCode.NOT_FOUND));

    review.setIsApproved(false);
    review = reviewRepository.save(review);
    log.info("Rejected review {} with reason: {}", reviewId, reason);

    return toResponse(review);
  }

  // Admin: Delete any review
  @Transactional
  @SuppressWarnings("null")
  public void adminDeleteReview(Long reviewId) {
    ProductReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", ErrorCode.NOT_FOUND));
    reviewRepository.delete(review);
    log.info("Admin deleted review {}", reviewId);
  }

  private ReviewResponse toResponse(ProductReview review) {
    return ReviewResponse.builder()
        .id(review.getId())
        .user(
            ReviewResponse.UserInfo.builder()
                .id(review.getUser().getId())
                .fullName(review.getUser().getFullName())
                .build())
        .product(
            ReviewResponse.ProductInfo.builder()
                .id(review.getProduct().getId())
                .name(review.getProduct().getName())
                .slug(review.getProduct().getSlug())
                .build())
        .rating(review.getRating())
        .comment(review.getComment())
        .isVerifiedPurchase(review.getIsVerifiedPurchase())
        .isApproved(review.getIsApproved())
        .createdAt(review.getCreatedAt())
        .updatedAt(review.getUpdatedAt())
        .build();
  }
}
