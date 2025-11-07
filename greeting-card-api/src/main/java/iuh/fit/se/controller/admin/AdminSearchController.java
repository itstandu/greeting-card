package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.ProductResponse;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.service.AdminUserService;
import iuh.fit.se.service.OrderService;
import iuh.fit.se.service.ProductService;
import iuh.fit.se.util.PaginationUtil;
import lombok.RequiredArgsConstructor;

/**
 * Controller cho các API tìm kiếm admin. Các endpoint này tuân theo spec: GET
 * /api/admin/search/products, /api/admin/search/users, /api/admin/search/orders
 */
@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSearchController {
  private final ProductService productService;
  private final AdminUserService adminUserService;
  private final OrderService orderService;

  /** Tìm kiếm sản phẩm GET /api/admin/search/products?q=keyword&categoryId=1 */
  @GetMapping("/products")
  public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) Long categoryId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<ProductResponse> products =
        productService.getProducts(categoryId, null, null, q, pageable);

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Tìm kiếm sản phẩm thành công",
            products.getContent(),
            PaginationUtil.createPaginationResponse(products)));
  }

  /** Tìm kiếm người dùng GET /api/admin/search/users?q=keyword */
  @GetMapping("/users")
  public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) UserRole role,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size) {

    var userPage = adminUserService.getUsers(q, role, page, size);

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Tìm kiếm người dùng thành công",
            userPage.getContent(),
            PaginationUtil.createPaginationResponse(userPage)));
  }

  /** Tìm kiếm đơn hàng GET /api/admin/search/orders?q=keyword */
  @GetMapping("/orders")
  public ResponseEntity<ApiResponse<List<OrderResponse.Simple>>> searchOrders(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "orderDate") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Page<OrderResponse.Simple> orders;
    if (q != null && !q.isEmpty()) {
      orders = orderService.searchOrders(q, pageable);
    } else {
      orders = orderService.getAllOrders(pageable);
    }

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Tìm kiếm đơn hàng thành công",
            orders.getContent(),
            PaginationUtil.createPaginationResponse(orders)));
  }
}
