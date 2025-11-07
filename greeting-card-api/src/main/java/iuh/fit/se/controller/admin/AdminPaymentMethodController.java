package iuh.fit.se.controller.admin;

import java.util.List;

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

import iuh.fit.se.dto.request.CreatePaymentMethodRequest;
import iuh.fit.se.dto.request.UpdatePaymentMethodOrderRequest;
import iuh.fit.se.dto.request.UpdatePaymentMethodRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PaymentMethodResponse;
import iuh.fit.se.service.PaymentMethodService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/payment-methods")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentMethodController {
  private final PaymentMethodService paymentMethodService;

  // Get all payment methods with pagination and filters
  @GetMapping
  public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getAllPaymentMethods(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Boolean isActive,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "displayOrder") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir) {
    Page<PaymentMethodResponse> methods =
        paymentMethodService.getAllPaymentMethods(search, isActive, page, size, sortBy, sortDir);
    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            methods.getContent(), PaginationUtil.createPaginationResponse(methods)));
  }

  // Get payment method by ID
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<PaymentMethodResponse>> getPaymentMethodById(
      @PathVariable Long id) {
    PaymentMethodResponse method = paymentMethodService.getPaymentMethodById(id);
    return ResponseEntity.ok(ApiResponse.success(method));
  }

  // Create payment method
  @PostMapping
  public ResponseEntity<ApiResponse<PaymentMethodResponse>> createPaymentMethod(
      @Valid @RequestBody CreatePaymentMethodRequest request) {
    PaymentMethodResponse method = paymentMethodService.createPaymentMethod(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Tạo phương thức thanh toán thành công", method));
  }

  // Update payment method
  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<PaymentMethodResponse>> updatePaymentMethod(
      @PathVariable Long id, @Valid @RequestBody UpdatePaymentMethodRequest request) {
    PaymentMethodResponse method = paymentMethodService.updatePaymentMethod(id, request);
    return ResponseEntity.ok(
        ApiResponse.success("Cập nhật phương thức thanh toán thành công", method));
  }

  // Toggle payment method active status
  @PutMapping("/{id}/toggle-status")
  public ResponseEntity<ApiResponse<PaymentMethodResponse>> togglePaymentMethodStatus(
      @PathVariable Long id) {
    PaymentMethodResponse method = paymentMethodService.togglePaymentMethodStatus(id);
    String status = method.getIsActive() ? "kích hoạt" : "vô hiệu hóa";
    return ResponseEntity.ok(
        ApiResponse.success("Đã " + status + " phương thức thanh toán", method));
  }

  // Update payment method ordering
  @PutMapping("/reorder")
  public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> updatePaymentMethodOrdering(
      @Valid @RequestBody UpdatePaymentMethodOrderRequest request) {
    List<PaymentMethodResponse> methods = paymentMethodService.updatePaymentMethodOrdering(request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật thứ tự thành công", methods));
  }

  // Delete payment method
  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deletePaymentMethod(@PathVariable Long id) {
    paymentMethodService.deletePaymentMethod(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa phương thức thanh toán thành công", null));
  }
}
