package iuh.fit.se.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.OrderItem;
import iuh.fit.se.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
  private final JavaMailSender mailSender;

  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
  private static final NumberFormat CURRENCY_FORMATTER =
      NumberFormat.getCurrencyInstance(Locale.of("vi", "VN"));

  @Async
  @SuppressWarnings("null")
  public void sendOrderConfirmationEmail(User user, Order order) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(user.getEmail());
      helper.setSubject("Xác nhận đơn hàng #" + order.getOrderNumber() + " - Greeting Card Shop");
      helper.setText(buildOrderConfirmationHtml(user, order), true);

      mailSender.send(message);
      log.info(
          "Sent order confirmation email to {} for order {}",
          user.getEmail(),
          order.getOrderNumber());
    } catch (MessagingException e) {
      log.error(
          "Failed to send order confirmation email to {}: {}", user.getEmail(), e.getMessage());
    }
  }

  @Async
  @SuppressWarnings("null")
  public void sendOrderStatusUpdateEmail(User user, Order order, String newStatus, String notes) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(user.getEmail());
      helper.setSubject(
          "Cập nhật trạng thái đơn hàng #" + order.getOrderNumber() + " - Greeting Card Shop");
      helper.setText(buildOrderStatusUpdateHtml(user, order, newStatus, notes), true);

      mailSender.send(message);
      log.info(
          "Sent order status update email to {} for order {}",
          user.getEmail(),
          order.getOrderNumber());
    } catch (MessagingException e) {
      log.error(
          "Failed to send order status update email to {}: {}", user.getEmail(), e.getMessage());
    }
  }

  private String buildOrderConfirmationHtml(User user, Order order) {
    StringBuilder itemsHtml = new StringBuilder();
    for (OrderItem item : order.getOrderItems()) {
      itemsHtml.append(
          String.format(
              """
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">%s</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">%d</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">%s</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">%s</td>
              </tr>
              """,
              item.getProduct().getName(),
              item.getQuantity(),
              formatCurrency(item.getPrice()),
              formatCurrency(item.getSubtotal())));
    }

    return String.format(
        """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; }
            .order-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
            .table th { background: #f5f5f5; padding: 12px; text-align: left; }
            .total-row { font-weight: bold; font-size: 1.1em; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Đặt hàng thành công!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>%s</strong>,</p>
              <p>Cảm ơn bạn đã đặt hàng tại <strong>Greeting Card Shop</strong>! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>

              <div class="order-info">
                <h3>📦 Thông tin đơn hàng</h3>
                <p><strong>Mã đơn hàng:</strong> %s</p>
                <p><strong>Ngày đặt:</strong> %s</p>
                <p><strong>Trạng thái:</strong> Đang xử lý</p>
              </div>

              <h3>📋 Chi tiết sản phẩm</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: right;">Đơn giá</th>
                    <th style="text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  %s
                </tbody>
              </table>

              <div class="order-info">
                <table style="width: 100%%;">
                  <tr>
                    <td>Tạm tính:</td>
                    <td style="text-align: right;">%s</td>
                  </tr>
                  <tr>
                    <td>Giảm giá:</td>
                    <td style="text-align: right; color: #e53e3e;">-%s</td>
                  </tr>
                  <tr class="total-row">
                    <td style="padding-top: 10px; border-top: 2px solid #333;">Tổng thanh toán:</td>
                    <td style="padding-top: 10px; border-top: 2px solid #333; text-align: right; color: #667eea;">%s</td>
                  </tr>
                </table>
              </div>

              <div class="order-info">
                <h3>🚚 Địa chỉ giao hàng</h3>
                <p><strong>%s</strong></p>
                <p>%s</p>
                <p>%s, %s</p>
                <p>SĐT: %s</p>
              </div>

              <div class="order-info">
                <h3>💳 Phương thức thanh toán</h3>
                <p>%s</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Greeting Card Shop. All rights reserved.</p>
              <p>Email: support@greetingcard.vn | Hotline: 1900-xxxx</p>
            </div>
          </div>
        </body>
        </html>
        """,
        user.getFullName(),
        order.getOrderNumber(),
        order.getOrderDate().format(DATE_FORMATTER),
        itemsHtml.toString(),
        formatCurrency(order.getTotalAmount()),
        formatCurrency(order.getDiscountAmount()),
        formatCurrency(order.getFinalAmount()),
        order.getShippingAddress().getRecipientName(),
        order.getShippingAddress().getAddressLine1(),
        order.getShippingAddress().getDistrict() != null
            ? order.getShippingAddress().getDistrict()
            : "",
        order.getShippingAddress().getCity(),
        order.getShippingAddress().getPhone(),
        order.getPaymentMethod().getName());
  }

  private String buildOrderStatusUpdateHtml(
      User user, Order order, String newStatus, String notes) {
    String statusDisplay = getStatusDisplay(newStatus);
    String statusColor = getStatusColor(newStatus);

    return String.format(
        """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .order-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Cập nhật đơn hàng</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>%s</strong>,</p>
              <p>Đơn hàng <strong>#%s</strong> của bạn vừa được cập nhật trạng thái.</p>

              <div class="order-info" style="text-align: center;">
                <p style="margin-bottom: 10px;">Trạng thái mới:</p>
                <span class="status-badge" style="background: %s; color: white;">%s</span>
              </div>

              %s

              <p style="margin-top: 30px;">
                Cảm ơn bạn đã mua sắm tại Greeting Card Shop!
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Greeting Card Shop. All rights reserved.</p>
              <p>Email: support@greetingcard.vn | Hotline: 1900-xxxx</p>
            </div>
          </div>
        </body>
        </html>
        """,
        user.getFullName(),
        order.getOrderNumber(),
        statusColor,
        statusDisplay,
        notes != null && !notes.isEmpty()
            ? String.format(
                "<div class=\"order-info\"><p><strong>Ghi chú:</strong> %s</p></div>", notes)
            : "");
  }

  private String formatCurrency(BigDecimal amount) {
    return CURRENCY_FORMATTER.format(amount);
  }

  private String getStatusDisplay(String status) {
    return switch (status) {
      case "PENDING" -> "Chờ xác nhận";
      case "CONFIRMED" -> "Đã xác nhận";
      case "PROCESSING" -> "Đang xử lý";
      case "SHIPPED" -> "Đang giao hàng";
      case "DELIVERED" -> "Đã giao hàng";
      case "CANCELLED" -> "Đã hủy";
      default -> status;
    };
  }

  private String getStatusColor(String status) {
    return switch (status) {
      case "PENDING" -> "#f59e0b";
      case "CONFIRMED" -> "#3b82f6";
      case "PROCESSING" -> "#8b5cf6";
      case "SHIPPED" -> "#06b6d4";
      case "DELIVERED" -> "#10b981";
      case "CANCELLED" -> "#ef4444";
      default -> "#6b7280";
    };
  }
}
