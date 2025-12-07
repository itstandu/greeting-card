package iuh.fit.se.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho đánh giá sản phẩm Mỗi user chỉ có thể đánh giá 1 lần cho mỗi sản phẩm
@Entity
@Table(
    name = "product_reviews",
    indexes = {
      @Index(name = "idx_product_reviews_product_id", columnList = "product_id"),
      @Index(name = "idx_product_reviews_user_id", columnList = "user_id"),
      @Index(name = "idx_product_reviews_rating", columnList = "rating"),
      @Index(name = "idx_product_reviews_is_approved", columnList = "is_approved"),
      // Composite index for approved reviews query
      @Index(
          name = "idx_product_reviews_product_approved",
          columnList = "product_id, is_approved, rating")
    },
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductReview {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  @Min(value = 1)
  @Max(value = 5)
  private Integer rating;

  @Column(columnDefinition = "TEXT")
  private String comment;

  @Column(name = "is_verified_purchase", nullable = false)
  private Boolean isVerifiedPurchase = false;

  @Column(name = "is_approved", nullable = false)
  private Boolean isApproved = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
