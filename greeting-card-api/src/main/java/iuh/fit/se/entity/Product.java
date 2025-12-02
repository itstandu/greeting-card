package iuh.fit.se.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

// Entity đại diện cho sản phẩm (Product)
@Entity
@Table(
    name = "products",
    indexes = {
      @Index(name = "idx_products_category_id", columnList = "category_id"),
      @Index(name = "idx_products_name", columnList = "name"),
      @Index(name = "idx_products_slug", columnList = "slug"),
      @Index(name = "idx_products_sku", columnList = "sku"),
      @Index(name = "idx_products_deleted_at", columnList = "deleted_at"),
      @Index(name = "idx_products_is_active", columnList = "is_active")
    })
@SQLDelete(sql = "UPDATE products SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(unique = true, length = 255)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, precision = 10, scale = 2)
  @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
  private BigDecimal price;

  @Column(nullable = false)
  @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
  private Integer stock = 0;

  @Column(unique = true, length = 100)
  private String sku;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @Column(name = "is_featured", nullable = false)
  private Boolean isFeatured = false;

  // Relationships
  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 50)
  private List<ProductImage> images = new ArrayList<>();

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
  private List<OrderItem> orderItems = new ArrayList<>();

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ProductReview> reviews = new ArrayList<>();

  @ManyToMany
  @JoinTable(
      name = "product_tag_map",
      joinColumns = @JoinColumn(name = "product_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @BatchSize(size = 50)
  private Set<ProductTag> tags = new HashSet<>();

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<WishlistItem> wishlistItems = new ArrayList<>();
}
