package iuh.fit.se.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO metadata cho phân trang
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponse {
  private int page;
  private int size;
  private long total;
  private int totalPages;
}
