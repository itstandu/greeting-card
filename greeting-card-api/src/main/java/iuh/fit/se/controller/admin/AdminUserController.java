package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import iuh.fit.se.dto.request.admin.AdminUpdateUserRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PaginationResponse;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Controller cho các API quản trị người dùng
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
  private final AdminUserService adminUserService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) UserRole role) {
    var userPage = adminUserService.getUsers(search, role, page, size);
    PaginationResponse pagination =
        PaginationResponse.builder()
            .page(userPage.getNumber() + 1)
            .size(userPage.getSize())
            .total(userPage.getTotalElements())
            .totalPages(userPage.getTotalPages())
            .build();
    return ResponseEntity.ok(ApiResponse.successWithPagination(userPage.getContent(), pagination));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<UserResponse>> getUserDetail(@PathVariable Long id) {
    UserResponse user = adminUserService.getUserDetail(id);
    return ResponseEntity.ok(ApiResponse.success(user));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<UserResponse>> updateUser(
      @PathVariable Long id, @Valid @RequestBody AdminUpdateUserRequest request) {
    UserResponse updated = adminUserService.updateUser(id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", updated));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
    adminUserService.deleteUser(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công", null));
  }
}
