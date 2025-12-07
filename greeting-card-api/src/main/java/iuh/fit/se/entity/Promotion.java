package iuh.fit.se.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.PromotionScope;
import iuh.fit.se.entity.enumeration.PromotionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho khuyến mãi (Promotion)
@Entity
@Table(
    name = "promotions",
    indexes = {
      @Index(name = "idx_promotions_name", columnList = "name"),
      @Index(name = "idx_promotions_type", columnList = "type"),
      @Index(name = "idx_promotions_scope", columnList = "scope"),
      @Index(name = "idx_promotions_is_active", columnList = "is_active"),
      @Index(name = "idx_promotions_valid_from", columnList = "valid_from"),
      @Index(name = "idx_promotions_valid_until", columnList = "valid_until"),
      @Index(name = "idx_promotions_category_id", columnList = "category_id"),
      // Composite index for active promotions lookup
      @Index(
          name = "idx_promotions_active_lookup",
          columnList = "is_active, valid_from, valid_until, scope")
    })
@SQLDelete(sql = "UPDATE promotions SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Promotion extends BaseEntity {
  @Column(nullable = false, length = 255)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private PromotionType type;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private PromotionScope scope;

  // Cho DISCOUNT type
  @Enumerated(EnumType.STRING)
  @Column(name = "discount_type", length = 20)
  private DiscountType discountType;

  @Column(name = "discount_value", precision = 10, scale = 2)
  @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
  private BigDecimal discountValue;

  @Column(name = "min_purchase", precision = 10, scale = 2)
  private BigDecimal minPurchase = BigDecimal.ZERO;

  @Column(name = "max_discount", precision = 10, scale = 2)
  private BigDecimal maxDiscount;

  // Cho BUY_X_GET_Y và BUY_X_PAY_Y types
  @Column(name = "buy_quantity")
  @Min(value = 1, message = "Số lượng mua phải >= 1")
  private Integer buyQuantity;

  @Column(name = "get_quantity")
  @Min(value = 0, message = "Số lượng tặng phải >= 0")
  private Integer getQuantity;

  @Column(name = "pay_quantity")
  @Min(value = 1, message = "Số lượng tính tiền phải >= 1")
  private Integer payQuantity;

  // Cho PRODUCT scope - many-to-many với products
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "promotion_products",
      joinColumns = @JoinColumn(name = "promotion_id"),
      inverseJoinColumns = @JoinColumn(name = "product_id"))
  @BatchSize(size = 50)
  private Set<Product> products = new HashSet<>();

  // Cho CATEGORY scope - many-to-one với category
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private Category category;

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

  @OneToMany(mappedBy = "promotion")
  @BatchSize(size = 50)
  private List<Order> orders = new ArrayList<>();

  // Kiểm tra promotion có hợp lệ không
  public boolean isValid() {
    LocalDateTime now = LocalDateTime.now();
    return isActive
        && now.isAfter(validFrom)
        && now.isBefore(validUntil)
        && (usageLimit == null || usedCount < usageLimit);
  }

  // Validate promotion configuration
  public boolean isValidConfiguration() {
    if (type == PromotionType.DISCOUNT) {
      return discountType != null
          && discountValue != null
          && discountValue.compareTo(BigDecimal.ZERO) > 0;
    } else if (type == PromotionType.BOGO) {
      return buyQuantity != null && buyQuantity == 1 && getQuantity != null && getQuantity == 1;
    } else if (type == PromotionType.BUY_X_GET_Y) {
      return buyQuantity != null && buyQuantity > 0 && getQuantity != null && getQuantity > 0;
    } else if (type == PromotionType.BUY_X_PAY_Y) {
      return buyQuantity != null
          && buyQuantity > 0
          && payQuantity != null
          && payQuantity > 0
          && payQuantity < buyQuantity;
    }
    return false;
  }
}
