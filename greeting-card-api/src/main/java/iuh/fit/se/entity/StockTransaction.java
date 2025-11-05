package iuh.fit.se.entity;

import iuh.fit.se.entity.enumeration.StockTransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho giao dịch nhập/xuất kho
@Entity
@Table(
    name = "stock_transactions",
    indexes = {
      @Index(name = "idx_stock_transactions_product_id", columnList = "product_id"),
      @Index(name = "idx_stock_transactions_type", columnList = "type"),
      @Index(name = "idx_stock_transactions_created_at", columnList = "created_at")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransaction extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private StockTransactionType type;

  @Column(nullable = false)
  private Integer quantity; // Số lượng (dương cho IN, âm cho OUT, có thể âm/dương cho ADJUSTMENT)

  @Column(name = "stock_before", nullable = false)
  private Integer stockBefore; // Tồn kho trước khi thực hiện

  @Column(name = "stock_after", nullable = false)
  private Integer stockAfter; // Tồn kho sau khi thực hiện

  @Column(columnDefinition = "TEXT")
  private String notes; // Ghi chú về giao dịch

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy; // Người thực hiện giao dịch
}
