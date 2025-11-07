package iuh.fit.se.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.service.ReviewService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
  private final ReviewService reviewService;

  // Check if current user has reviewed a product
  @GetMapping("/check/{productId}")
  public ResponseEntity<ApiResponse<Boolean>> hasUserReviewedProduct(@PathVariable Long productId) {
    boolean hasReviewed = reviewService.hasUserReviewedProduct(productId);
    return ResponseEntity.ok(ApiResponse.success(hasReviewed));
  }

  // Check if current user can review a product (has purchased and not reviewed yet)
  @GetMapping("/can-review/{productId}")
  public ResponseEntity<ApiResponse<Boolean>> canUserReviewProduct(@PathVariable Long productId) {
    boolean canReview = reviewService.canUserReviewProduct(productId);
    return ResponseEntity.ok(ApiResponse.success(canReview));
  }
}
