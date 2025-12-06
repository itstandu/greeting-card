package iuh.fit.se.service;

import java.io.UnsupportedEncodingException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import iuh.fit.se.entity.User;
import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

// Service để gửi email xác thực
@Service
@RequiredArgsConstructor
public class EmailVerificationService {
  private final JavaMailSender mailSender;

  @Value("${app.web-url:http://localhost:3000}")
  private String webUrl;

  @Value("${spring.mail.username}")
  private String fromEmail;

  @Value("${app.mail.from-name:Greeting Card API}")
  private String fromName;

  // Gửi email xác thực
  @SuppressWarnings("null")
  public void sendVerificationEmail(User user, String token) {
    try {
      String verificationUrl = webUrl + "/auth/verify-email?token=" + token;
      String subject = "Xác thực email đăng ký tài khoản";
      String content = buildVerificationEmailContent(user.getFullName(), verificationUrl);

      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail, fromName);
      helper.setTo(user.getEmail());
      helper.setSubject(subject);
      helper.setText(content, true);

      mailSender.send(message);
    } catch (MessagingException | UnsupportedEncodingException e) {
      throw new AppException(
          "Không thể gửi email xác thực. Vui lòng thử lại sau.",
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCode.EMAIL_SEND_FAILED);
    }
  }

  // Xây dựng nội dung email xác thực
  private String buildVerificationEmailContent(String fullName, String verificationUrl) {
    return "<!DOCTYPE html>"
        + "<html>"
        + "<head>"
        + "<meta charset='UTF-8'>"
        + "<style>"
        + "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }"
        + ".container { max-width: 600px; margin: 0 auto; padding: 20px; }"
        + ".header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }"
        + ".content { padding: 20px; background-color: #f9f9f9; }"
        + ".button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
        + ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }"
        + "</style>"
        + "</head>"
        + "<body>"
        + "<div class='container'>"
        + "<div class='header'>"
        + "<h1>Xác thực Email</h1>"
        + "</div>"
        + "<div class='content'>"
        + "<p>Xin chào <strong>"
        + fullName
        + "</strong>,</p>"
        + "<p>Cảm ơn bạn đã đăng ký tài khoản tại Greeting Card API.</p>"
        + "<p>Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>"
        + "<p style='text-align: center;'>"
        + "<a href='"
        + verificationUrl
        + "' class='button'>Xác thực Email</a>"
        + "</p>"
        + "<p>Hoặc copy và paste link sau vào trình duyệt:</p>"
        + "<p style='word-break: break-all; color: #666;'>"
        + verificationUrl
        + "</p>"
        + "<p>Link này sẽ hết hạn sau 24 giờ.</p>"
        + "</div>"
        + "<div class='footer'>"
        + "<p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>"
        + "<p>&copy; 2024 Greeting Card API. All rights reserved.</p>"
        + "</div>"
        + "</div>"
        + "</body>"
        + "</html>";
  }
}
