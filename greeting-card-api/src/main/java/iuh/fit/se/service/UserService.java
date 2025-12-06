package iuh.fit.se.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.ChangePasswordRequest;
import iuh.fit.se.dto.request.UpdateUserRequest;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.entity.User;
import iuh.fit.se.exception.AuthenticationException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.exception.ValidationException;
import iuh.fit.se.mapper.UserMapper;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;

// Service xử lý các thao tác liên quan đến User
@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserMapper userMapper;

  // Lấy thông tin user hiện tại
  public UserResponse getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    // Kiểm tra authentication
    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      throw new AuthenticationException("Chưa đăng nhập", ErrorCode.UNAUTHORIZED);
    }

    String email = authentication.getName();

    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

    return userMapper.toResponse(user);
  }

  // Lấy user ID theo email
  public Long getUserIdByEmail(String email) {
    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    return user.getId();
  }

  // Lấy thông tin user theo ID
  @SuppressWarnings("null")
  public UserResponse getUserById(Long id) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

    return userMapper.toResponse(user);
  }

  // Cập nhật thông tin user
  @Transactional
  public UserResponse updateUser(UpdateUserRequest request) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    // Kiểm tra authentication
    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      throw new AuthenticationException("Chưa đăng nhập", ErrorCode.UNAUTHORIZED);
    }

    String email = authentication.getName();

    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

    user.setFullName(request.getFullName());
    if (request.getPhone() != null) {
      user.setPhone(request.getPhone());
    }
    if (request.getAvatarUrl() != null) {
      user.setAvatarUrl(request.getAvatarUrl());
    }

    user = userRepository.save(user);

    return userMapper.toResponse(user);
  }

  // Đổi mật khẩu
  @Transactional
  public void changePassword(ChangePasswordRequest request) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    // Kiểm tra authentication
    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      throw new AuthenticationException("Chưa đăng nhập", ErrorCode.UNAUTHORIZED);
    }

    String email = authentication.getName();

    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

    // Kiểm tra mật khẩu cũ
    if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
      throw new ValidationException("Mật khẩu cũ không đúng");
    }

    // Cập nhật mật khẩu mới
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }
}
