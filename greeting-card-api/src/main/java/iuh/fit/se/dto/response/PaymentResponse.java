package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
  private Long id;
  private Long orderId;
  private String orderNumber;
  private Long paymentMethodId;
  private String paymentMethodName;
  private String paymentMethodCode;
  private BigDecimal amount;
  private PaymentStatus status;
  private String transactionId;
  private String gatewayResponse;
  private LocalDateTime paidAt;
  private LocalDateTime failedAt;
  private String failureReason;
  private LocalDateTime refundedAt;
  private BigDecimal refundAmount;
  private String refundReason;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
