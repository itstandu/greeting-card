package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** DTO cho danh sách giỏ hàng (summary view) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryResponse {
  private Long id;
  private Long userId;
  private String userEmail;
  private String userFullName;
  private Integer totalItems;
  private BigDecimal totalAmount;
  private LocalDateTime updatedAt;
}
