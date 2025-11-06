package iuh.fit.se.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentMethodOrderRequest {
  @NotEmpty(message = "Danh sách thứ tự không được để trống")
  private List<PaymentMethodOrderItem> items;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class PaymentMethodOrderItem {
    private Long id;
    private Integer displayOrder;
  }
}
