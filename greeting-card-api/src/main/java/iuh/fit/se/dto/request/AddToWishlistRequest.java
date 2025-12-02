package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddToWishlistRequest {
  @NotNull(message = "Product ID không được để trống")
  private Long productId;
}
