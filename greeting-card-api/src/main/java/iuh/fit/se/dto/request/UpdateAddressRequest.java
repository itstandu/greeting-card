package iuh.fit.se.dto.request;

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
public class UpdateAddressRequest {
  @Size(max = 255, message = "Tên người nhận không được vượt quá 255 ký tự")
  private String recipientName;

  @Pattern(
      regexp = "^(0|\\+84)[1-9][0-9]{8,9}$",
      message =
          "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (ví dụ: 0912345678 hoặc +84912345678)")
  private String phone;

  @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
  private String addressLine1;

  @Size(max = 255, message = "Địa chỉ bổ sung không được vượt quá 255 ký tự")
  private String addressLine2;

  @Size(max = 100, message = "Thành phố/Tỉnh không được vượt quá 100 ký tự")
  private String city;

  @Size(max = 100, message = "Quận/Huyện không được vượt quá 100 ký tự")
  private String district;

  @Size(max = 100, message = "Phường/Xã không được vượt quá 100 ký tự")
  private String ward;

  @Pattern(regexp = "^[0-9]{5,6}$|^$", message = "Mã bưu điện phải là 5 hoặc 6 chữ số")
  @Size(max = 20, message = "Mã bưu điện không được vượt quá 20 ký tự")
  private String postalCode;
}
