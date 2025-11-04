package iuh.fit.se.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.AddToCartRequest;
import iuh.fit.se.dto.request.SyncCartRequest;
import iuh.fit.se.dto.request.UpdateCartItemRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.CartResponse;
import iuh.fit.se.service.CartService;
import iuh.fit.se.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Controller xử lý các API liên quan đến giỏ hàng (Chỉ dành cho authenticated users)
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
  private final CartService cartService;
  private final UserService userService;

  // GET /api/cart - Lấy giỏ hàng hiện tại
  @GetMapping
  public ResponseEntity<ApiResponse<CartResponse>> getCart(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    CartResponse cart = cartService.getCart(userId);
    return ResponseEntity.ok(ApiResponse.success(cart));
  }

  // POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
  @PostMapping("/add")
  public ResponseEntity<ApiResponse<CartResponse>> addToCart(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody AddToCartRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    CartResponse cart = cartService.addToCart(userId, request);
    return ResponseEntity.ok(ApiResponse.success("Đã thêm sản phẩm vào giỏ hàng", cart));
  }

  // PUT /api/cart/items/{productId} - Cập nhật số lượng sản phẩm (quantity = 0 sẽ xóa)
  @PutMapping("/items/{productId}")
  public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable Long productId,
      @Valid @RequestBody UpdateCartItemRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    CartResponse cart = cartService.updateCartItem(userId, productId, request);
    return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giỏ hàng", cart));
  }

  // DELETE /api/cart/items/{productId} - Xóa sản phẩm khỏi giỏ hàng
  @DeleteMapping("/items/{productId}")
  public ResponseEntity<ApiResponse<String>> removeCartItem(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long productId) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    cartService.removeCartItem(userId, productId);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ hàng", null));
  }

  // DELETE /api/cart - Xóa toàn bộ giỏ hàng
  @DeleteMapping
  public ResponseEntity<ApiResponse<String>> clearCart(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    cartService.clearCart(userId);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa toàn bộ giỏ hàng", null));
  }

  // POST /api/cart/sync - Sync giỏ hàng từ localStorage lên server (khi user login có cart trong
  // localStorage)
  @PostMapping("/sync")
  public ResponseEntity<ApiResponse<CartResponse>> syncCart(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody SyncCartRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    CartResponse cart = cartService.syncCart(userId, request);
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.success("Đã đồng bộ giỏ hàng", cart));
  }
}
