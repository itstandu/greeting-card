package iuh.fit.se.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.NotificationResponse;
import iuh.fit.se.dto.response.UnreadCountResponse;
import iuh.fit.se.entity.enumeration.NotificationType;
import iuh.fit.se.service.NotificationService;
import iuh.fit.se.service.UserService;
import iuh.fit.se.util.PaginationUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
  private final NotificationService notificationService;
  private final UserService userService;

  /** Lấy danh sách notifications của user */
  @GetMapping
  public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) Boolean isRead,
      @RequestParam(required = false) NotificationType type) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    Page<NotificationResponse> notificationsPage =
        notificationService.getUserNotifications(userId, isRead, type, page, size);
    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            "Lấy danh sách thông báo thành công",
            notificationsPage.getContent(),
            PaginationUtil.createPaginationResponse(notificationsPage)));
  }

  /** Đếm số notifications chưa đọc */
  @GetMapping("/unread-count")
  public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    UnreadCountResponse count = notificationService.getUnreadCount(userId);
    return ResponseEntity.ok(ApiResponse.success("Lấy số thông báo chưa đọc thành công", count));
  }

  /** Đánh dấu notification là đã đọc */
  @PutMapping("/{id}/read")
  public ResponseEntity<ApiResponse<Void>> markAsRead(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    notificationService.markAsRead(userId, id);
    return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu thông báo đã đọc", null));
  }

  /** Đánh dấu tất cả notifications là đã đọc */
  @PutMapping("/read-all")
  public ResponseEntity<ApiResponse<Void>> markAllAsRead(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    notificationService.markAllAsRead(userId);
    return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả thông báo đã đọc", null));
  }
}
