package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import iuh.fit.se.entity.enumeration.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
  private Long id;
  private NotificationType type;
  private String title;
  private String message;
  private String linkUrl;
  private Boolean isRead;
  private LocalDateTime readAt;
  private LocalDateTime createdAt;
}
