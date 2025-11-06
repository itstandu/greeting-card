package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodResponse {
  private Long id;
  private String name;
  private String code;
  private String description;
  private Boolean isActive;
  private Integer displayOrder;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Constructor for backward compatibility
  public PaymentMethodResponse(Long id, String name, String code, String description) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.description = description;
    this.isActive = true;
    this.displayOrder = 0;
  }
}
