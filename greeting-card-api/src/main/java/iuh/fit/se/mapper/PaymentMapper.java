package iuh.fit.se.mapper;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.PaymentResponse;
import iuh.fit.se.entity.Payment;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PaymentMapper {
  public PaymentResponse toPaymentResponse(Payment payment) {
    if (payment == null) {
      return null;
    }

    return PaymentResponse.builder()
        .id(payment.getId())
        .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
        .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
        .paymentMethodId(
            payment.getPaymentMethod() != null ? payment.getPaymentMethod().getId() : null)
        .paymentMethodName(
            payment.getPaymentMethod() != null ? payment.getPaymentMethod().getName() : null)
        .paymentMethodCode(
            payment.getPaymentMethod() != null ? payment.getPaymentMethod().getCode() : null)
        .amount(payment.getAmount())
        .status(payment.getStatus())
        .transactionId(payment.getTransactionId())
        .gatewayResponse(payment.getGatewayResponse())
        .paidAt(payment.getPaidAt())
        .failedAt(payment.getFailedAt())
        .failureReason(payment.getFailureReason())
        .refundedAt(payment.getRefundedAt())
        .refundAmount(payment.getRefundAmount())
        .refundReason(payment.getRefundReason())
        .createdAt(payment.getCreatedAt())
        .updatedAt(payment.getUpdatedAt())
        .build();
  }
}
