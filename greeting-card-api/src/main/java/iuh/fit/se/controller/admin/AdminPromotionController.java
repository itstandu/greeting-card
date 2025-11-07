package iuh.fit.se.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreatePromotionRequest;
import iuh.fit.se.dto.request.UpdatePromotionRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PromotionResponse;
import iuh.fit.se.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromotionController {
  private final PromotionService promotionService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<PromotionResponse>>> getAllPromotions(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDir) {
    Page<PromotionResponse> promotions =
        promotionService.getAllPromotions(page, size, sortBy, sortDir);
    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách promotion thành công", promotions));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(@PathVariable Long id) {
    PromotionResponse promotion = promotionService.getPromotionById(id);
    return ResponseEntity.ok(ApiResponse.success("Lấy thông tin promotion thành công", promotion));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(
      @Valid @RequestBody CreatePromotionRequest request) {
    PromotionResponse promotion = promotionService.createPromotion(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Tạo promotion thành công", promotion));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
      @PathVariable Long id, @Valid @RequestBody UpdatePromotionRequest request) {
    PromotionResponse promotion = promotionService.updatePromotion(id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật promotion thành công", promotion));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Long id) {
    promotionService.deletePromotion(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa promotion thành công", null));
  }
}
