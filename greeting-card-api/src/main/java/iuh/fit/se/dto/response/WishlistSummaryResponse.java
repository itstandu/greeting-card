package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistSummaryResponse {
  private Long id;
  private Long userId;
  private String userEmail;
  private String userFullName;
  private Integer totalItems;
  private LocalDateTime updatedAt;
}
