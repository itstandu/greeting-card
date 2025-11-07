package iuh.fit.se.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.service.DataSeederService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

  private final DataSeederService dataSeederService;

  @PostMapping("/all")
  public ResponseEntity<ApiResponse<String>> seedAll() {
    try {
      log.info("Bắt đầu seed data...");
      dataSeederService.seedAll();
      return ResponseEntity.ok(
          ApiResponse.success("Seed data thành công! Đã tạo dữ liệu mẫu cho hệ thống."));
    } catch (Exception e) {
      log.error("Lỗi khi seed data: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body(
              ApiResponse.failure(
                  ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi khi seed data: " + e.getMessage()));
    }
  }

  @PostMapping("/clear")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<String>> clearAll() {
    try {
      log.info("Bắt đầu xóa sạch dữ liệu...");
      dataSeederService.clearAllData();
      return ResponseEntity.ok(ApiResponse.success("Đã xóa sạch tất cả dữ liệu!"));
    } catch (Exception e) {
      log.error("Lỗi khi xóa dữ liệu: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body(
              ApiResponse.failure(
                  ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi khi xóa dữ liệu: " + e.getMessage()));
    }
  }
}
