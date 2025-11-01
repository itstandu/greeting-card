package iuh.fit.se.exception;

// Exception cho các lỗi validation
public class ValidationException extends AppException {
  public ValidationException(String message) {
    super(message, ErrorCode.VALIDATION_ERROR);
  }

  public ValidationException(String message, ErrorCode errorCode) {
    super(message, errorCode.getStatus(), errorCode);
  }
}
