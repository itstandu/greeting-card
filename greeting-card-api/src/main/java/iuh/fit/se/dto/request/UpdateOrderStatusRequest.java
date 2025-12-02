package iuh.fit.se.dto.request;

import iuh.fit.se.entity.enumeration.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
  @NotNull(message = "Status không được để trống")
  private OrderStatus status;

  private String notes; // Ghi chú khi thay đổi trạng thái
}
