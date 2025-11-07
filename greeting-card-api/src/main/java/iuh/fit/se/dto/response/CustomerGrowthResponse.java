package iuh.fit.se.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerGrowthResponse {
  private String period; // Date string
  private Long newUsers;
  private Long totalUsers;
}
