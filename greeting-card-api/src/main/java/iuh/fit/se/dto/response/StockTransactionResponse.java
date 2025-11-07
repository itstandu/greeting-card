package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.StockTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionResponse {
  private Long id;
  private Long productId;
  private String productName;
  private String productSku;
  private StockTransactionType type;
  private Integer quantity;
  private Integer stockBefore;
  private Integer stockAfter;
  private String notes;
  private String createdBy; // Tên người thực hiện
  private LocalDateTime createdAt;
}
