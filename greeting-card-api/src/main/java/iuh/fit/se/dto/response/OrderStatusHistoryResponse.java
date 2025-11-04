package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {
  private Long id;
  private OrderStatus status;
  private String notes;
  private String changedBy; // Full name của người thay đổi
  private LocalDateTime createdAt;
}
