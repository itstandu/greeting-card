package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAddressRequest {
  @NotBlank(message = "Tên người nhận không được để trống")
  @Size(max = 255, message = "Tên người nhận không được vượt quá 255 ký tự")
  private String recipientName;

  @NotBlank(message = "Số điện thoại không được để trống")
  @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
  private String phone;

  @NotBlank(message = "Địa chỉ không được để trống")
  @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
  private String addressLine1;

  @Size(max = 255, message = "Địa chỉ bổ sung không được vượt quá 255 ký tự")
  private String addressLine2;

  @NotBlank(message = "Thành phố/Tỉnh không được để trống")
  @Size(max = 100, message = "Thành phố/Tỉnh không được vượt quá 100 ký tự")
  private String city;

  @Size(max = 100, message = "Quận/Huyện không được vượt quá 100 ký tự")
  private String district;

  @Size(max = 100, message = "Phường/Xã không được vượt quá 100 ký tự")
  private String ward;

  @Size(max = 20, message = "Mã bưu điện không được vượt quá 20 ký tự")
  private String postalCode;

  private Boolean isDefault = false;
}
