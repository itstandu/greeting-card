package iuh.fit.se.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PaymentMethodResponse;
import iuh.fit.se.service.PaymentMethodService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {
  private final PaymentMethodService paymentMethodService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getActivePaymentMethods() {
    List<PaymentMethodResponse> methods = paymentMethodService.getActivePaymentMethods();
    return ResponseEntity.ok(ApiResponse.success(methods));
  }
}
