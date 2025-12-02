package iuh.fit.se.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreateOrderRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.OrderStatusHistoryResponse;
import iuh.fit.se.service.OrderService;
import iuh.fit.se.service.UserService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
  private final OrderService orderService;
  private final UserService userService;

  @PostMapping
  public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody CreateOrderRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    OrderResponse order = orderService.createOrder(userId, request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Đặt hàng thành công. Email xác nhận đã được gửi.", order));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<OrderResponse.Simple>>> getUserOrders(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "orderDate") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Long userId = userService.getUserIdByEmail(userDetails.getUsername());

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<OrderResponse.Simple> orderPage = orderService.getUserOrders(userId, pageable);

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Lấy danh sách đơn hàng thành công",
            orderPage.getContent(),
            PaginationUtil.createPaginationResponse(orderPage)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    OrderResponse order = orderService.getOrderDetail(userId, id);
    return ResponseEntity.ok(ApiResponse.success(order));
  }

  @GetMapping("/{id}/status-history")
  public ResponseEntity<ApiResponse<List<OrderStatusHistoryResponse>>> getOrderStatusHistory(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    List<OrderStatusHistoryResponse> history = orderService.getOrderStatusHistory(userId, id);
    return ResponseEntity.ok(ApiResponse.success(history));
  }
}
