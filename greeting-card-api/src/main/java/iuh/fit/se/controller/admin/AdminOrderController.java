package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.UpdateOrderItemQuantityRequest;
import iuh.fit.se.dto.request.UpdateOrderStatusRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.OrderStatusHistoryResponse;
import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.service.OrderService;
import iuh.fit.se.service.UserService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
  private final OrderService orderService;
  private final UserService userService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<OrderResponse.Simple>>> getAllOrders(
      @RequestParam(required = false) OrderStatus status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "orderDate") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<OrderResponse.Simple> orderPage;
    if (status != null) {
      orderPage = orderService.getOrdersByStatus(status, pageable);
    } else {
      orderPage = orderService.getAllOrders(pageable);
    }

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Lấy danh sách đơn hàng thành công",
            orderPage.getContent(),
            PaginationUtil.createPaginationResponse(orderPage)));
  }

  @GetMapping("/search")
  public ResponseEntity<ApiResponse<List<OrderResponse.Simple>>> searchOrders(
      @RequestParam String keyword,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "orderDate") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<OrderResponse.Simple> orderPage = orderService.searchOrders(keyword, pageable);

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Tìm kiếm đơn hàng thành công",
            orderPage.getContent(),
            PaginationUtil.createPaginationResponse(orderPage)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(@PathVariable Long id) {
    OrderResponse order = orderService.getOrderDetailAdmin(id);
    return ResponseEntity.ok(ApiResponse.success(order));
  }

  @GetMapping("/{id}/status-history")
  public ResponseEntity<ApiResponse<List<OrderStatusHistoryResponse>>> getOrderStatusHistory(
      @PathVariable Long id) {
    List<OrderStatusHistoryResponse> history = orderService.getOrderStatusHistoryAdmin(id);
    return ResponseEntity.ok(ApiResponse.success(history));
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
      @PathVariable Long id,
      @Valid @RequestBody UpdateOrderStatusRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    Long adminUserId = userService.getUserIdByEmail(userDetails.getUsername());
    OrderResponse order = orderService.updateOrderStatus(id, request, adminUserId);
    return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái đơn hàng", order));
  }

  @PutMapping("/{orderId}/items/{itemId}")
  public ResponseEntity<ApiResponse<OrderResponse>> updateOrderItemQuantity(
      @PathVariable Long orderId,
      @PathVariable Long itemId,
      @Valid @RequestBody UpdateOrderItemQuantityRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    Long adminUserId = userService.getUserIdByEmail(userDetails.getUsername());
    OrderResponse order =
        orderService.updateOrderItemQuantity(orderId, itemId, request.getQuantity(), adminUserId);
    return ResponseEntity.ok(ApiResponse.success("Đã cập nhật số lượng sản phẩm", order));
  }
}
