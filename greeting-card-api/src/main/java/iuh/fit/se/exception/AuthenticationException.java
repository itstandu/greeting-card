package iuh.fit.se.exception;

// Exception cho các lỗi xác thực
public class AuthenticationException extends AppException {
  public AuthenticationException(String message) {
    super(message, ErrorCode.AUTHENTICATION_FAILED);
  }

  public AuthenticationException(String message, ErrorCode errorCode) {
    super(message, errorCode.getStatus(), errorCode);
  }
}
