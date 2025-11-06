package iuh.fit.se.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundPaymentRequest {
  @NotNull(message = "Payment ID không được để trống")
  private Long paymentId;

  @Positive(message = "Số tiền hoàn phải lớn hơn 0")
  private BigDecimal refundAmount;

  private String reason; // Lý do hoàn tiền
}
