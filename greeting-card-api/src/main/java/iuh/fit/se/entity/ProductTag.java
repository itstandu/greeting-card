package iuh.fit.se.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho tag của sản phẩm Many-to-Many với Product thông qua product_tag_map
@Entity
@Table(
    name = "product_tags",
    indexes = {
      @Index(name = "idx_product_tags_name", columnList = "name"),
      @Index(name = "idx_product_tags_slug", columnList = "slug")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductTag {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 100)
  private String name;

  @Column(unique = true, length = 100)
  private String slug;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @ManyToMany(mappedBy = "tags")
  private Set<Product> products = new HashSet<>();
}
