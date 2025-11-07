package iuh.fit.se.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.admin.AdminUpdateUserRequest;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.exception.ValidationException;
import iuh.fit.se.mapper.UserMapper;
import iuh.fit.se.repository.OrderRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;

// Service cho các thao tác quản trị người dùng
@Service
@RequiredArgsConstructor
public class AdminUserService {
  private final UserRepository userRepository;
  private final OrderRepository orderRepository;
  private final UserMapper userMapper;

  // Lấy danh sách user với filter vai trò + từ khóa
  @Transactional(readOnly = true)
  public Page<UserResponse> getUsers(String keyword, UserRole role, int page, int size) {
    int safePage = Math.max(page - 1, 0);
    int safeSize = size <= 0 ? 10 : Math.min(size, 100);
    // Native query đã có ORDER BY trong query, không cần Sort trong Pageable
    Pageable pageable = PageRequest.of(safePage, safeSize);

    String normalizedKeyword =
        (keyword == null || keyword.trim().isEmpty()) ? null : keyword.trim().toLowerCase();
    String roleString = (role != null) ? role.name() : null;

    Page<User> userPage = userRepository.searchUsers(roleString, normalizedKeyword, pageable);

    return userPage.map(userMapper::toResponse);
  }

  // Lấy thông tin user chi tiết
  @Transactional(readOnly = true)
  public UserResponse getUserDetail(Long id) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    return userMapper.toResponse(user);
  }

  // Admin cập nhật thông tin và vai trò người dùng
  @Transactional(rollbackFor = Exception.class)
  public UserResponse updateUser(Long id, AdminUpdateUserRequest request) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

    // Validate và set fullName (required, not null)
    if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
      throw new ValidationException("Họ tên không được để trống");
    }
    String trimmedFullName = request.getFullName().trim();
    if (trimmedFullName.length() > 255) {
      throw new ValidationException("Họ tên không được vượt quá 255 ký tự");
    }
    user.setFullName(trimmedFullName);

    // Set phone (optional)
    if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
      String trimmedPhone = request.getPhone().trim();
      if (trimmedPhone.length() > 20) {
        throw new ValidationException("Số điện thoại không được vượt quá 20 ký tự");
      }
      user.setPhone(trimmedPhone);
    } else {
      user.setPhone(null);
    }

    // Set role (required)
    if (request.getRole() == null) {
      throw new ValidationException("Vai trò không được để trống");
    }
    user.setRole(request.getRole());

    User updated = userRepository.save(user);
    return userMapper.toResponse(updated);
  }

  // Admin xóa (soft delete) user nếu chưa phát sinh đơn hàng
  @Transactional
  public void deleteUser(Long id) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

    // Không cho xóa chính mình để tránh tự khóa tài khoản quản trị
    if (isCurrentUser(user.getEmail())) {
      throw new ValidationException("Không thể tự xóa tài khoản của chính bạn");
    }

    // Kiểm tra ràng buộc đơn hàng
    if (orderRepository.existsByUserId(user.getId())) {
      throw new ValidationException("Người dùng đã có đơn hàng, không thể xóa");
    }

    userRepository.delete(user); // Soft delete theo @SQLDelete
  }

  private boolean isCurrentUser(String email) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      return false;
    }
    return email.equalsIgnoreCase(authentication.getName());
  }
}
