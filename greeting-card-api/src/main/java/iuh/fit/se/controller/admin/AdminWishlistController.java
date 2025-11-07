package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PaginationResponse;
import iuh.fit.se.dto.response.WishlistResponse;
import iuh.fit.se.dto.response.WishlistSummaryResponse;
import iuh.fit.se.service.WishlistService;
import lombok.RequiredArgsConstructor;

// Admin Controller để xem wishlist của users (Chỉ ADMIN mới có quyền truy cập)
@RestController
@RequestMapping("/api/admin/wishlists")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminWishlistController {
  private final WishlistService wishlistService;

  // GET /api/admin/wishlists - Lấy tất cả wishlist
  @GetMapping
  public ResponseEntity<ApiResponse<List<WishlistSummaryResponse>>> getAllWishlists(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "updatedAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<WishlistSummaryResponse> wishlistPage = wishlistService.getAllWishlists(pageable);

    PaginationResponse pagination =
        PaginationResponse.builder()
            .page(page)
            .size(size)
            .total(wishlistPage.getTotalElements())
            .totalPages(wishlistPage.getTotalPages())
            .build();

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Lấy danh sách wishlist thành công", wishlistPage.getContent(), pagination));
  }

  // GET /api/admin/wishlists/search - Tìm kiếm wishlist
  @GetMapping("/search")
  public ResponseEntity<ApiResponse<List<WishlistSummaryResponse>>> searchWishlists(
      @RequestParam String keyword,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "updatedAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<WishlistSummaryResponse> wishlistPage = wishlistService.searchWishlists(keyword, pageable);

    PaginationResponse pagination =
        PaginationResponse.builder()
            .page(page)
            .size(size)
            .total(wishlistPage.getTotalElements())
            .totalPages(wishlistPage.getTotalPages())
            .build();

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Tìm kiếm wishlist thành công", wishlistPage.getContent(), pagination));
  }

  // GET /api/admin/wishlists/{id} - Xem chi tiết wishlist
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<WishlistResponse>> getWishlistById(@PathVariable Long id) {
    WishlistResponse wishlist = wishlistService.getWishlistById(id);
    return ResponseEntity.ok(ApiResponse.success(wishlist));
  }

  // GET /api/admin/wishlists/user/{userId} - Xem wishlist của một user cụ thể
  @GetMapping("/user/{userId}")
  public ResponseEntity<ApiResponse<WishlistResponse>> getUserWishlist(@PathVariable Long userId) {
    WishlistResponse wishlist = wishlistService.getWishlist(userId);
    return ResponseEntity.ok(ApiResponse.success(wishlist));
  }

  // DELETE /api/admin/wishlists/user/{userId} - Xóa wishlist của user (hỗ trợ khách hàng)
  @DeleteMapping("/user/{userId}")
  public ResponseEntity<ApiResponse<String>> clearUserWishlist(@PathVariable Long userId) {
    wishlistService.clearWishlist(userId);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa wishlist của user", null));
  }
}
