package iuh.fit.se.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import iuh.fit.se.dto.request.*;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.LoginResponse;
import iuh.fit.se.dto.response.TokenResponse;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.service.AuthService;
import iuh.fit.se.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;
  private final UserService userService;

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<UserResponse>> register(
      @Valid @RequestBody RegisterRequest request) {
    UserResponse user = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            ApiResponse.success(
                "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.", user));
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<LoginResponse>> login(
      @Valid @RequestBody LoginRequest request, HttpServletResponse response) {
    LoginResponse loginResponse = authService.login(request, response);
    return ResponseEntity.ok(ApiResponse.success(loginResponse));
  }

  @GetMapping("/verify-email")
  public ResponseEntity<ApiResponse<Void>> verifyEmail(
      @RequestParam(required = false, defaultValue = "") String token) {
    if (token == null || token.trim().isEmpty()) {
      throw new iuh.fit.se.exception.ValidationException("Token xác thực không được để trống");
    }
    authService.verifyEmail(token);
    return ResponseEntity.ok(ApiResponse.success("Email đã được xác thực thành công", null));
  }

  @PostMapping("/resend-verification")
  public ResponseEntity<ApiResponse<Void>> resendVerification(
      @Valid @RequestBody ResendVerificationRequest request) {
    authService.resendVerificationEmail(request);
    return ResponseEntity.ok(
        ApiResponse.success("Đã gửi lại email xác thực. Vui lòng kiểm tra email.", null));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(
      HttpServletRequest request, HttpServletResponse response) {
    TokenResponse tokenResponse = authService.refreshToken(request, response);
    return ResponseEntity.ok(ApiResponse.success("Đã làm mới token thành công", tokenResponse));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      HttpServletRequest request, HttpServletResponse response) {
    authService.logout(request, response);
    return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
  }

  @PostMapping("/logout-all")
  public ResponseEntity<ApiResponse<Void>> logoutAll(HttpServletResponse response) {
    UserResponse currentUser = userService.getCurrentUser();
    authService.logoutAll(currentUser.getId(), response);
    return ResponseEntity.ok(ApiResponse.success("Đã đăng xuất tất cả thiết bị", null));
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
    UserResponse user = userService.getCurrentUser();
    return ResponseEntity.ok(ApiResponse.success(user));
  }
}
