package iuh.fit.se.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.ValidateCouponRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.ValidateCouponResponse;
import iuh.fit.se.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {
  private final CouponService couponService;

  @PostMapping("/validate")
  public ResponseEntity<ApiResponse<ValidateCouponResponse>> validateCoupon(
      @Valid @RequestBody ValidateCouponRequest request) {
    ValidateCouponResponse response = couponService.validateCoupon(request);
    return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
  }
}
