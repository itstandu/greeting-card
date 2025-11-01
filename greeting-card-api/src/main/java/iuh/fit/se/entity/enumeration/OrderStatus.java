package iuh.fit.se.entity.enumeration;

// Enum định nghĩa trạng thái đơn hàng
public enum OrderStatus {
  PENDING, // Chờ xử lý
  CONFIRMED, // Đã xác nhận
  SHIPPED, // Đã giao hàng
  DELIVERED, // Đã nhận hàng
  CANCELLED // Đã hủy
}
