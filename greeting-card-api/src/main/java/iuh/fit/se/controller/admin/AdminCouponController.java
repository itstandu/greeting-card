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

import iuh.fit.se.dto.request.CreateCouponRequest;
import iuh.fit.se.dto.request.UpdateCouponRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.CouponResponse;
import iuh.fit.se.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {
  private final CouponService couponService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<CouponResponse>>> getAllCoupons(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDir) {
    Page<CouponResponse> coupons = couponService.getAllCoupons(page, size, sortBy, sortDir);
    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mã giảm giá thành công", coupons));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Long id) {
    CouponResponse coupon = couponService.getCouponById(id);
    return ResponseEntity.ok(ApiResponse.success("Lấy thông tin mã giảm giá thành công", coupon));
  }

  @GetMapping("/code/{code}")
  public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
    CouponResponse coupon = couponService.getCouponByCode(code);
    return ResponseEntity.ok(ApiResponse.success("Lấy thông tin mã giảm giá thành công", coupon));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
      @Valid @RequestBody CreateCouponRequest request) {
    CouponResponse coupon = couponService.createCoupon(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Tạo mã giảm giá thành công", coupon));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
      @PathVariable Long id, @Valid @RequestBody UpdateCouponRequest request) {
    CouponResponse coupon = couponService.updateCoupon(id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", coupon));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
    couponService.deleteCoupon(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", null));
  }
}
