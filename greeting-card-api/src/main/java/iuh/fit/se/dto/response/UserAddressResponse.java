package iuh.fit.se.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressResponse {
  private Long id;
  private String recipientName;
  private String phone;
  private String addressLine1;
  private String addressLine2;
  private String city;
  private String district;
  private String ward;
  private String postalCode;
  private Boolean isDefault;
}
