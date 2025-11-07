package iuh.fit.se.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryResponse {
  private String period; // e.g., "2024-01", "Week 1", "Monday"
  private BigDecimal revenue;
  private Long orderCount;
}
