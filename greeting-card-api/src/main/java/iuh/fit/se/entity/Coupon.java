package iuh.fit.se.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import iuh.fit.se.entity.enumeration.DiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho mã giảm giá (Coupon)
@Entity
@Table(
    name = "coupons",
    indexes = {
      @Index(name = "idx_coupons_code", columnList = "code"),
      @Index(name = "idx_coupons_is_active", columnList = "is_active"),
      @Index(name = "idx_coupons_valid_from", columnList = "valid_from"),
      @Index(name = "idx_coupons_valid_until", columnList = "valid_until")
    })
@SQLDelete(sql = "UPDATE coupons SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Coupon extends BaseEntity {
  @Column(nullable = false, unique = true, length = 50)
  private String code;

  @Enumerated(EnumType.STRING)
  @Column(name = "discount_type", nullable = false, length = 20)
  private DiscountType discountType;

  @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
  @DecimalMin(value = "0.01")
  private BigDecimal discountValue;

  @Column(name = "min_purchase", precision = 10, scale = 2)
  private BigDecimal minPurchase = BigDecimal.ZERO;

  @Column(name = "max_discount", precision = 10, scale = 2)
  private BigDecimal maxDiscount;

  @Column(name = "valid_from", nullable = false)
  private LocalDateTime validFrom;

  @Column(name = "valid_until", nullable = false)
  private LocalDateTime validUntil;

  @Column(name = "usage_limit")
  private Integer usageLimit;

  @Column(name = "used_count", nullable = false)
  private Integer usedCount = 0;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @OneToMany(mappedBy = "coupon")
  @BatchSize(size = 50)
  private List<Order> orders = new ArrayList<>();

  // Kiểm tra coupon có hợp lệ không
  public boolean isValid() {
    LocalDateTime now = LocalDateTime.now();
    return isActive
        && now.isAfter(validFrom)
        && now.isBefore(validUntil)
        && (usageLimit == null || usedCount < usageLimit);
  }
}
