package iuh.fit.se.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.response.NotificationResponse;
import iuh.fit.se.dto.response.UnreadCountResponse;
import iuh.fit.se.entity.Notification;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.enumeration.NotificationType;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.NotificationMapper;
import iuh.fit.se.repository.NotificationRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final NotificationMapper notificationMapper;

  /** Tạo thông báo mới */
  @Transactional
  @SuppressWarnings("null")
  public NotificationResponse createNotification(
      Long userId, NotificationType type, String title, String message, String linkUrl) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

    Notification notification = new Notification();
    notification.setUser(user);
    notification.setType(type);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setLinkUrl(linkUrl);
    notification.setIsRead(false);

    notification = notificationRepository.save(notification);
    log.info("Created notification {} for user {}", notification.getId(), userId);

    return notificationMapper.toNotificationResponse(notification);
  }

  /** Lấy danh sách notifications của user với filters */
  @Transactional(readOnly = true)
  public Page<NotificationResponse> getUserNotifications(
      Long userId, Boolean isRead, NotificationType type, int page, int size) {
    Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

    Page<Notification> notifications =
        notificationRepository.findByUserIdWithFilters(userId, isRead, type, pageable);

    return notifications.map(notificationMapper::toNotificationResponse);
  }

  /** Đánh dấu notification là đã đọc */
  @Transactional
  public void markAsRead(Long userId, Long notificationId) {
    int updated = notificationRepository.markAsRead(notificationId, userId);
    if (updated == 0) {
      throw new ResourceNotFoundException("Thông báo không tồn tại hoặc không thuộc về user này");
    }
    log.info("Marked notification {} as read for user {}", notificationId, userId);
  }

  /** Đánh dấu tất cả notifications là đã đọc */
  @Transactional
  public void markAllAsRead(Long userId) {
    int updated = notificationRepository.markAllAsRead(userId);
    log.info("Marked {} notifications as read for user {}", updated, userId);
  }

  /** Đếm số notifications chưa đọc */
  @Transactional(readOnly = true)
  public UnreadCountResponse getUnreadCount(Long userId) {
    Long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
    return UnreadCountResponse.builder().count(count).build();
  }

  /** Tạo notification khi order status thay đổi */
  @Transactional
  public void notifyOrderStatusChange(Long userId, String orderNumber, String status) {
    String title = "Trạng thái đơn hàng thay đổi";
    String message =
        String.format("Đơn hàng %s đã chuyển sang trạng thái: %s", orderNumber, status);
    String linkUrl = "/orders";

    createNotification(userId, NotificationType.ORDER, title, message, linkUrl);
  }

  /** Tạo notification khi payment thành công */
  @Transactional
  public void notifyPaymentSuccess(Long userId, String orderNumber, String amount) {
    String title = "Thanh toán thành công";
    String message =
        String.format(
            "Đơn hàng %s đã được thanh toán thành công. Số tiền: %s", orderNumber, amount);
    String linkUrl = "/orders";

    createNotification(userId, NotificationType.ORDER, title, message, linkUrl);
  }

  /** Tạo notification khi payment thất bại */
  @Transactional
  public void notifyPaymentFailure(Long userId, String orderNumber, String reason) {
    String title = "Thanh toán thất bại";
    String message =
        String.format("Thanh toán cho đơn hàng %s thất bại. Lý do: %s", orderNumber, reason);
    String linkUrl = "/orders";

    createNotification(userId, NotificationType.ORDER, title, message, linkUrl);
  }

  /** Gửi notification cho tất cả admin khi có đơn hàng mới */
  @Transactional
  public void notifyAdminsNewOrder(String orderNumber, String customerName, String totalAmount) {
    List<User> admins = userRepository.findByRole(UserRole.ADMIN);

    if (admins.isEmpty()) {
      log.warn("No admin users found to notify about new order {}", orderNumber);
      return;
    }

    String title = "Đơn hàng mới";
    String message =
        String.format(
            "Khách hàng %s đã đặt đơn hàng %s với tổng tiền %s VNĐ",
            customerName, orderNumber, totalAmount);
    String linkUrl = "/admin/orders";

    for (User admin : admins) {
      createNotification(admin.getId(), NotificationType.ORDER, title, message, linkUrl);
    }

    log.info("Sent new order notification to {} admins for order {}", admins.size(), orderNumber);
  }
}
