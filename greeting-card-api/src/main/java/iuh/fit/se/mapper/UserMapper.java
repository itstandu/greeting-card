package iuh.fit.se.mapper;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.entity.User;

// Mapper chuyển đổi giữa User entity và DTO
@Component
public class UserMapper {
  public UserResponse toResponse(User user) {
    if (user == null) {
      return null;
    }

    return UserResponse.builder()
        .id(user.getId())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .phone(user.getPhone())
        .role(user.getRole().name())
        .emailVerified(user.getEmailVerified())
        .avatarUrl(user.getAvatarUrl())
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }
}
