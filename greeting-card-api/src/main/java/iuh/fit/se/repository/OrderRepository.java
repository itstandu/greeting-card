package iuh.fit.se.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.enumeration.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
  boolean existsByUserId(Long userId);

  // Lấy danh sách orders của một user cụ thể với eager fetch
  @Query(
      value =
          "SELECT DISTINCT o FROM Order o "
              + "LEFT JOIN FETCH o.user "
              + "LEFT JOIN FETCH o.paymentMethod "
              + "WHERE o.user.id = :userId AND o.deletedAt IS NULL "
              + "ORDER BY o.orderDate DESC",
      countQuery = "SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.deletedAt IS NULL")
  Page<Order> findByUserIdOrderByOrderDateDesc(@Param("userId") Long userId, Pageable pageable);

  @Query(
      "SELECT o FROM Order o "
          + "LEFT JOIN FETCH o.user "
          + "LEFT JOIN FETCH o.paymentMethod "
          + "WHERE o.user.id = :userId AND o.deletedAt IS NULL "
          + "ORDER BY o.orderDate DESC")
  List<Order> findByUserIdOrderByOrderDateDesc(@Param("userId") Long userId);

  // Lấy order với details
  @Query(
      "SELECT o FROM Order o "
          + "LEFT JOIN FETCH o.orderItems oi "
          + "LEFT JOIN FETCH oi.product "
          + "LEFT JOIN FETCH o.shippingAddress "
          + "LEFT JOIN FETCH o.paymentMethod "
          + "WHERE o.id = :orderId")
  Optional<Order> findByIdWithDetails(@Param("orderId") Long orderId);

  // Admin: Filter orders by status
  Page<Order> findByStatusOrderByOrderDateDesc(OrderStatus status, Pageable pageable);

  // Admin: Search orders by order number or user email (optimized with JOIN FETCH)
  @Query(
      value =
          "SELECT DISTINCT o FROM Order o "
              + "JOIN FETCH o.user u "
              + "LEFT JOIN FETCH o.paymentMethod "
              + "WHERE o.deletedAt IS NULL AND ("
              + "   LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))",
      countQuery =
          "SELECT COUNT(DISTINCT o) FROM Order o JOIN o.user u "
              + "WHERE o.deletedAt IS NULL AND ("
              + "   LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
  Page<Order> searchOrders(@Param("keyword") String keyword, Pageable pageable);

  // Tìm order number gần nhất để generate order number mới
  @Query("SELECT o.orderNumber FROM Order o ORDER BY o.createdAt DESC")
  List<String> findLatestOrderNumber(Pageable pageable);

  // Dashboard: Get total revenue
  @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
  java.math.BigDecimal getTotalRevenue();

  // Dashboard: Get revenue summary by period (PostgreSQL)
  @Query(
      value =
          """
          SELECT TO_CHAR(o.order_date, :dateFormat) as period,
                 COALESCE(SUM(o.final_amount), 0) as revenue,
                 COUNT(o.id) as orderCount
          FROM orders o
          WHERE o.status != 'CANCELLED'
            AND o.order_date >= :startDate
          GROUP BY period
          ORDER BY period
          """,
      nativeQuery = true)
  List<Object[]> getRevenueSummaryByPeriod(
      @Param("dateFormat") String dateFormat, @Param("startDate") java.time.LocalDate startDate);

  // Dashboard: Get latest orders
  @Query("SELECT o FROM Order o " + "LEFT JOIN FETCH o.user " + "ORDER BY o.orderDate DESC")
  List<Order> findLatestOrders(Pageable pageable);

  // Dashboard: Count orders by status
  long countByStatus(OrderStatus status);

  // Dashboard: Get all order status counts in one query (optimized)
  @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.deletedAt IS NULL GROUP BY o.status")
  List<Object[]> countOrdersByAllStatuses();

  // Dashboard: Get today's orders count
  @Query(
      value = "SELECT COUNT(*) FROM orders o WHERE o.order_date::date = CURRENT_DATE",
      nativeQuery = true)
  Long countTodayOrders();

  // Dashboard: Get today's revenue
  @Query(
      value =
          "SELECT COALESCE(SUM(o.final_amount), 0) FROM orders o WHERE o.order_date::date = CURRENT_DATE AND o.status != 'CANCELLED'",
      nativeQuery = true)
  java.math.BigDecimal getTodayRevenue();

  // Dashboard: Get average order value
  @Query("SELECT COALESCE(AVG(o.finalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
  java.math.BigDecimal getAverageOrderValue();

  // Dashboard: Get sales by category
  @Query(
      value =
          """
          SELECT c.id as categoryId,
                 c.name as categoryName,
                 c.slug as categorySlug,
                 COALESCE(SUM(oi.subtotal), 0) as revenue,
                 COUNT(DISTINCT o.id) as orderCount,
                 COUNT(DISTINCT oi.product_id) as productCount
          FROM categories c
          LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
          LEFT JOIN order_items oi ON p.id = oi.product_id
          LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'CANCELLED'
          WHERE c.deleted_at IS NULL
          GROUP BY c.id, c.name, c.slug
          HAVING COALESCE(SUM(oi.subtotal), 0) > 0
          ORDER BY revenue DESC
          """,
      nativeQuery = true)
  List<Object[]> getSalesByCategory();
}
