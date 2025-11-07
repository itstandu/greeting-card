package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.BestSellingProductResponse;
import iuh.fit.se.dto.response.CategorySalesResponse;
import iuh.fit.se.dto.response.CustomerGrowthResponse;
import iuh.fit.se.dto.response.DashboardStatsResponse;
import iuh.fit.se.dto.response.LowStockProductResponse;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.OrderStatusDistributionResponse;
import iuh.fit.se.dto.response.RevenueSummaryResponse;
import iuh.fit.se.service.DashboardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
  private final DashboardService dashboardService;

  @GetMapping("/stats")
  public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
    DashboardStatsResponse stats = dashboardService.getDashboardStats();
    return ResponseEntity.ok(ApiResponse.success("Lấy thống kê dashboard thành công", stats));
  }

  @GetMapping("/revenue-summary")
  public ResponseEntity<ApiResponse<List<RevenueSummaryResponse>>> getRevenueSummary(
      @RequestParam(defaultValue = "daily") String period,
      @RequestParam(defaultValue = "30") int days) {
    List<RevenueSummaryResponse> summary = dashboardService.getRevenueSummary(period, days);
    return ResponseEntity.ok(ApiResponse.success("Lấy tóm tắt doanh thu thành công", summary));
  }

  @GetMapping("/latest-orders")
  public ResponseEntity<ApiResponse<List<OrderResponse.Simple>>> getLatestOrders(
      @RequestParam(defaultValue = "10") int limit) {
    List<OrderResponse.Simple> orders = dashboardService.getLatestOrders(limit);
    return ResponseEntity.ok(ApiResponse.success("Lấy đơn hàng mới nhất thành công", orders));
  }

  @GetMapping("/best-selling-products")
  public ResponseEntity<ApiResponse<List<BestSellingProductResponse>>> getBestSellingProducts(
      @RequestParam(defaultValue = "10") int limit) {
    List<BestSellingProductResponse> products = dashboardService.getBestSellingProducts(limit);
    return ResponseEntity.ok(ApiResponse.success("Lấy sản phẩm bán chạy thành công", products));
  }

  @GetMapping("/low-stock-products")
  public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getLowStockProducts(
      @RequestParam(defaultValue = "10") int threshold,
      @RequestParam(defaultValue = "10") int limit) {
    List<LowStockProductResponse> products = dashboardService.getLowStockProducts(threshold, limit);
    return ResponseEntity.ok(ApiResponse.success("Lấy sản phẩm sắp hết hàng thành công", products));
  }

  @GetMapping("/order-status-distribution")
  public ResponseEntity<ApiResponse<List<OrderStatusDistributionResponse>>>
      getOrderStatusDistribution() {
    List<OrderStatusDistributionResponse> distribution =
        dashboardService.getOrderStatusDistribution();
    return ResponseEntity.ok(
        ApiResponse.success("Lấy phân bố trạng thái đơn hàng thành công", distribution));
  }

  @GetMapping("/category-sales")
  public ResponseEntity<ApiResponse<List<CategorySalesResponse>>> getCategorySales() {
    List<CategorySalesResponse> sales = dashboardService.getCategorySales();
    return ResponseEntity.ok(ApiResponse.success("Lấy doanh thu theo danh mục thành công", sales));
  }

  @GetMapping("/customer-growth")
  public ResponseEntity<ApiResponse<List<CustomerGrowthResponse>>> getCustomerGrowth(
      @RequestParam(defaultValue = "daily") String period,
      @RequestParam(defaultValue = "30") int days) {
    List<CustomerGrowthResponse> growth = dashboardService.getCustomerGrowth(period, days);
    return ResponseEntity.ok(ApiResponse.success("Lấy tăng trưởng khách hàng thành công", growth));
  }
}
