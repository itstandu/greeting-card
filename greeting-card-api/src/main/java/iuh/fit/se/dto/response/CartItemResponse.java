package iuh.fit.se.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
  private Long id;
  private ProductResponse product;
  private Integer quantity;
  private BigDecimal subtotal; // price × quantity

  public CartItemResponse(Long id, ProductResponse product, Integer quantity) {
    this.id = id;
    this.product = product;
    this.quantity = quantity;
    this.subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
  }
}
