package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho User response
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
  private Long id;
  private String email;
  private String fullName;
  private String phone;
  private String role;
  private Boolean emailVerified;
  private String avatarUrl;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
