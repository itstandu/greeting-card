package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
  private Long id;
  private List<CartItemResponse> items;
  private BigDecimal total;
  private Integer totalItems;

  public CartResponse(Long id, List<CartItemResponse> items) {
    this.id = id;
    this.items = items;
    this.total = calculateTotal();
    this.totalItems = calculateTotalItems();
  }

  private BigDecimal calculateTotal() {
    return items.stream()
        .map(CartItemResponse::getSubtotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private Integer calculateTotalItems() {
    return items.stream().mapToInt(CartItemResponse::getQuantity).sum();
  }
}
