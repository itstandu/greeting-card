package iuh.fit.se.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.AddToWishlistRequest;
import iuh.fit.se.dto.request.SyncWishlistRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.WishlistResponse;
import iuh.fit.se.service.UserService;
import iuh.fit.se.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Controller xử lý các API liên quan đến danh sách yêu thích (Chỉ dành cho authenticated users)
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
  private final WishlistService wishlistService;
  private final UserService userService;

  // GET /api/wishlist - Lấy danh sách yêu thích hiện tại
  @GetMapping
  public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    WishlistResponse wishlist = wishlistService.getWishlist(userId);
    return ResponseEntity.ok(ApiResponse.success(wishlist));
  }

  // POST /api/wishlist/add - Thêm sản phẩm vào danh sách yêu thích
  @PostMapping("/add")
  public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody AddToWishlistRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    WishlistResponse wishlist = wishlistService.addToWishlist(userId, request);
    return ResponseEntity.ok(
        ApiResponse.success("Đã thêm sản phẩm vào danh sách yêu thích", wishlist));
  }

  // DELETE /api/wishlist/items/{productId} - Xóa sản phẩm khỏi danh sách yêu thích
  @DeleteMapping("/items/{productId}")
  public ResponseEntity<ApiResponse<String>> removeWishlistItem(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long productId) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    wishlistService.removeWishlistItem(userId, productId);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi danh sách yêu thích", null));
  }

  // DELETE /api/wishlist - Xóa toàn bộ danh sách yêu thích
  @DeleteMapping
  public ResponseEntity<ApiResponse<String>> clearWishlist(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    wishlistService.clearWishlist(userId);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa toàn bộ danh sách yêu thích", null));
  }

  // POST /api/wishlist/sync - Sync danh sách yêu thích từ localStorage lên server
  @PostMapping("/sync")
  public ResponseEntity<ApiResponse<WishlistResponse>> syncWishlist(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody SyncWishlistRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    WishlistResponse wishlist = wishlistService.syncWishlist(userId, request);
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.success("Đã đồng bộ danh sách yêu thích", wishlist));
  }

  // GET /api/wishlist/check/{productId} - Kiểm tra sản phẩm có trong wishlist không
  @GetMapping("/check/{productId}")
  public ResponseEntity<ApiResponse<Boolean>> checkInWishlist(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long productId) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
    return ResponseEntity.ok(ApiResponse.success(isInWishlist));
  }
}
