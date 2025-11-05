package iuh.fit.se.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Promotion;
import iuh.fit.se.entity.enumeration.PromotionScope;
import iuh.fit.se.entity.enumeration.PromotionType;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
  // Tìm promotion theo ID (đã filter soft delete)
  Optional<Promotion> findById(Long id);

  // Tìm các promotion đang active và hợp lệ
  @Query(
      "SELECT p FROM Promotion p WHERE p.isActive = true "
          + "AND p.validFrom <= :now AND p.validUntil > :now "
          + "AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
  List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);

  // Tìm promotion theo type và scope
  @Query(
      "SELECT p FROM Promotion p WHERE p.type = :type "
          + "AND p.scope = :scope AND p.isActive = true "
          + "AND p.validFrom <= :now AND p.validUntil > :now "
          + "AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
  List<Promotion> findActivePromotionsByTypeAndScope(
      @Param("type") PromotionType type,
      @Param("scope") PromotionScope scope,
      @Param("now") LocalDateTime now);

  // Tìm promotion cho sản phẩm cụ thể (PRODUCT scope)
  @Query(
      "SELECT DISTINCT p FROM Promotion p "
          + "JOIN p.products pr "
          + "WHERE pr.id = :productId "
          + "AND p.scope = 'PRODUCT' "
          + "AND p.isActive = true "
          + "AND p.validFrom <= :now AND p.validUntil > :now "
          + "AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
  List<Promotion> findActivePromotionsForProduct(
      @Param("productId") Long productId, @Param("now") LocalDateTime now);

  // Tìm promotion cho danh mục (CATEGORY scope)
  @Query(
      "SELECT p FROM Promotion p "
          + "WHERE p.category.id = :categoryId "
          + "AND p.scope = 'CATEGORY' "
          + "AND p.isActive = true "
          + "AND p.validFrom <= :now AND p.validUntil > :now "
          + "AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
  List<Promotion> findActivePromotionsForCategory(
      @Param("categoryId") Long categoryId, @Param("now") LocalDateTime now);

  // Tìm promotion cho toàn bộ đơn hàng (ORDER scope)
  @Query(
      "SELECT p FROM Promotion p "
          + "WHERE p.scope = 'ORDER' "
          + "AND p.isActive = true "
          + "AND p.validFrom <= :now AND p.validUntil > :now "
          + "AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
  List<Promotion> findActivePromotionsForOrder(@Param("now") LocalDateTime now);
}
