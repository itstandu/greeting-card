package iuh.fit.se.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreateReviewRequest;
import iuh.fit.se.dto.request.UpdateReviewRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.ReviewResponse;
import iuh.fit.se.dto.response.ReviewStatsResponse;
import iuh.fit.se.service.ReviewService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ProductReviewController {
  private final ReviewService reviewService;

  // Get reviews for a product (public - only approved reviews)
  @GetMapping
  public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
      @PathVariable Long productId,
      @RequestParam(required = false) Integer rating,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size) {
    Page<ReviewResponse> reviews = reviewService.getProductReviews(productId, rating, page, size);
    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            reviews.getContent(), PaginationUtil.createPaginationResponse(reviews)));
  }

  // Get review stats for a product (public)
  @GetMapping("/stats")
  public ResponseEntity<ApiResponse<ReviewStatsResponse>> getProductReviewStats(
      @PathVariable Long productId) {
    ReviewStatsResponse stats = reviewService.getProductReviewStats(productId);
    return ResponseEntity.ok(ApiResponse.success(stats));
  }

  // Create a review (authenticated customer)
  @PostMapping
  public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
      @PathVariable Long productId, @Valid @RequestBody CreateReviewRequest request) {
    ReviewResponse review = reviewService.createReview(productId, request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Đánh giá đã được gửi. Vui lòng chờ admin duyệt.", review));
  }

  // Update own review (authenticated customer)
  @PutMapping("/{reviewId}")
  public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
      @PathVariable Long productId,
      @PathVariable Long reviewId,
      @Valid @RequestBody UpdateReviewRequest request) {
    ReviewResponse review = reviewService.updateReview(productId, reviewId, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật đánh giá thành công", review));
  }

  // Delete own review (authenticated customer)
  @DeleteMapping("/{reviewId}")
  public ResponseEntity<ApiResponse<Void>> deleteReview(
      @PathVariable Long productId, @PathVariable Long reviewId) {
    reviewService.deleteReview(productId, reviewId);
    return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công", null));
  }
}
