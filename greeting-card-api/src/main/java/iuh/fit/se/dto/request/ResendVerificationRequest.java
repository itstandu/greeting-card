package iuh.fit.se.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho Resend Verification Email request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResendVerificationRequest {
  @NotBlank(message = "Email không được để trống")
  @Email(message = "Email không hợp lệ")
  private String email;
}
