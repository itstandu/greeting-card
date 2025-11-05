package iuh.fit.se.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.StockTransaction;
import iuh.fit.se.entity.enumeration.StockTransactionType;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
  // Lấy tất cả giao dịch của một sản phẩm
  Page<StockTransaction> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

  // Lấy giao dịch theo loại
  Page<StockTransaction> findByTypeOrderByCreatedAtDesc(
      StockTransactionType type, Pageable pageable);

  // Tìm kiếm giao dịch - sử dụng native query để tránh lỗi type casting với LOWER()
  // Lưu ý: Native query không hỗ trợ Pageable sorting, cần xử lý trong service
  @Query(
      value =
          """
          SELECT st.* FROM stock_transactions st
          LEFT JOIN products p ON p.id = st.product_id AND p.deleted_at IS NULL
          LEFT JOIN users u ON u.id = st.created_by AND u.deleted_at IS NULL
          WHERE (:productId IS NULL OR st.product_id = :productId)
            AND (:typeStr IS NULL OR st.type = :typeStr)
            AND (:keyword IS NULL
                OR LOWER(CAST(p.name AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%'))
                OR LOWER(CAST(p.sku AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%')))
          ORDER BY st.created_at DESC
          LIMIT :limit OFFSET :offset
          """,
      nativeQuery = true)
  List<StockTransaction> searchStockTransactionsNative(
      @Param("productId") Long productId,
      @Param("typeStr") String typeStr,
      @Param("keyword") String keyword,
      @Param("limit") int limit,
      @Param("offset") long offset);

  @Query(
      value =
          """
          SELECT COUNT(*) FROM stock_transactions st
          LEFT JOIN products p ON p.id = st.product_id AND p.deleted_at IS NULL
          WHERE (:productId IS NULL OR st.product_id = :productId)
            AND (:typeStr IS NULL OR st.type = :typeStr)
            AND (:keyword IS NULL
                OR LOWER(CAST(p.name AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%'))
                OR LOWER(CAST(p.sku AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%')))
          """,
      nativeQuery = true)
  long countStockTransactions(
      @Param("productId") Long productId,
      @Param("typeStr") String typeStr,
      @Param("keyword") String keyword);

  // Lấy lịch sử giao dịch của sản phẩm
  @Query(
      "SELECT st FROM StockTransaction st "
          + "LEFT JOIN FETCH st.createdBy "
          + "WHERE st.product.id = :productId "
          + "ORDER BY st.createdAt DESC")
  List<StockTransaction> findByProductIdWithUser(@Param("productId") Long productId);
}
