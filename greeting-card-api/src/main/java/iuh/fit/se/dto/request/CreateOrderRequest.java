package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
  @NotNull(message = "Shipping address ID không được để trống")
  private Long shippingAddressId;

  @NotNull(message = "Payment method ID không được để trống")
  private Long paymentMethodId;

  private String couponCode; // Optional

  private String notes; // Optional - Ghi chú từ khách hàng
}
