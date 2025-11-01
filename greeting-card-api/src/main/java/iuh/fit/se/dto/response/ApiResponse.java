package iuh.fit.se.dto.response;

import java.util.Map;
import java.util.Optional;

import org.slf4j.MDC;

import iuh.fit.se.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Generic API Response wrapper
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
  private Boolean success;
  private String message;
  private T data;
  private String errorCode;
  private Long timestamp;
  private PaginationResponse pagination;
  private Map<String, String> errors;
  private String traceId;

  public static <T> ApiResponse<T> success(T data) {
    return success(ErrorCode.SUCCESS.getDefaultMessage(), data);
  }

  public static <T> ApiResponse<T> success(String message, T data) {
    return ApiResponse.<T>builder()
        .success(true)
        .message(Optional.ofNullable(message).orElse(ErrorCode.SUCCESS.getDefaultMessage()))
        .data(data)
        .errorCode(ErrorCode.SUCCESS.getCode())
        .timestamp(System.currentTimeMillis())
        .pagination(null)
        .traceId(MDC.get("traceId"))
        .build();
  }

  public static <T> ApiResponse<T> successWithPagination(T data, PaginationResponse pagination) {
    return successWithPagination(ErrorCode.SUCCESS.getDefaultMessage(), data, pagination);
  }

  public static <T> ApiResponse<T> successWithPagination(
      String message, T data, PaginationResponse pagination) {
    return ApiResponse.<T>builder()
        .success(true)
        .message(Optional.ofNullable(message).orElse(ErrorCode.SUCCESS.getDefaultMessage()))
        .data(data)
        .errorCode(ErrorCode.SUCCESS.getCode())
        .pagination(pagination)
        .timestamp(System.currentTimeMillis())
        .traceId(MDC.get("traceId"))
        .build();
  }

  public static <T> ApiResponse<T> failure(ErrorCode errorCode, String message) {
    return failure(errorCode, message, null);
  }

  public static <T> ApiResponse<T> failure(
      ErrorCode errorCode, String message, Map<String, String> errors) {
    ErrorCode resolvedCode = Optional.ofNullable(errorCode).orElse(ErrorCode.INTERNAL_SERVER_ERROR);
    return ApiResponse.<T>builder()
        .success(false)
        .message(Optional.ofNullable(message).orElse(resolvedCode.getDefaultMessage()))
        .errorCode(resolvedCode.getCode())
        .errors(errors)
        .timestamp(System.currentTimeMillis())
        .traceId(MDC.get("traceId"))
        .build();
  }
}
