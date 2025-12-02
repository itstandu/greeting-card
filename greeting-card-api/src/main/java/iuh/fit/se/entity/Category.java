package iuh.fit.se.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho loại sản phẩm (Category) Hỗ trợ danh mục đa cấp với parent-child relationship
@Entity
@Table(
    name = "categories",
    indexes = {
      @Index(name = "idx_categories_name", columnList = "name"),
      @Index(name = "idx_categories_slug", columnList = "slug"),
      @Index(name = "idx_categories_parent_id", columnList = "parent_id"),
      @Index(name = "idx_categories_deleted_at", columnList = "deleted_at")
    })
@SQLDelete(sql = "UPDATE categories SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {
  @Column(nullable = false, length = 255)
  private String name;

  @Column(unique = true, length = 255)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id")
  private Category parent;

  @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
  private List<Category> children = new ArrayList<>();

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Column(name = "display_order")
  private Integer displayOrder = 0;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @Column(name = "is_featured", nullable = false)
  private Boolean isFeatured = false;

  @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Product> products = new ArrayList<>();
}
