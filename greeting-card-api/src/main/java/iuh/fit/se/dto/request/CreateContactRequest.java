package iuh.fit.se.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateContactRequest {
  @NotBlank(message = "Họ và tên không được để trống")
  @Size(min = 1, max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
  private String fullName;

  @NotBlank(message = "Email không được để trống")
  @Email(message = "Email không hợp lệ")
  @Size(max = 255)
  private String email;

  @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự")
  private String phone;

  @NotBlank(message = "Tiêu đề không được để trống")
  @Size(max = 255)
  private String subject;

  @NotBlank(message = "Chủ đề không được để trống")
  @Size(max = 50)
  private String category;

  @NotBlank(message = "Nội dung không được để trống")
  @Size(max = 5000, message = "Nội dung quá dài")
  private String message;
}
