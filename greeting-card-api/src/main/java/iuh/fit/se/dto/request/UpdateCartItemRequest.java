package iuh.fit.se.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCartItemRequest {
  @NotNull(message = "Số lượng không được để trống")
  @Min(value = 0, message = "Số lượng phải >= 0") // 0 = xóa item
  private Integer quantity;
}
