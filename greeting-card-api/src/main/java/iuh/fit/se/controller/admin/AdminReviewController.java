package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.RejectReviewRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.ReviewResponse;
import iuh.fit.se.service.ReviewService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {
  private final ReviewService reviewService;

  // Get all reviews with filters
  @GetMapping
  public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews(
      @RequestParam(required = false) Long productId,
      @RequestParam(required = false) Boolean isApproved,
      @RequestParam(required = false) Integer rating,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {
    Page<ReviewResponse> reviews =
        reviewService.getAllReviews(
            productId, isApproved, rating, search, page, size, sortBy, sortDir);
    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            reviews.getContent(), PaginationUtil.createPaginationResponse(reviews)));
  }

  // Get review by ID
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
    ReviewResponse review = reviewService.getReviewById(id);
    return ResponseEntity.ok(ApiResponse.success(review));
  }

  // Approve a review
  @PutMapping("/{id}/approve")
  public ResponseEntity<ApiResponse<ReviewResponse>> approveReview(@PathVariable Long id) {
    ReviewResponse review = reviewService.approveReview(id);
    return ResponseEntity.ok(ApiResponse.success("Đã duyệt đánh giá", review));
  }

  // Reject a review
  @PutMapping("/{id}/reject")
  public ResponseEntity<ApiResponse<ReviewResponse>> rejectReview(
      @PathVariable Long id, @Valid @RequestBody RejectReviewRequest request) {
    ReviewResponse review = reviewService.rejectReview(id, request.getReason());
    return ResponseEntity.ok(ApiResponse.success("Đã từ chối đánh giá", review));
  }

  // Delete a review
  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
    reviewService.adminDeleteReview(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công", null));
  }
}
