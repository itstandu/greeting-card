package iuh.fit.se.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentMethodRequest {
  @NotBlank(message = "Tên phương thức thanh toán không được để trống")
  @Size(max = 100, message = "Tên không được quá 100 ký tự")
  private String name;

  @NotBlank(message = "Mã phương thức thanh toán không được để trống")
  @Size(max = 50, message = "Mã không được quá 50 ký tự")
  private String code;

  @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
  private String description;

  private Boolean isActive = true;

  private Integer displayOrder = 0;
}
