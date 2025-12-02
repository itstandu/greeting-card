package iuh.fit.se.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho hình ảnh sản phẩm Một sản phẩm có thể có nhiều hình ảnh
@Entity
@Table(
    name = "product_images",
    indexes = @Index(name = "idx_product_images_product_id", columnList = "product_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Column(name = "image_url", nullable = false, length = 500)
  private String imageUrl;

  @Column(name = "alt_text", length = 255)
  private String altText;

  @Column(name = "is_primary", nullable = false)
  private Boolean isPrimary = false;

  @Column(name = "display_order")
  private Integer displayOrder = 0;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;
}
