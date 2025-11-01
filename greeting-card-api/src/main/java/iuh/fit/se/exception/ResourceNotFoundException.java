package iuh.fit.se.exception;

// Exception cho các lỗi không tìm thấy resource
public class ResourceNotFoundException extends AppException {
  public ResourceNotFoundException(String message) {
    super(message, ErrorCode.RESOURCE_NOT_FOUND);
  }
}
