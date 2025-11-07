package iuh.fit.se.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
  private Long totalUsers;
  private Long totalOrders;
  private BigDecimal totalRevenue;
  private Long totalProducts;

  // Today's metrics
  private Long todayOrders;
  private BigDecimal todayRevenue;

  // Order status counts
  private Long pendingOrders;
  private Long confirmedOrders;
  private Long shippedOrders;
  private Long deliveredOrders;
  private Long cancelledOrders;

  // Additional metrics
  private Long activeProducts;
  private Long lowStockProducts;
  private BigDecimal averageOrderValue;
}
