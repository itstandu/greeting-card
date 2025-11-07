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
import iuh.fit.se.dto.response.CartResponse;
import iuh.fit.se.dto.response.CartSummaryResponse;
import iuh.fit.se.dto.response.PaginationResponse;
import iuh.fit.se.service.CartService;
import lombok.RequiredArgsConstructor;

// Admin Controller để xem giỏ hàng của users (Chỉ ADMIN mới có quyền truy cập)
@RestController
@RequestMapping("/api/admin/carts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCartController {
  private final CartService cartService;

  // GET /api/admin/carts - Lấy tất cả giỏ hàng
  @GetMapping
  public ResponseEntity<ApiResponse<List<CartSummaryResponse>>> getAllCarts(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "updatedAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<CartSummaryResponse> cartPage = cartService.getAllCarts(pageable);

    PaginationResponse pagination =
        PaginationResponse.builder()
            .page(page)
            .size(size)
            .total(cartPage.getTotalElements())
            .totalPages(cartPage.getTotalPages())
            .build();

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Lấy danh sách giỏ hàng thành công", cartPage.getContent(), pagination));
  }

  // GET /api/admin/carts/search - Tìm kiếm giỏ hàng
  @GetMapping("/search")
  public ResponseEntity<ApiResponse<List<CartSummaryResponse>>> searchCarts(
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

    Page<CartSummaryResponse> cartPage = cartService.searchCarts(keyword, pageable);

    PaginationResponse pagination =
        PaginationResponse.builder()
            .page(page)
            .size(size)
            .total(cartPage.getTotalElements())
            .totalPages(cartPage.getTotalPages())
            .build();

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Tìm kiếm giỏ hàng thành công", cartPage.getContent(), pagination));
  }

  // GET /api/admin/carts/{id} - Xem chi tiết giỏ hàng
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<CartResponse>> getCartById(@PathVariable Long id) {
    CartResponse cart = cartService.getCartById(id);
    return ResponseEntity.ok(ApiResponse.success(cart));
  }

  // GET /api/admin/carts/user/{userId} - Xem giỏ hàng của một user cụ thể
  @GetMapping("/user/{userId}")
  public ResponseEntity<ApiResponse<CartResponse>> getUserCart(@PathVariable Long userId) {
    CartResponse cart = cartService.getCart(userId);
    return ResponseEntity.ok(ApiResponse.success(cart));
  }

  // DELETE /api/admin/carts/user/{userId} - Xóa giỏ hàng của user (hỗ trợ khách hàng)
  @DeleteMapping("/user/{userId}")
  public ResponseEntity<ApiResponse<String>> clearUserCart(@PathVariable Long userId) {
    cartService.clearCart(userId);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa giỏ hàng của user", null));
  }
}
