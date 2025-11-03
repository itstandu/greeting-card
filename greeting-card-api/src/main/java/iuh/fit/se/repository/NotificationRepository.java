package iuh.fit.se.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Notification;
import iuh.fit.se.entity.enumeration.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
  Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  Page<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(
      Long userId, Boolean isRead, Pageable pageable);

  Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(
      Long userId, NotificationType type, Pageable pageable);

  @Query(
      "SELECT n FROM Notification n WHERE n.user.id = :userId "
          + "AND (:isRead IS NULL OR n.isRead = :isRead) "
          + "AND (:type IS NULL OR n.type = :type) "
          + "ORDER BY n.createdAt DESC")
  Page<Notification> findByUserIdWithFilters(
      @Param("userId") Long userId,
      @Param("isRead") Boolean isRead,
      @Param("type") NotificationType type,
      Pageable pageable);

  Long countByUserIdAndIsReadFalse(Long userId);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id AND n.user.id = :userId")
  int markAsRead(@Param("id") Long id, @Param("userId") Long userId);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.isRead = false")
  int markAllAsRead(@Param("userId") Long userId);
}
