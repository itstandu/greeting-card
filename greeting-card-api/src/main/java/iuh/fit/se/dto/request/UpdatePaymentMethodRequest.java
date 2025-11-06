package iuh.fit.se.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentMethodRequest {
  @Size(max = 100, message = "Tên không được quá 100 ký tự")
  private String name;

  @Size(max = 50, message = "Mã không được quá 50 ký tự")
  private String code;

  @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
  private String description;

  private Boolean isActive;

  private Integer displayOrder;
}
