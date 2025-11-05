package iuh.fit.se.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho một item trong danh sách yêu thích
@Entity
@Table(
    name = "wishlist_items",
    indexes = {
      @Index(name = "idx_wishlist_items_wishlist_id", columnList = "wishlist_id"),
      @Index(name = "idx_wishlist_items_product_id", columnList = "product_id")
    },
    uniqueConstraints = @UniqueConstraint(columnNames = {"wishlist_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "wishlist_id", nullable = false)
  private Wishlist wishlist;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Column(name = "added_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime addedAt;
}
