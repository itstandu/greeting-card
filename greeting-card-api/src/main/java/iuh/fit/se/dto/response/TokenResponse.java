package iuh.fit.se.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
  // DTO đại diện cho access token mới và ghi chú refresh token giữ trong cookie an toàn.
  private String accessToken;
  private String tokenType;
  private Long expiresIn;
}
