package iuh.fit.se.dto.request;

import iuh.fit.se.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho Register request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
  @NotBlank(message = "Email không được để trống")
  @Email(message = "Email không hợp lệ")
  private String email;

  @NotBlank(message = "Mật khẩu không được để trống")
  @ValidPassword
  private String password;

  @NotBlank(message = "Họ tên không được để trống")
  @Size(
      min = 2,
      max = 255,
      message = "Họ tên phải có ít nhất 2 ký tự và không được vượt quá 255 ký tự")
  private String fullName;

  @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
  private String phone;
}
