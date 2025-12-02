package iuh.fit.se.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import iuh.fit.se.entity.enumeration.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho lịch sử thay đổi trạng thái đơn hàng
@Entity
@Table(
    name = "order_status_history",
    indexes = {
      @Index(name = "idx_order_status_history_order_id", columnList = "order_id"),
      @Index(name = "idx_order_status_history_created_at", columnList = "created_at")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistory {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OrderStatus status;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "changed_by", nullable = false)
  private User changedBy;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;
}
