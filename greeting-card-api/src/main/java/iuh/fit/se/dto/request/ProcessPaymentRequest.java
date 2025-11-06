package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {
  @NotNull(message = "Order ID không được để trống")
  private Long orderId;

  // Thông tin thanh toán (tùy theo payment method)
  private String cardNumber; // Cho CREDIT_CARD
  private String cardHolderName; // Cho CREDIT_CARD
  private String expiryDate; // Cho CREDIT_CARD
  private String cvv; // Cho CREDIT_CARD

  private String bankAccount; // Cho BANK_TRANSFER
  private String bankName; // Cho BANK_TRANSFER

  private String phoneNumber; // Cho MOMO, ZALOPAY

  // Simulate payment failure (for testing)
  @Builder.Default private Boolean simulateFailure = false;
  private String failureReason; // Lý do thất bại (nếu simulateFailure = true)
}
