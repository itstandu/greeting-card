package iuh.fit.se.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import iuh.fit.se.dto.request.ChangePasswordRequest;
import iuh.fit.se.dto.request.UpdateUserRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Controller xử lý các thao tác liên quan đến User
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;

  // Lấy thông tin user theo ID
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
    UserResponse user = userService.getUserById(id);
    return ResponseEntity.ok(ApiResponse.success(user));
  }

  // Cập nhật thông tin user
  @PutMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> updateUser(
      @Valid @RequestBody UpdateUserRequest request) {
    UserResponse user = userService.updateUser(request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", user));
  }

  // Đổi mật khẩu
  @PutMapping("/me/password")
  public ResponseEntity<ApiResponse<Void>> changePassword(
      @Valid @RequestBody ChangePasswordRequest request) {
    userService.changePassword(request);
    return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
  }
}
