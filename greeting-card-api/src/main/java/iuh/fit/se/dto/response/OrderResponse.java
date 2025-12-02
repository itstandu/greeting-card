package iuh.fit.se.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.entity.enumeration.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
  private Long id;
  private String orderNumber;
  private LocalDateTime orderDate;
  private BigDecimal totalAmount;
  private BigDecimal discountAmount;
  private BigDecimal finalAmount;
  private OrderStatus status;
  private PaymentStatus paymentStatus;
  private String notes;
  private List<OrderItemResponse> items;
  private UserAddressResponse shippingAddress;
  private PaymentMethodResponse paymentMethod;
  private String couponCode;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Simplified response for list views
  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Simple {
    private Long id;
    private String orderNumber;
    private LocalDateTime orderDate;
    private BigDecimal finalAmount;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Integer totalItems;
  }
}
