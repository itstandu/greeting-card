package iuh.fit.se.exception;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.HibernateException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import iuh.fit.se.dto.response.ApiResponse;
import jakarta.persistence.PersistenceException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AppException.class)
  public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
    return buildErrorResponse(ex.getErrorCode(), ex.getMessage(), ex.getStatus(), null);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
      ResourceNotFoundException ex) {
    return buildErrorResponse(
        ErrorCode.RESOURCE_NOT_FOUND, ex.getMessage(), HttpStatus.NOT_FOUND, null);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
      AuthenticationException ex) {
    return buildErrorResponse(ex.getErrorCode(), ex.getMessage(), HttpStatus.UNAUTHORIZED, null);
  }

  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidationException(ValidationException ex) {
    return buildErrorResponse(
        ErrorCode.VALIDATION_ERROR, ex.getMessage(), HttpStatus.BAD_REQUEST, null);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(
      MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getAllErrors()
        .forEach(
            error -> {
              String fieldName = ((FieldError) error).getField();
              errors.put(fieldName, error.getDefaultMessage());
            });

    return buildErrorResponse(
        ErrorCode.VALIDATION_ERROR, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST, errors);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(
      BadCredentialsException ex) {
    return buildErrorResponse(
        ErrorCode.BAD_CREDENTIALS, "Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED, null);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
    return buildErrorResponse(ErrorCode.ACCESS_DENIED, ex.getMessage(), HttpStatus.FORBIDDEN, null);
  }

  @ExceptionHandler(MissingServletRequestParameterException.class)
  public ResponseEntity<ApiResponse<Void>> handleMissingServletRequestParameterException(
      MissingServletRequestParameterException ex) {
    Map<String, String> errors = new HashMap<>();
    errors.put(ex.getParameterName(), "Thiếu tham số bắt buộc");
    return buildErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Thiếu tham số bắt buộc: " + ex.getParameterName(),
        HttpStatus.BAD_REQUEST,
        errors);
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleNoHandlerFoundException(
      NoHandlerFoundException ex) {
    return buildErrorResponse(
        ErrorCode.ENDPOINT_NOT_FOUND, "Không tìm thấy endpoint", HttpStatus.NOT_FOUND, null);
  }

  @ExceptionHandler(TransactionSystemException.class)
  public ResponseEntity<ApiResponse<Void>> handleTransactionSystemException(
      TransactionSystemException ex) {
    String message = resolveTransactionMessage(ex);
    return buildErrorResponse(
        ErrorCode.TRANSACTION_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR, null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
    log.error("Unhandled exception", ex);
    return buildErrorResponse(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Đã xảy ra lỗi hệ thống: " + ex.getMessage(),
        HttpStatus.INTERNAL_SERVER_ERROR,
        null);
  }

  @SuppressWarnings("null")
  private ResponseEntity<ApiResponse<Void>> buildErrorResponse(
      ErrorCode errorCode, String message, HttpStatus status, Map<String, String> errors) {
    ApiResponse<Void> response = ApiResponse.failure(errorCode, message, errors);
    HttpStatus httpStatus = status != null ? status : errorCode.getStatus();
    return ResponseEntity.status(httpStatus).body(response);
  }

  private String resolveTransactionMessage(TransactionSystemException ex) {
    Throwable rootCause = ex.getRootCause();
    String message = ErrorCode.TRANSACTION_ERROR.getDefaultMessage();

    Throwable cause = rootCause;
    int depth = 0;
    while (cause != null && depth < 10) {
      if (cause instanceof ConstraintViolationException cvEx) {
        StringBuilder sb = new StringBuilder("Dữ liệu không hợp lệ: ");
        cvEx.getConstraintViolations()
            .forEach(
                v ->
                    sb.append(v.getPropertyPath()).append(' ').append(v.getMessage()).append("; "));
        message = sb.toString();
        break;
      } else if (cause instanceof org.hibernate.exception.ConstraintViolationException hEx) {
        String sqlMessage =
            hEx.getSQLException() != null ? hEx.getSQLException().getMessage() : hEx.getMessage();
        message = "Vi phạm ràng buộc dữ liệu: " + sqlMessage;
        break;
      } else if (cause instanceof PersistenceException) {
        message = "Lỗi persistence: " + cause.getMessage();
        break;
      } else if (cause instanceof HibernateException) {
        message = "Lỗi Hibernate: " + cause.getMessage();
        break;
      } else if (cause instanceof SQLException sqlEx) {
        message = "Lỗi cơ sở dữ liệu: " + sqlEx.getMessage();
        break;
      }

      cause = cause.getCause();
      depth++;
    }

    if (message.equals(ErrorCode.TRANSACTION_ERROR.getDefaultMessage()) && rootCause != null) {
      message = rootCause.getMessage() != null ? rootCause.getMessage() : message;
    }
    return message;
  }
}
