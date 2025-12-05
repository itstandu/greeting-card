package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho Update User Profile request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
  @NotBlank(message = "Họ tên không được để trống")
  @Size(max = 255, message = "Họ tên không được vượt quá 255 ký tự")
  private String fullName;

  @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
  private String phone;

  @Size(max = 500, message = "URL avatar không được vượt quá 500 ký tự")
  private String avatarUrl;
}
