package iuh.fit.se.mapper;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.NotificationResponse;
import iuh.fit.se.entity.Notification;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationMapper {
  public NotificationResponse toNotificationResponse(Notification notification) {
    if (notification == null) {
      return null;
    }

    return NotificationResponse.builder()
        .id(notification.getId())
        .type(notification.getType())
        .title(notification.getTitle())
        .message(notification.getMessage())
        .linkUrl(notification.getLinkUrl())
        .isRead(notification.getIsRead())
        .readAt(notification.getReadAt())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
