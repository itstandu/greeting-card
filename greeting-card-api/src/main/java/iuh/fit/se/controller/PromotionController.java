package iuh.fit.se.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.CartPromotionPreviewResponse;
import iuh.fit.se.dto.response.PromotionResponse;
import iuh.fit.se.service.PromotionService;
import iuh.fit.se.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
  private final PromotionService promotionService;
  private final UserService userService;

  @GetMapping("/active")
  public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
    List<PromotionResponse> promotions = promotionService.getActivePromotions();
    return ResponseEntity.ok(
        ApiResponse.success("Lấy danh sách khuyến mãi đang hoạt động thành công", promotions));
  }

  @GetMapping("/cart-preview")
  public ResponseEntity<ApiResponse<CartPromotionPreviewResponse>> previewCartPromotions(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    CartPromotionPreviewResponse preview = promotionService.previewCartPromotions(userId);
    return ResponseEntity.ok(
        ApiResponse.success("Xem trước khuyến mãi giỏ hàng thành công", preview));
  }
}
