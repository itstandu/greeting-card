package iuh.fit.se.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho Login response
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
  private UserResponse user;
  private String message;
  private String accessToken;
  private Long expiresIn;
}
