package iuh.fit.se.dto.request.admin;

import iuh.fit.se.entity.enumeration.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

// DTO cho Admin cập nhật thông tin và phân quyền User
@Data
public class AdminUpdateUserRequest {
  @NotBlank(message = "Họ tên không được để trống")
  @Size(max = 255, message = "Họ tên không được vượt quá 255 ký tự")
  private String fullName;

  @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
  private String phone;

  @NotNull(message = "Vai trò không được để trống")
  private UserRole role;
}
