package iuh.fit.se.dto.request;

import iuh.fit.se.entity.enumeration.ContactStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateContactStatusRequest {
  @NotNull(message = "Trạng thái không được để trống")
  private ContactStatus status;
}
