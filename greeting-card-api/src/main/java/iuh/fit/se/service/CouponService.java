package iuh.fit.se.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateCouponRequest;
import iuh.fit.se.dto.request.UpdateCouponRequest;
import iuh.fit.se.dto.request.ValidateCouponRequest;
import iuh.fit.se.dto.response.CouponResponse;
import iuh.fit.se.dto.response.ValidateCouponResponse;
import iuh.fit.se.entity.Coupon;
import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.CouponMapper;
import iuh.fit.se.repository.CouponRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponService {
  private final CouponRepository couponRepository;
  private final CouponMapper couponMapper;

  @Transactional(readOnly = true)
  public Page<CouponResponse> getAllCoupons(int page, int size, String sortBy, String sortDir) {
    Sort sort =
        sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();

    Pageable pageable = PageRequest.of(page, size, sort);
    return couponRepository.findAll(pageable).map(couponMapper::toResponse);
  }

  @Transactional(readOnly = true)
  @SuppressWarnings("null")
  public CouponResponse getCouponById(Long id) {
    Coupon coupon =
        couponRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
    return couponMapper.toResponse(coupon);
  }

  @Transactional(readOnly = true)
  public CouponResponse getCouponByCode(String code) {
    Coupon coupon =
        couponRepository
            .findByCode(code)
            .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
    return couponMapper.toResponse(coupon);
  }

  @Transactional
  public CouponResponse createCoupon(CreateCouponRequest request) {
    // Validate coupon code unique
    if (couponRepository.findByCode(request.getCode()).isPresent()) {
      throw new AppException("Mã giảm giá đã tồn tại", ErrorCode.VALIDATION_ERROR);
    }

    // Validate date range
    if (request.getValidUntil().isBefore(request.getValidFrom())) {
      throw new AppException("Ngày kết thúc phải sau ngày bắt đầu", ErrorCode.VALIDATION_ERROR);
    }

    // Validate discount value based on type
    if (request.getDiscountType() == DiscountType.PERCENTAGE) {
      if (request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
        throw new AppException(
            "Phần trăm giảm giá không được vượt quá 100%", ErrorCode.VALIDATION_ERROR);
      }
    }

    Coupon coupon = new Coupon();
    coupon.setCode(request.getCode().toUpperCase().trim());
    coupon.setDiscountType(request.getDiscountType());
    coupon.setDiscountValue(request.getDiscountValue());
    coupon.setMinPurchase(
        request.getMinPurchase() != null ? request.getMinPurchase() : BigDecimal.ZERO);
    coupon.setMaxDiscount(request.getMaxDiscount());
    coupon.setValidFrom(request.getValidFrom());
    coupon.setValidUntil(request.getValidUntil());
    coupon.setUsageLimit(request.getUsageLimit());
    coupon.setUsedCount(0);
    coupon.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

    Coupon savedCoupon = couponRepository.save(coupon);
    return couponMapper.toResponse(savedCoupon);
  }

  @Transactional
  @SuppressWarnings("null")
  public CouponResponse updateCoupon(Long id, UpdateCouponRequest request) {
    Coupon coupon =
        couponRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

    // Update fields if provided
    if (request.getDiscountType() != null) {
      coupon.setDiscountType(request.getDiscountType());
    }
    if (request.getDiscountValue() != null) {
      if (coupon.getDiscountType() == DiscountType.PERCENTAGE
          && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
        throw new AppException(
            "Phần trăm giảm giá không được vượt quá 100%", ErrorCode.VALIDATION_ERROR);
      }
      coupon.setDiscountValue(request.getDiscountValue());
    }
    if (request.getMinPurchase() != null) {
      coupon.setMinPurchase(request.getMinPurchase());
    }
    if (request.getMaxDiscount() != null) {
      coupon.setMaxDiscount(request.getMaxDiscount());
    }
    if (request.getValidFrom() != null) {
      coupon.setValidFrom(request.getValidFrom());
    }
    if (request.getValidUntil() != null) {
      coupon.setValidUntil(request.getValidUntil());
    }
    if (request.getUsageLimit() != null) {
      coupon.setUsageLimit(request.getUsageLimit());
    }
    if (request.getIsActive() != null) {
      coupon.setIsActive(request.getIsActive());
    }

    // Validate date range after update
    if (coupon.getValidUntil().isBefore(coupon.getValidFrom())) {
      throw new AppException("Ngày kết thúc phải sau ngày bắt đầu", ErrorCode.VALIDATION_ERROR);
    }

    Coupon updatedCoupon = couponRepository.save(coupon);
    return couponMapper.toResponse(updatedCoupon);
  }

  @Transactional
  @SuppressWarnings("null")
  public void deleteCoupon(Long id) {
    Coupon coupon =
        couponRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
    couponRepository.delete(coupon);
  }

  @Transactional(readOnly = true)
  public ValidateCouponResponse validateCoupon(ValidateCouponRequest request) {
    // Find coupon by code
    Coupon coupon =
        couponRepository
            .findByCode(request.getCode().toUpperCase().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

    // Check if coupon is valid
    if (!coupon.isValid()) {
      String message;
      if (!coupon.getIsActive()) {
        message = "Mã giảm giá đã bị vô hiệu hóa";
      } else if (LocalDateTime.now().isBefore(coupon.getValidFrom())) {
        message = "Mã giảm giá chưa có hiệu lực";
      } else if (LocalDateTime.now().isAfter(coupon.getValidUntil())) {
        message = "Mã giảm giá đã hết hạn";
      } else if (coupon.getUsageLimit() != null
          && coupon.getUsedCount() >= coupon.getUsageLimit()) {
        message = "Mã giảm giá đã hết lượt sử dụng";
      } else {
        message = "Mã giảm giá không hợp lệ";
      }

      return ValidateCouponResponse.builder()
          .valid(false)
          .message(message)
          .discountAmount(BigDecimal.ZERO)
          .finalAmount(request.getOrderTotal())
          .coupon(couponMapper.toResponse(coupon))
          .build();
    }

    // Check minimum purchase
    if (coupon.getMinPurchase() != null
        && request.getOrderTotal().compareTo(coupon.getMinPurchase()) < 0) {
      return ValidateCouponResponse.builder()
          .valid(false)
          .message(
              "Đơn hàng phải từ " + coupon.getMinPurchase() + "đ trở lên để áp dụng mã giảm giá")
          .discountAmount(BigDecimal.ZERO)
          .finalAmount(request.getOrderTotal())
          .coupon(couponMapper.toResponse(coupon))
          .build();
    }

    // Calculate discount amount
    BigDecimal discountAmount;
    if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
      discountAmount =
          request
              .getOrderTotal()
              .multiply(coupon.getDiscountValue())
              .divide(BigDecimal.valueOf(100));

      // Apply max discount if set
      if (coupon.getMaxDiscount() != null
          && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
        discountAmount = coupon.getMaxDiscount();
      }
    } else {
      discountAmount = coupon.getDiscountValue();
    }

    // Ensure discount doesn't exceed order total
    if (discountAmount.compareTo(request.getOrderTotal()) > 0) {
      discountAmount = request.getOrderTotal();
    }

    BigDecimal finalAmount = request.getOrderTotal().subtract(discountAmount);

    return ValidateCouponResponse.builder()
        .valid(true)
        .message("Mã giảm giá hợp lệ")
        .discountAmount(discountAmount)
        .finalAmount(finalAmount)
        .coupon(couponMapper.toResponse(coupon))
        .build();
  }
}
