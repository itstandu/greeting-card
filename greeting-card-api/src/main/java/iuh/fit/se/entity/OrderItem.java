package iuh.fit.se.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho chi tiết đơn hàng (OrderItem)
@Entity
@Table(
    name = "order_items",
    indexes = {
      @Index(name = "idx_order_items_order_id", columnList = "order_id"),
      @Index(name = "idx_order_items_product_id", columnList = "product_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Column(nullable = false)
  @Min(value = 1, message = "Số lượng phải lớn hơn 0")
  private Integer quantity;

  @Column(nullable = false, precision = 10, scale = 2)
  @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
  private BigDecimal price;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal subtotal; // quantity × price

  // Promotion tracking
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "promotion_id")
  private Promotion promotion;

  @Column(name = "promotion_discount_amount", precision = 10, scale = 2)
  private BigDecimal promotionDiscountAmount = BigDecimal.ZERO;

  @Column(name = "promotion_quantity_free")
  private Integer promotionQuantityFree = 0; // Số lượng được tặng miễn phí

  // JPA lifecycle callback - tự động tính subtotal (warning "never used" là false positive)
  @PrePersist
  @PreUpdate
  private void calculateSubtotal() {
    if (quantity != null && price != null) {
      this.subtotal = price.multiply(BigDecimal.valueOf(quantity));
    }
  }
}
