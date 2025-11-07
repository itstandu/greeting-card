package iuh.fit.se.dto.request;

import iuh.fit.se.entity.enumeration.StockTransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateStockTransactionRequest {
  @NotNull(message = "Sản phẩm không được để trống")
  private Long productId;

  @NotNull(message = "Loại giao dịch không được để trống")
  private StockTransactionType type;

  @NotNull(message = "Số lượng không được để trống")
  private Integer quantity; // Có thể âm cho ADJUSTMENT

  private String notes; // Ghi chú (tùy chọn)
}
