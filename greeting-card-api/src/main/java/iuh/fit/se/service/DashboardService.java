package iuh.fit.se.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.response.BestSellingProductResponse;
import iuh.fit.se.dto.response.CategorySalesResponse;
import iuh.fit.se.dto.response.CustomerGrowthResponse;
import iuh.fit.se.dto.response.DashboardStatsResponse;
import iuh.fit.se.dto.response.LowStockProductResponse;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.OrderStatusDistributionResponse;
import iuh.fit.se.dto.response.RevenueSummaryResponse;
import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.mapper.OrderMapper;
import iuh.fit.se.repository.OrderRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardService {
  private final UserRepository userRepository;
  private final OrderRepository orderRepository;
  private final ProductRepository productRepository;
  private final OrderMapper orderMapper;

  public DashboardStatsResponse getDashboardStats() {
    Long totalUsers = userRepository.count();
    Long totalOrders = orderRepository.count();
    BigDecimal totalRevenue = orderRepository.getTotalRevenue();
    Long totalProducts = productRepository.count();

    // Today's metrics
    Long todayOrders = orderRepository.countTodayOrders();
    BigDecimal todayRevenue = orderRepository.getTodayRevenue();

    // Order status counts - OPTIMIZED: single query instead of 5 separate queries
    Map<OrderStatus, Long> statusCounts = getOrderStatusCounts();
    Long pendingOrders = statusCounts.getOrDefault(OrderStatus.PENDING, 0L);
    Long confirmedOrders = statusCounts.getOrDefault(OrderStatus.CONFIRMED, 0L);
    Long shippedOrders = statusCounts.getOrDefault(OrderStatus.SHIPPED, 0L);
    Long deliveredOrders = statusCounts.getOrDefault(OrderStatus.DELIVERED, 0L);
    Long cancelledOrders = statusCounts.getOrDefault(OrderStatus.CANCELLED, 0L);

    // Additional metrics
    Long activeProducts = productRepository.countByIsActiveAndDeletedAtIsNull(true);
    Long lowStockProducts = productRepository.countLowStockProducts(10);
    BigDecimal averageOrderValue = orderRepository.getAverageOrderValue();

    return DashboardStatsResponse.builder()
        .totalUsers(totalUsers)
        .totalOrders(totalOrders)
        .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
        .totalProducts(totalProducts)
        .todayOrders(todayOrders != null ? todayOrders : 0L)
        .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
        .pendingOrders(pendingOrders)
        .confirmedOrders(confirmedOrders)
        .shippedOrders(shippedOrders)
        .deliveredOrders(deliveredOrders)
        .cancelledOrders(cancelledOrders)
        .activeProducts(activeProducts)
        .lowStockProducts(lowStockProducts)
        .averageOrderValue(
            averageOrderValue != null
                ? averageOrderValue.setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO)
        .build();
  }

  /**
   * Get all order status counts in a single query. This replaces 5 separate countByStatus() calls
   * with 1 grouped query.
   */
  private Map<OrderStatus, Long> getOrderStatusCounts() {
    List<Object[]> results = orderRepository.countOrdersByAllStatuses();
    Map<OrderStatus, Long> counts = new EnumMap<>(OrderStatus.class);
    for (Object[] result : results) {
      OrderStatus status = (OrderStatus) result[0];
      Long count = (Long) result[1];
      counts.put(status, count);
    }
    return counts;
  }

  public List<RevenueSummaryResponse> getRevenueSummary(String period, int days) {
    String dateFormat = getDateFormatByPeriod(period);
    LocalDate startDate = LocalDate.now().minusDays(days);

    List<Object[]> results = orderRepository.getRevenueSummaryByPeriod(dateFormat, startDate);

    return results.stream()
        .map(
            result ->
                RevenueSummaryResponse.builder()
                    .period((String) result[0])
                    .revenue((BigDecimal) result[1])
                    .orderCount(((Number) result[2]).longValue())
                    .build())
        .collect(Collectors.toList());
  }

  public List<OrderResponse.Simple> getLatestOrders(int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    List<Order> orders = orderRepository.findLatestOrders(pageable);
    return orders.stream().map(orderMapper::toSimpleOrderResponse).collect(Collectors.toList());
  }

  public List<BestSellingProductResponse> getBestSellingProducts(int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    List<Object[]> results = productRepository.findBestSellingProducts(pageable);

    return results.stream()
        .map(
            result ->
                BestSellingProductResponse.builder()
                    .productId(((Number) result[0]).longValue())
                    .productName((String) result[1])
                    .productSlug((String) result[2])
                    .productImage((String) result[3])
                    .totalSold(((Number) result[4]).longValue())
                    .totalRevenue((BigDecimal) result[5])
                    .build())
        .collect(Collectors.toList());
  }

  public List<LowStockProductResponse> getLowStockProducts(int threshold, int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    List<Product> products = productRepository.findLowStockProducts(threshold, pageable);

    return products.stream()
        .map(
            product -> {
              String primaryImage = null;
              if (!product.getImages().isEmpty()) {
                primaryImage =
                    product.getImages().stream()
                        .filter(img -> img.getIsPrimary())
                        .findFirst()
                        .map(img -> img.getImageUrl())
                        .orElse(product.getImages().get(0).getImageUrl());
              }

              return LowStockProductResponse.builder()
                  .productId(product.getId())
                  .productName(product.getName())
                  .productSlug(product.getSlug())
                  .productImage(primaryImage)
                  .currentStock(product.getStock())
                  .categoryName(
                      product.getCategory() != null ? product.getCategory().getName() : null)
                  .build();
            })
        .collect(Collectors.toList());
  }

  /** Get order status distribution - OPTIMIZED: uses single query instead of 5 separate queries. */
  public List<OrderStatusDistributionResponse> getOrderStatusDistribution() {
    Map<OrderStatus, Long> statusCounts = getOrderStatusCounts();
    List<OrderStatusDistributionResponse> distribution = new ArrayList<>();

    distribution.add(
        OrderStatusDistributionResponse.builder()
            .status("PENDING")
            .count(statusCounts.getOrDefault(OrderStatus.PENDING, 0L))
            .label("Chờ xử lý")
            .build());
    distribution.add(
        OrderStatusDistributionResponse.builder()
            .status("CONFIRMED")
            .count(statusCounts.getOrDefault(OrderStatus.CONFIRMED, 0L))
            .label("Đã xác nhận")
            .build());
    distribution.add(
        OrderStatusDistributionResponse.builder()
            .status("SHIPPED")
            .count(statusCounts.getOrDefault(OrderStatus.SHIPPED, 0L))
            .label("Đã giao hàng")
            .build());
    distribution.add(
        OrderStatusDistributionResponse.builder()
            .status("DELIVERED")
            .count(statusCounts.getOrDefault(OrderStatus.DELIVERED, 0L))
            .label("Đã nhận hàng")
            .build());
    distribution.add(
        OrderStatusDistributionResponse.builder()
            .status("CANCELLED")
            .count(statusCounts.getOrDefault(OrderStatus.CANCELLED, 0L))
            .label("Đã hủy")
            .build());

    return distribution;
  }

  public List<CategorySalesResponse> getCategorySales() {
    List<Object[]> results = orderRepository.getSalesByCategory();

    return results.stream()
        .map(
            result ->
                CategorySalesResponse.builder()
                    .categoryId(((Number) result[0]).longValue())
                    .categoryName((String) result[1])
                    .categorySlug((String) result[2])
                    .revenue((BigDecimal) result[3])
                    .orderCount(((Number) result[4]).longValue())
                    .productCount(((Number) result[5]).longValue())
                    .build())
        .collect(Collectors.toList());
  }

  public List<CustomerGrowthResponse> getCustomerGrowth(String period, int days) {
    LocalDate startDate = LocalDate.now().minusDays(days);

    List<Object[]> results;
    switch (period) {
      case "daily":
        results = userRepository.getCustomerGrowthByPeriodDaily(startDate);
        break;
      case "weekly":
        results = userRepository.getCustomerGrowthByPeriodWeekly(startDate);
        break;
      case "monthly":
        results = userRepository.getCustomerGrowthByPeriodMonthly(startDate);
        break;
      default:
        results = userRepository.getCustomerGrowthByPeriodDaily(startDate);
    }

    // Calculate cumulative totalUsers
    List<CustomerGrowthResponse> responses = new ArrayList<>();
    long cumulativeTotal = 0;
    for (Object[] result : results) {
      long newUsers = ((Number) result[1]).longValue();
      cumulativeTotal += newUsers;
      responses.add(
          CustomerGrowthResponse.builder()
              .period((String) result[0])
              .newUsers(newUsers)
              .totalUsers(cumulativeTotal)
              .build());
    }
    return responses;
  }

  private String getDateFormatByPeriod(String period) {
    // PostgreSQL date format patterns
    return switch (period) {
      case "daily" -> "YYYY-MM-DD";
      case "weekly" -> "IYYY-IW"; // ISO week
      case "monthly" -> "YYYY-MM";
      default -> "YYYY-MM-DD";
    };
  }
}
