package iuh.fit.se.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import iuh.fit.se.entity.enumeration.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho giao dịch thanh toán
@Entity
@Table(
    name = "payments",
    indexes = {
      @Index(name = "idx_payments_order_id", columnList = "order_id"),
      @Index(name = "idx_payments_payment_method_id", columnList = "payment_method_id"),
      @Index(name = "idx_payments_status", columnList = "status"),
      @Index(name = "idx_payments_transaction_id", columnList = "transaction_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "payment_method_id", nullable = false)
  private PaymentMethod paymentMethod;

  @Column(name = "amount", nullable = false, precision = 10, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private PaymentStatus status = PaymentStatus.PENDING;

  @Column(name = "transaction_id", unique = true, length = 100)
  private String transactionId; // ID từ payment gateway (giả lập)

  @Column(name = "gateway_response", columnDefinition = "TEXT")
  private String gatewayResponse; // Response từ payment gateway (JSON)

  @Column(name = "paid_at")
  private LocalDateTime paidAt; // Thời điểm thanh toán thành công

  @Column(name = "failed_at")
  private LocalDateTime failedAt; // Thời điểm thanh toán thất bại

  @Column(name = "failure_reason", columnDefinition = "TEXT")
  private String failureReason; // Lý do thanh toán thất bại

  @Column(name = "refunded_at")
  private LocalDateTime refundedAt; // Thời điểm hoàn tiền

  @Column(name = "refund_amount", precision = 10, scale = 2)
  private BigDecimal refundAmount; // Số tiền đã hoàn

  @Column(name = "refund_reason", columnDefinition = "TEXT")
  private String refundReason; // Lý do hoàn tiền

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
