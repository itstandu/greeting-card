package iuh.fit.se.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import iuh.fit.se.entity.enumeration.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho thông báo hệ thống
@Entity
@Table(
    name = "notifications",
    indexes = {
      @Index(name = "idx_notifications_user_id", columnList = "user_id"),
      @Index(name = "idx_notifications_is_read", columnList = "is_read"),
      @Index(name = "idx_notifications_type", columnList = "type"),
      @Index(name = "idx_notifications_created_at", columnList = "created_at")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private NotificationType type;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Column(name = "link_url", length = 500)
  private String linkUrl;

  @Column(name = "is_read", nullable = false)
  private Boolean isRead = false;

  @Column(name = "read_at")
  private LocalDateTime readAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;
}
