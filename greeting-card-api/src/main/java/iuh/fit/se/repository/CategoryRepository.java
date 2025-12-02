package iuh.fit.se.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
  Optional<Category> findBySlug(String slug);

  boolean existsBySlug(String slug);

  @Query(
      value =
          """
            SELECT c.* FROM categories c
            WHERE c.deleted_at IS NULL
            AND (:parentId IS NULL OR c.parent_id = :parentId)
            AND (:isActive IS NULL OR c.is_active = :isActive)
            AND (:isFeatured IS NULL OR c.is_featured = :isFeatured)
            AND (:keyword IS NULL
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            ORDER BY c.display_order ASC, c.created_at DESC
            """,
      countQuery =
          """
            SELECT COUNT(*) FROM categories c
            WHERE c.deleted_at IS NULL
            AND (:parentId IS NULL OR c.parent_id = :parentId)
            AND (:isActive IS NULL OR c.is_active = :isActive)
            AND (:isFeatured IS NULL OR c.is_featured = :isFeatured)
            AND (:keyword IS NULL
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """,
      nativeQuery = true)
  Page<Category> searchCategories(
      @Param("parentId") Long parentId,
      @Param("isActive") Boolean isActive,
      @Param("isFeatured") Boolean isFeatured,
      @Param("keyword") String keyword,
      Pageable pageable);
}
