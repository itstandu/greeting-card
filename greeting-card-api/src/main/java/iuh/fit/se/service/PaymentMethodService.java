package iuh.fit.se.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreatePaymentMethodRequest;
import iuh.fit.se.dto.request.UpdatePaymentMethodOrderRequest;
import iuh.fit.se.dto.request.UpdatePaymentMethodRequest;
import iuh.fit.se.dto.response.PaymentMethodResponse;
import iuh.fit.se.entity.PaymentMethod;
import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PaymentMethodService {
  private final PaymentMethodRepository paymentMethodRepository;

  // Public: Get active payment methods
  public List<PaymentMethodResponse> getActivePaymentMethods() {
    List<PaymentMethod> methods =
        paymentMethodRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    return methods.stream().map(this::toResponse).collect(Collectors.toList());
  }

  // Admin: Get all payment methods with pagination and filters
  public Page<PaymentMethodResponse> getAllPaymentMethods(
      String search, Boolean isActive, int page, int size, String sortBy, String sortDir) {
    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<PaymentMethod> methods =
        paymentMethodRepository.findAllWithFilters(search, isActive, pageable);
    return methods.map(this::toResponse);
  }

  // Admin: Get payment method by ID
  public PaymentMethodResponse getPaymentMethodById(Long id) {
    PaymentMethod method =
        paymentMethodRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException("Không tìm thấy phương thức thanh toán", ErrorCode.NOT_FOUND));
    return toResponse(method);
  }

  // Admin: Create payment method
  @Transactional
  public PaymentMethodResponse createPaymentMethod(CreatePaymentMethodRequest request) {
    // Check if code already exists
    if (paymentMethodRepository.existsByCode(request.getCode())) {
      throw new AppException(
          "Mã phương thức thanh toán đã tồn tại", ErrorCode.PAYMENT_METHOD_CODE_EXISTS);
    }

    // Get max display order and add 1
    Integer maxOrder = paymentMethodRepository.findMaxDisplayOrder();
    int newOrder = (maxOrder != null ? maxOrder : 0) + 1;

    PaymentMethod method = new PaymentMethod();
    method.setName(request.getName());
    method.setCode(request.getCode().toUpperCase());
    method.setDescription(request.getDescription());
    method.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    method.setDisplayOrder(
        request.getDisplayOrder() != null ? request.getDisplayOrder() : newOrder);

    method = paymentMethodRepository.save(method);
    log.info("Created payment method: {}", method.getCode());

    return toResponse(method);
  }

  // Admin: Update payment method
  @Transactional
  public PaymentMethodResponse updatePaymentMethod(Long id, UpdatePaymentMethodRequest request) {
    PaymentMethod method =
        paymentMethodRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException("Không tìm thấy phương thức thanh toán", ErrorCode.NOT_FOUND));

    // Check if code already exists (if updating code)
    if (request.getCode() != null
        && paymentMethodRepository.existsByCodeAndIdNot(request.getCode(), id)) {
      throw new AppException(
          "Mã phương thức thanh toán đã tồn tại", ErrorCode.PAYMENT_METHOD_CODE_EXISTS);
    }

    if (request.getName() != null) {
      method.setName(request.getName());
    }
    if (request.getCode() != null) {
      method.setCode(request.getCode().toUpperCase());
    }
    if (request.getDescription() != null) {
      method.setDescription(request.getDescription());
    }
    if (request.getIsActive() != null) {
      method.setIsActive(request.getIsActive());
    }
    if (request.getDisplayOrder() != null) {
      method.setDisplayOrder(request.getDisplayOrder());
    }

    method = paymentMethodRepository.save(method);
    log.info("Updated payment method: {}", method.getCode());

    return toResponse(method);
  }

  // Admin: Toggle payment method active status
  @Transactional
  public PaymentMethodResponse togglePaymentMethodStatus(Long id) {
    PaymentMethod method =
        paymentMethodRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException("Không tìm thấy phương thức thanh toán", ErrorCode.NOT_FOUND));

    method.setIsActive(!method.getIsActive());
    method = paymentMethodRepository.save(method);
    log.info(
        "Toggled payment method {} to {}",
        method.getCode(),
        method.getIsActive() ? "active" : "inactive");

    return toResponse(method);
  }

  // Admin: Update payment method ordering
  @Transactional
  public List<PaymentMethodResponse> updatePaymentMethodOrdering(
      UpdatePaymentMethodOrderRequest request) {
    for (UpdatePaymentMethodOrderRequest.PaymentMethodOrderItem item : request.getItems()) {
      PaymentMethod method =
          paymentMethodRepository
              .findById(item.getId())
              .orElseThrow(
                  () ->
                      new AppException(
                          "Không tìm thấy phương thức thanh toán với ID: " + item.getId(),
                          ErrorCode.NOT_FOUND));
      method.setDisplayOrder(item.getDisplayOrder());
      paymentMethodRepository.save(method);
    }
    log.info("Updated payment method ordering");

    List<PaymentMethod> methods = paymentMethodRepository.findAllByOrderByDisplayOrderAsc();
    return methods.stream().map(this::toResponse).collect(Collectors.toList());
  }

  // Admin: Delete payment method
  @Transactional
  public void deletePaymentMethod(Long id) {
    PaymentMethod method =
        paymentMethodRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException("Không tìm thấy phương thức thanh toán", ErrorCode.NOT_FOUND));

    // Check if payment method is used in any orders
    if (!method.getOrders().isEmpty()) {
      throw new AppException(
          "Không thể xóa phương thức thanh toán đã được sử dụng trong đơn hàng",
          ErrorCode.VALIDATION_ERROR);
    }

    paymentMethodRepository.delete(method);
    log.info("Deleted payment method: {}", method.getCode());
  }

  private PaymentMethodResponse toResponse(PaymentMethod method) {
    return PaymentMethodResponse.builder()
        .id(method.getId())
        .name(method.getName())
        .code(method.getCode())
        .description(method.getDescription())
        .isActive(method.getIsActive())
        .displayOrder(method.getDisplayOrder())
        .createdAt(method.getCreatedAt())
        .updatedAt(method.getUpdatedAt())
        .build();
  }
}
