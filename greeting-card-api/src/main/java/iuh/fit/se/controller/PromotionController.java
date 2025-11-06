package iuh.fit.se.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PromotionResponse;
import iuh.fit.se.service.PromotionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
  private final PromotionService promotionService;

  @GetMapping("/active")
  public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
    List<PromotionResponse> promotions = promotionService.getActivePromotions();
    return ResponseEntity.ok(
        ApiResponse.success("Lấy danh sách promotion đang hoạt động thành công", promotions));
  }
}
