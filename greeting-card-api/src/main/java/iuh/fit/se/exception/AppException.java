package iuh.fit.se.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

// Custom exception cho các lỗi trong ứng dụng
@Getter
public class AppException extends RuntimeException {
  private final HttpStatus status;
  private final ErrorCode errorCode;

  public AppException(String message, HttpStatus status, ErrorCode errorCode) {
    super(message != null ? message : errorCode.getDefaultMessage());
    this.status = status != null ? status : errorCode.getStatus();
    this.errorCode = errorCode;
  }

  public AppException(String message, ErrorCode errorCode) {
    this(message, errorCode.getStatus(), errorCode);
  }

  public AppException(ErrorCode errorCode) {
    this(null, errorCode.getStatus(), errorCode);
  }

  public String getErrorCodeValue() {
    return errorCode != null ? errorCode.getCode() : null;
  }
}
