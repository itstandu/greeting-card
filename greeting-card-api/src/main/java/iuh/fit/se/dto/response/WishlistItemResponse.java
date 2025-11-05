package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemResponse {
  private Long id;
  private ProductResponse product;
  private LocalDateTime addedAt;
}
