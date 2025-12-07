package iuh.fit.se.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.entity.enumeration.PaymentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho đơn hàng
@Entity
@Table(
    name = "orders",
    indexes = {
      @Index(name = "idx_orders_user_id", columnList = "user_id"),
      @Index(name = "idx_orders_order_date", columnList = "order_date"),
      @Index(name = "idx_orders_status", columnList = "status"),
      @Index(name = "idx_orders_order_number", columnList = "order_number"),
      @Index(name = "idx_orders_payment_status", columnList = "payment_status"),
      // Composite index for user order history queries
      @Index(name = "idx_orders_user_date", columnList = "user_id, order_date DESC"),
      // Composite index for dashboard revenue queries
      @Index(
          name = "idx_orders_revenue",
          columnList = "deleted_at, status, order_date, final_amount")
    })
@SQLDelete(sql = "UPDATE orders SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "order_number", unique = true, length = 50)
  private String orderNumber;

  @Column(name = "order_date", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime orderDate;

  @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
  @DecimalMin(value = "0.01", message = "Tổng tiền phải lớn hơn 0")
  private BigDecimal totalAmount;

  @Column(name = "discount_amount", precision = 10, scale = 2)
  private BigDecimal discountAmount = BigDecimal.ZERO;

  @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
  private BigDecimal finalAmount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OrderStatus status = OrderStatus.PENDING;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "payment_method_id")
  private PaymentMethod paymentMethod;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_status", length = 20)
  private PaymentStatus paymentStatus = PaymentStatus.PENDING;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "shipping_address_id")
  private UserAddress shippingAddress;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "coupon_id")
  private Coupon coupon;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "promotion_id")
  private Promotion promotion;

  @Column(name = "promotion_discount_amount", precision = 10, scale = 2)
  private BigDecimal promotionDiscountAmount = BigDecimal.ZERO;

  @Column(columnDefinition = "TEXT")
  private String notes;

  // Relationships
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 50)
  private List<OrderItem> orderItems = new ArrayList<>();

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 50)
  private List<OrderStatusHistory> statusHistory = new ArrayList<>();

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 20)
  private List<Payment> payments = new ArrayList<>();
}
