package iuh.fit.se.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.OrderItemResponse;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.OrderStatusHistoryResponse;
import iuh.fit.se.dto.response.PaymentMethodResponse;
import iuh.fit.se.dto.response.UserAddressResponse;
import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.OrderItem;
import iuh.fit.se.entity.OrderStatusHistory;
import iuh.fit.se.entity.PaymentMethod;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.UserAddress;

@Component
public class OrderMapper {

  public OrderResponse toOrderResponse(Order order) {
    if (order == null) {
      return null;
    }

    List<OrderItemResponse> items =
        order.getOrderItems().stream().map(this::toOrderItemResponse).collect(Collectors.toList());

    UserAddressResponse addressResponse = toUserAddressResponse(order.getShippingAddress());
    PaymentMethodResponse paymentMethodResponse = toPaymentMethodResponse(order.getPaymentMethod());

    return new OrderResponse(
        order.getId(),
        order.getOrderNumber(),
        order.getOrderDate(),
        order.getTotalAmount(),
        order.getDiscountAmount(),
        order.getShippingFee(),
        order.getFinalAmount(),
        order.getStatus(),
        order.getPaymentStatus(),
        order.getNotes(),
        items,
        addressResponse,
        paymentMethodResponse,
        order.getCoupon() != null ? order.getCoupon().getCode() : null,
        order.getCreatedAt(),
        order.getUpdatedAt());
  }

  public OrderResponse.Simple toSimpleOrderResponse(Order order) {
    if (order == null) {
      return null;
    }

    int totalItems = order.getOrderItems().stream().mapToInt(OrderItem::getQuantity).sum();

    return new OrderResponse.Simple(
        order.getId(),
        order.getOrderNumber(),
        order.getOrderDate(),
        order.getFinalAmount(),
        order.getStatus(),
        order.getPaymentStatus(),
        totalItems);
  }

  public OrderItemResponse toOrderItemResponse(OrderItem item) {
    if (item == null) {
      return null;
    }

    Product product = item.getProduct();
    String primaryImageUrl =
        product.getImages().stream()
            .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
            .map(img -> img.getImageUrl())
            .findFirst()
            .orElse(
                product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

    return OrderItemResponse.builder()
        .id(item.getId())
        .productId(product.getId())
        .productName(product.getName())
        .productImage(primaryImageUrl)
        .quantity(item.getQuantity())
        .price(item.getPrice())
        .subtotal(item.getSubtotal())
        .promotionId(item.getPromotion() != null ? item.getPromotion().getId() : null)
        .promotionName(item.getPromotion() != null ? item.getPromotion().getName() : null)
        .promotionType(item.getPromotion() != null ? item.getPromotion().getType() : null)
        .promotionDiscountAmount(item.getPromotionDiscountAmount())
        .promotionQuantityFree(item.getPromotionQuantityFree())
        .build();
  }

  public UserAddressResponse toUserAddressResponse(UserAddress address) {
    if (address == null) return null;

    return new UserAddressResponse(
        address.getId(),
        address.getRecipientName(),
        address.getPhone(),
        address.getAddressLine1(),
        address.getAddressLine2(),
        address.getCity(),
        address.getDistrict(),
        address.getWard(),
        address.getPostalCode(),
        address.getIsDefault());
  }

  public PaymentMethodResponse toPaymentMethodResponse(PaymentMethod paymentMethod) {
    if (paymentMethod == null) return null;

    return new PaymentMethodResponse(
        paymentMethod.getId(),
        paymentMethod.getName(),
        paymentMethod.getCode(),
        paymentMethod.getDescription());
  }

  public OrderStatusHistoryResponse toOrderStatusHistoryResponse(OrderStatusHistory history) {
    if (history == null) {
      return null;
    }
    return new OrderStatusHistoryResponse(
        history.getId(),
        history.getStatus(),
        history.getNotes(),
        history.getChangedBy().getFullName(),
        history.getCreatedAt());
  }
}
