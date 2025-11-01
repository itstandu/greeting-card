package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho Email Verification request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyEmailRequest {
  @NotBlank(message = "Token xác thực không được để trống")
  private String token;
}
