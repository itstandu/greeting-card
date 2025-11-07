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
public class RejectReviewRequest {
  @NotBlank(message = "Lý do từ chối không được để trống")
  @Size(max = 500, message = "Lý do không được quá 500 ký tự")
  private String reason;
}
