package iuh.fit.se.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import iuh.fit.se.dto.request.ProcessPaymentRequest;
import iuh.fit.se.dto.request.RefundPaymentRequest;
import iuh.fit.se.dto.response.PaymentResponse;
import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.Payment;
import iuh.fit.se.entity.PaymentMethod;
import iuh.fit.se.entity.enumeration.PaymentStatus;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.PaymentMapper;
import iuh.fit.se.repository.OrderRepository;
import iuh.fit.se.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentService {
  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;
  private final PaymentMapper paymentMapper;
  private final NotificationService notificationService;
  private final ObjectMapper objectMapper;
  private final Random random = new Random();

  /** Xử lý thanh toán giả lập */
  @SuppressWarnings("null")
  public PaymentResponse processPayment(Long userId, ProcessPaymentRequest request) {
    // 1. Validate order
    Order order =
        orderRepository
            .findById(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    // 2. Validate ownership
    if (!order.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Bạn không có quyền thanh toán đơn hàng này");
    }

    // 3. Validate payment status
    if (order.getPaymentStatus() == PaymentStatus.PAID) {
      throw new IllegalArgumentException("Đơn hàng đã được thanh toán");
    }

    // 4. Get payment method
    PaymentMethod paymentMethod = order.getPaymentMethod();
    if (paymentMethod == null) {
      throw new IllegalArgumentException("Đơn hàng chưa có phương thức thanh toán");
    }

    // 5. Create payment record
    Payment payment = new Payment();
    payment.setOrder(order);
    payment.setPaymentMethod(paymentMethod);
    payment.setAmount(order.getFinalAmount());
    payment.setStatus(PaymentStatus.PENDING);
    payment.setTransactionId(generateTransactionId());

    payment = paymentRepository.save(payment);

    // 6. Simulate payment processing (giả lập)
    try {
      // Simulate network delay (2-3 seconds)
      Thread.sleep(2000 + random.nextInt(1000));

      // Simulate failure if explicitly requested
      if (request.getSimulateFailure() != null && request.getSimulateFailure()) {
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailedAt(LocalDateTime.now());
        String failureReason =
            request.getFailureReason() != null
                ? request.getFailureReason()
                : "Thanh toán thất bại (giả lập)";
        payment.setFailureReason(failureReason);
        payment.setGatewayResponse(createFailureResponse(paymentMethod.getCode()));

        // Send notification
        notificationService.notifyPaymentFailure(userId, order.getId(), order.getOrderNumber(), failureReason);
      } else {
        // Luôn thành công (trừ khi simulateFailure = true)
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setGatewayResponse(createSuccessResponse(paymentMethod.getCode()));

        // Update order payment status
        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);

        // Send notification
        notificationService.notifyPaymentSuccess(
            userId, order.getId(), order.getOrderNumber(), payment.getAmount().toString());
      }

      payment = paymentRepository.save(payment);
      log.info(
          "Payment {} processed for order {}: {}",
          payment.getTransactionId(),
          order.getOrderNumber(),
          payment.getStatus());

      return paymentMapper.toPaymentResponse(payment);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      payment.setStatus(PaymentStatus.FAILED);
      payment.setFailedAt(LocalDateTime.now());
      payment.setFailureReason("Lỗi xử lý thanh toán");
      payment = paymentRepository.save(payment);
      throw new RuntimeException("Lỗi xử lý thanh toán", e);
    }
  }

  /** Hoàn tiền */
  @SuppressWarnings("null")
  public PaymentResponse refundPayment(Long userId, RefundPaymentRequest request) {
    // 1. Validate payment
    Payment payment =
        paymentRepository
            .findById(request.getPaymentId())
            .orElseThrow(() -> new ResourceNotFoundException("Giao dịch thanh toán không tồn tại"));

    // 2. Validate ownership
    if (!payment.getOrder().getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Bạn không có quyền hoàn tiền giao dịch này");
    }

    // 3. Validate payment status
    if (payment.getStatus() != PaymentStatus.PAID) {
      throw new IllegalArgumentException(
          "Chỉ có thể hoàn tiền cho giao dịch đã thanh toán thành công");
    }

    if (payment.getRefundedAt() != null) {
      throw new IllegalArgumentException("Giao dịch đã được hoàn tiền");
    }

    // 4. Validate refund amount
    BigDecimal maxRefundAmount = payment.getAmount();
    if (payment.getRefundAmount() != null) {
      maxRefundAmount = maxRefundAmount.subtract(payment.getRefundAmount());
    }

    if (request.getRefundAmount().compareTo(maxRefundAmount) > 0) {
      throw new IllegalArgumentException("Số tiền hoàn không được vượt quá số tiền đã thanh toán");
    }

    // 5. Process refund (giả lập)
    try {
      Thread.sleep(500 + random.nextInt(1000));

      payment.setStatus(PaymentStatus.REFUNDED);
      payment.setRefundedAt(LocalDateTime.now());
      payment.setRefundAmount(request.getRefundAmount());
      payment.setRefundReason(request.getReason());

      // Update order payment status if fully refunded
      if (request.getRefundAmount().compareTo(payment.getAmount()) == 0) {
        payment.getOrder().setPaymentStatus(PaymentStatus.REFUNDED);
        orderRepository.save(payment.getOrder());
      }

      payment = paymentRepository.save(payment);
      log.info(
          "Payment {} refunded: {} for order {}",
          payment.getTransactionId(),
          request.getRefundAmount(),
          payment.getOrder().getOrderNumber());

      return paymentMapper.toPaymentResponse(payment);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException("Lỗi xử lý hoàn tiền", e);
    }
  }

  /** Lấy danh sách payments của user */
  @Transactional(readOnly = true)
  public List<PaymentResponse> getUserPayments(Long userId) {
    List<Payment> payments = paymentRepository.findByUserId(userId);
    return payments.stream().map(paymentMapper::toPaymentResponse).collect(Collectors.toList());
  }

  /** Lấy payment theo ID */
  @Transactional(readOnly = true)
  @SuppressWarnings("null")
  public PaymentResponse getPaymentById(Long userId, Long paymentId) {
    Payment payment =
        paymentRepository
            .findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Giao dịch thanh toán không tồn tại"));

    if (!payment.getOrder().getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Bạn không có quyền xem giao dịch này");
    }

    return paymentMapper.toPaymentResponse(payment);
  }

  /** Lấy payments của một order */
  @Transactional(readOnly = true)
  @SuppressWarnings("null")
  public List<PaymentResponse> getOrderPayments(Long userId, Long orderId) {
    Order order =
        orderRepository
            .findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    if (!order.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Bạn không có quyền xem đơn hàng này");
    }

    List<Payment> payments = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    return payments.stream().map(paymentMapper::toPaymentResponse).collect(Collectors.toList());
  }

  // Helper methods
  private String generateTransactionId() {
    return "TXN-"
        + System.currentTimeMillis()
        + "-"
        + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
  }

  private String createSuccessResponse(String paymentMethodCode) {
    try {
      ObjectNode response = objectMapper.createObjectNode();
      response.put("status", "success");
      response.put("code", "00");
      response.put("message", "Thanh toán thành công");
      response.put("paymentMethod", paymentMethodCode);
      response.put("timestamp", LocalDateTime.now().toString());
      return objectMapper.writeValueAsString(response);
    } catch (Exception e) {
      return "{\"status\":\"success\",\"message\":\"Thanh toán thành công\"}";
    }
  }

  private String createFailureResponse(String paymentMethodCode) {
    try {
      ObjectNode response = objectMapper.createObjectNode();
      response.put("status", "failed");
      response.put("code", "99");
      response.put("message", "Thanh toán thất bại");
      response.put("paymentMethod", paymentMethodCode);
      response.put("timestamp", LocalDateTime.now().toString());
      return objectMapper.writeValueAsString(response);
    } catch (Exception e) {
      return "{\"status\":\"failed\",\"message\":\"Thanh toán thất bại\"}";
    }
  }
}
