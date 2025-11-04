package iuh.fit.se.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Request để sync giỏ hàng từ localStorage lên server khi user login */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SyncCartRequest {
  @NotEmpty(message = "Giỏ hàng không được trống")
  @Valid
  private List<CartItemData> items;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CartItemData {
    private Long productId;
    private Integer quantity;
  }
}
