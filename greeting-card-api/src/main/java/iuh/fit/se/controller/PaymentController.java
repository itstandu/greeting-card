package iuh.fit.se.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.ProcessPaymentRequest;
import iuh.fit.se.dto.request.RefundPaymentRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PaymentResponse;
import iuh.fit.se.service.PaymentService;
import iuh.fit.se.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
  private final PaymentService paymentService;
  private final UserService userService;

  /** Xử lý thanh toán */
  @PostMapping("/process")
  public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody ProcessPaymentRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    PaymentResponse payment = paymentService.processPayment(userId, request);
    return ResponseEntity.ok(ApiResponse.success("Xử lý thanh toán thành công", payment));
  }

  /** Hoàn tiền */
  @PostMapping("/refund")
  public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody RefundPaymentRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    PaymentResponse payment = paymentService.refundPayment(userId, request);
    return ResponseEntity.ok(ApiResponse.success("Hoàn tiền thành công", payment));
  }

  /** Lấy danh sách payments của user */
  @GetMapping
  public ResponseEntity<ApiResponse<List<PaymentResponse>>> getUserPayments(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    List<PaymentResponse> payments = paymentService.getUserPayments(userId);
    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thanh toán thành công", payments));
  }

  /** Lấy payment theo ID */
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    PaymentResponse payment = paymentService.getPaymentById(userId, id);
    return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thanh toán thành công", payment));
  }

  /** Lấy payments của một order */
  @GetMapping("/order/{orderId}")
  public ResponseEntity<ApiResponse<List<PaymentResponse>>> getOrderPayments(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long orderId) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    List<PaymentResponse> payments = paymentService.getOrderPayments(userId, orderId);
    return ResponseEntity.ok(
        ApiResponse.success("Lấy danh sách thanh toán của đơn hàng thành công", payments));
  }
}
