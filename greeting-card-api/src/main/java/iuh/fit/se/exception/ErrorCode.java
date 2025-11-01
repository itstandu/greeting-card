package iuh.fit.se.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
  SUCCESS("SUCCESS", HttpStatus.OK, "Thành công"),
  VALIDATION_ERROR("VALIDATION_ERROR", HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
  RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên"),
  NOT_FOUND("NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên"),
  ENDPOINT_NOT_FOUND("NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy endpoint"),
  AUTHENTICATION_FAILED("AUTHENTICATION_ERROR", HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập"),
  BAD_CREDENTIALS("BAD_CREDENTIALS", HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"),
  EMAIL_NOT_VERIFIED("EMAIL_NOT_VERIFIED", HttpStatus.UNAUTHORIZED, "Email chưa được xác thực"),
  EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", HttpStatus.BAD_REQUEST, "Email đã được sử dụng"),
  INVALID_VERIFICATION_TOKEN(
      "INVALID_VERIFICATION_TOKEN", HttpStatus.BAD_REQUEST, "Token xác thực không hợp lệ"),
  VERIFICATION_TOKEN_EXPIRED(
      "VERIFICATION_TOKEN_EXPIRED", HttpStatus.BAD_REQUEST, "Token xác thực đã hết hạn"),
  REFRESH_TOKEN_NOT_FOUND(
      "REFRESH_TOKEN_NOT_FOUND", HttpStatus.UNAUTHORIZED, "Refresh token không tồn tại"),
  INVALID_REFRESH_TOKEN(
      "INVALID_REFRESH_TOKEN", HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"),
  REFRESH_TOKEN_EXPIRED(
      "REFRESH_TOKEN_EXPIRED", HttpStatus.UNAUTHORIZED, "Refresh token đã hết hạn"),
  EMAIL_SEND_FAILED("EMAIL_SEND_FAILED", HttpStatus.INTERNAL_SERVER_ERROR, "Không thể gửi email"),
  ACCESS_DENIED("ACCESS_DENIED", HttpStatus.FORBIDDEN, "Không có quyền truy cập"),
  FORBIDDEN("FORBIDDEN", HttpStatus.FORBIDDEN, "Không có quyền thực hiện hành động này"),
  TRANSACTION_ERROR(
      "TRANSACTION_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi xử lý dữ liệu"),
  INTERNAL_SERVER_ERROR(
      "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống"),
  UNAUTHORIZED("UNAUTHORIZED", HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"),
  REVIEW_ALREADY_EXISTS(
      "REVIEW_ALREADY_EXISTS", HttpStatus.BAD_REQUEST, "Bạn đã đánh giá sản phẩm này rồi"),
  REVIEW_NOT_PURCHASED(
      "REVIEW_NOT_PURCHASED",
      HttpStatus.BAD_REQUEST,
      "Bạn cần mua sản phẩm này trước khi có thể đánh giá"),
  PAYMENT_METHOD_CODE_EXISTS(
      "PAYMENT_METHOD_CODE_EXISTS", HttpStatus.BAD_REQUEST, "Mã phương thức thanh toán đã tồn tại");

  private final String code;
  private final HttpStatus status;
  private final String defaultMessage;

  ErrorCode(String code, HttpStatus status, String defaultMessage) {
    this.code = code;
    this.status = status;
    this.defaultMessage = defaultMessage;
  }
}
