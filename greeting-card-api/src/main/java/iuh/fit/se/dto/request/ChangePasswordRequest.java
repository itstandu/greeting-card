package iuh.fit.se.dto.request;

import iuh.fit.se.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho Change Password request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
  @NotBlank(message = "Mật khẩu cũ không được để trống")
  private String oldPassword;

  @NotBlank(message = "Mật khẩu mới không được để trống")
  @ValidPassword
  private String newPassword;
}
