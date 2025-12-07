package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.ContactStatus;
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
public class ContactResponse {
  private Long id;
  private String fullName;
  private String email;
  private String phone;
  private String subject;
  private String category;
  private String message;
  private ContactStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
