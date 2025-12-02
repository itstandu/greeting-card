package iuh.fit.se.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateOrderRequest;
import iuh.fit.se.dto.request.UpdateOrderStatusRequest;
import iuh.fit.se.dto.response.OrderResponse;
import iuh.fit.se.dto.response.OrderStatusHistoryResponse;
import iuh.fit.se.entity.Cart;
import iuh.fit.se.entity.CartItem;
import iuh.fit.se.entity.Coupon;
import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.OrderItem;
import iuh.fit.se.entity.OrderStatusHistory;
import iuh.fit.se.entity.PaymentMethod;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.Promotion;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.UserAddress;
import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.entity.enumeration.PaymentStatus;
import iuh.fit.se.entity.enumeration.PromotionType;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.OrderMapper;
import iuh.fit.se.repository.CartRepository;
import iuh.fit.se.repository.CouponRepository;
import iuh.fit.se.repository.OrderItemRepository;
import iuh.fit.se.repository.OrderRepository;
import iuh.fit.se.repository.OrderStatusHistoryRepository;
import iuh.fit.se.repository.PaymentMethodRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.PromotionRepository;
import iuh.fit.se.repository.UserAddressRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderService {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final OrderStatusHistoryRepository orderStatusHistoryRepository;
  private final CartRepository cartRepository;
  private final UserRepository userRepository;
  private final UserAddressRepository userAddressRepository;
  private final PaymentMethodRepository paymentMethodRepository;
  private final CouponRepository couponRepository;
  private final PromotionRepository promotionRepository;
  private final ProductRepository productRepository;
  private final OrderMapper orderMapper;
  private final NotificationService notificationService;
  private final EmailService emailService;

  // Tạo đơn hàng mới từ giỏ hàng của user (yêu cầu: user đã login, giỏ hàng không rỗng)
  public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
    // 1. Validate user
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

    // 2. Get cart and validate
    Cart cart =
        cartRepository
            .findByUserIdWithItems(userId)
            .orElseThrow(() -> new IllegalArgumentException("Giỏ hàng trống"));

    if (cart.getItems().isEmpty()) {
      throw new IllegalArgumentException("Giỏ hàng trống");
    }

    // 3. Validate shipping address
    UserAddress shippingAddress =
        userAddressRepository
            .findById(request.getShippingAddressId())
            .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ giao hàng không tồn tại"));

    if (!shippingAddress.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Địa chỉ không thuộc về user này");
    }

    // 4. Validate payment method
    PaymentMethod paymentMethod =
        paymentMethodRepository
            .findById(request.getPaymentMethodId())
            .orElseThrow(
                () -> new ResourceNotFoundException("Phương thức thanh toán không tồn tại"));

    // 5. Validate and apply coupon (if provided)
    Coupon coupon = null;
    BigDecimal discountAmount = BigDecimal.ZERO;
    if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
      coupon =
          couponRepository
              .findByCode(request.getCouponCode().trim())
              .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

      if (!coupon.isValid()) {
        throw new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      }
    }

    // 6. Calculate total amount and validate stock
    BigDecimal totalAmount = BigDecimal.ZERO;
    for (CartItem item : cart.getItems()) {
      Product product = item.getProduct();

      // Validate stock
      if (product.getStock() < item.getQuantity()) {
        throw new IllegalArgumentException(
            "Sản phẩm '"
                + product.getName()
                + "' không đủ số lượng. Còn lại: "
                + product.getStock());
      }

      totalAmount =
          totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
    }

    // 7. Apply coupon discount
    if (coupon != null) {
      // Check minimum purchase
      if (coupon.getMinPurchase() != null && totalAmount.compareTo(coupon.getMinPurchase()) < 0) {
        throw new IllegalArgumentException(
            "Đơn hàng phải từ " + coupon.getMinPurchase() + "đ trở lên để áp dụng mã giảm giá");
      }

      // Calculate discount
      if (coupon.getDiscountType().name().equals("PERCENTAGE")) {
        discountAmount =
            totalAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        // Apply max discount if set
        if (coupon.getMaxDiscount() != null
            && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
          discountAmount = coupon.getMaxDiscount();
        }
      } else {
        // FIXED_AMOUNT
        discountAmount = coupon.getDiscountValue();
      }

      // Update coupon usage
      coupon.setUsedCount(coupon.getUsedCount() + 1);
      couponRepository.save(coupon);
    }

    // 7.5. Find and apply promotions
    Promotion appliedPromotion = null;
    BigDecimal promotionDiscountAmount = BigDecimal.ZERO;
    LocalDateTime now = LocalDateTime.now();

    // Find ORDER scope promotions
    List<Promotion> orderPromotions = promotionRepository.findActivePromotionsForOrder(now);
    if (!orderPromotions.isEmpty()) {
      // Apply first valid ORDER promotion (can be enhanced to find best promotion)
      for (Promotion promotion : orderPromotions) {
        if (promotion.getType() == PromotionType.DISCOUNT) {
          // Check minimum purchase
          if (promotion.getMinPurchase() != null
              && totalAmount.compareTo(promotion.getMinPurchase()) < 0) {
            continue;
          }

          // Calculate discount
          BigDecimal promoDiscount = BigDecimal.ZERO;
          if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
            promoDiscount =
                totalAmount.multiply(promotion.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (promotion.getMaxDiscount() != null
                && promoDiscount.compareTo(promotion.getMaxDiscount()) > 0) {
              promoDiscount = promotion.getMaxDiscount();
            }
          } else {
            promoDiscount = promotion.getDiscountValue();
          }

          // Ensure discount doesn't exceed order total
          if (promoDiscount.compareTo(totalAmount) > 0) {
            promoDiscount = totalAmount;
          }

          appliedPromotion = promotion;
          promotionDiscountAmount = promoDiscount;
          break; // Apply first valid promotion
        }
      }
    }

    BigDecimal finalAmount = totalAmount.subtract(discountAmount).subtract(promotionDiscountAmount);
    if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
      finalAmount = BigDecimal.ZERO;
    }

    // 8. Create order
    Order order = new Order();
    order.setUser(user);
    order.setOrderNumber(generateOrderNumber());
    order.setTotalAmount(totalAmount);
    order.setDiscountAmount(discountAmount);
    order.setFinalAmount(finalAmount);
    order.setStatus(OrderStatus.PENDING);
    order.setPaymentStatus(PaymentStatus.PENDING);
    order.setShippingAddress(shippingAddress);
    order.setPaymentMethod(paymentMethod);
    order.setCoupon(coupon);
    order.setPromotion(appliedPromotion);
    order.setPromotionDiscountAmount(promotionDiscountAmount);
    order.setNotes(request.getNotes());

    order = orderRepository.save(order);

    // 9. Create order items, apply promotions, and update stock
    for (CartItem cartItem : cart.getItems()) {
      Product product = cartItem.getProduct();

      // Find PRODUCT scope promotions for this product
      List<Promotion> productPromotions =
          promotionRepository.findActivePromotionsForProduct(product.getId(), now);
      Promotion itemPromotion = null;
      BigDecimal itemPromotionDiscount = BigDecimal.ZERO;
      Integer itemPromotionQuantityFree = 0;

      // Apply first valid PRODUCT promotion (can be enhanced to find best promotion)
      for (Promotion promotion : productPromotions) {
        if (promotion.getType() == PromotionType.DISCOUNT) {
          BigDecimal itemSubtotal =
              product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
          BigDecimal promoDiscount = BigDecimal.ZERO;
          if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
            promoDiscount =
                itemSubtotal.multiply(promotion.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (promotion.getMaxDiscount() != null
                && promoDiscount.compareTo(promotion.getMaxDiscount()) > 0) {
              promoDiscount = promotion.getMaxDiscount();
            }
          } else {
            promoDiscount = promotion.getDiscountValue();
          }
          if (promoDiscount.compareTo(itemSubtotal) > 0) {
            promoDiscount = itemSubtotal;
          }
          itemPromotion = promotion;
          itemPromotionDiscount = promoDiscount;
          break;
        } else if (promotion.getType() == PromotionType.BOGO) {
          // Buy 1 Get 1 Free
          int freeQuantity = cartItem.getQuantity() / 2; // For every 2, get 1 free
          if (freeQuantity > 0) {
            itemPromotion = promotion;
            itemPromotionQuantityFree = freeQuantity;
            itemPromotionDiscount = product.getPrice().multiply(BigDecimal.valueOf(freeQuantity));
            break;
          }
        } else if (promotion.getType() == PromotionType.BUY_X_GET_Y) {
          // Buy X Get Y
          int sets =
              cartItem.getQuantity() / (promotion.getBuyQuantity() + promotion.getGetQuantity());
          int freeQuantity = sets * promotion.getGetQuantity();
          if (freeQuantity > 0) {
            itemPromotion = promotion;
            itemPromotionQuantityFree = freeQuantity;
            itemPromotionDiscount = product.getPrice().multiply(BigDecimal.valueOf(freeQuantity));
            break;
          }
        } else if (promotion.getType() == PromotionType.BUY_X_PAY_Y) {
          // Buy X Pay Y
          int sets = cartItem.getQuantity() / promotion.getBuyQuantity();
          int paidQuantity = sets * promotion.getPayQuantity();
          int freeQuantity = cartItem.getQuantity() - paidQuantity;
          if (freeQuantity > 0) {
            itemPromotion = promotion;
            itemPromotionQuantityFree = freeQuantity;
            itemPromotionDiscount = product.getPrice().multiply(BigDecimal.valueOf(freeQuantity));
            break;
          }
        }
      }

      OrderItem orderItem = new OrderItem();
      orderItem.setOrder(order);
      orderItem.setProduct(product);
      orderItem.setQuantity(cartItem.getQuantity());
      orderItem.setPrice(product.getPrice());
      orderItem.setSubtotal(
          product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
      orderItem.setPromotion(itemPromotion);
      orderItem.setPromotionDiscountAmount(itemPromotionDiscount);
      orderItem.setPromotionQuantityFree(itemPromotionQuantityFree);

      orderItemRepository.save(orderItem);

      // Update product stock (subtract actual quantity, not including free items)
      int stockToDeduct = cartItem.getQuantity() - itemPromotionQuantityFree;
      product.setStock(product.getStock() - stockToDeduct);
      productRepository.save(product);
    }

    // Update promotion usage count if applied
    if (appliedPromotion != null) {
      appliedPromotion.setUsedCount(appliedPromotion.getUsedCount() + 1);
      promotionRepository.save(appliedPromotion);
    }

    // 10. Create order status history
    createStatusHistory(order, OrderStatus.PENDING, "Đơn hàng mới được tạo", user);

    // 11. Clear cart
    cart.clearItems();
    cartRepository.save(cart);

    log.info("Created order {} for user {}", order.getOrderNumber(), userId);

    // 12. Send notification to admins about new order
    String orderTotalAmount = order.getFinalAmount().toString();
    notificationService.notifyAdminsNewOrder(
        order.getOrderNumber(), user.getFullName(), orderTotalAmount);

    // 13. Send email notification
    emailService.sendOrderConfirmationEmail(user, order);

    return orderMapper.toOrderResponse(order);
  }

  // Get user orders (pagination)
  @Transactional(readOnly = true)
  public Page<OrderResponse.Simple> getUserOrders(Long userId, Pageable pageable) {
    Page<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId, pageable);
    return orders.map(orderMapper::toSimpleOrderResponse);
  }

  // Lấy chi tiết đơn hàng (user chỉ xem được đơn của mình)
  @Transactional(readOnly = true)
  public OrderResponse getOrderDetail(Long userId, Long orderId) {
    Order order =
        orderRepository
            .findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    // Validate ownership
    if (!order.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Bạn không có quyền xem đơn hàng này");
    }

    return orderMapper.toOrderResponse(order);
  }

  // Lấy lịch sử trạng thái đơn hàng
  @Transactional(readOnly = true)
  public List<OrderStatusHistoryResponse> getOrderStatusHistory(Long userId, Long orderId) {
    Order order =
        orderRepository
            .findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    // Validate ownership
    if (!order.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Bạn không có quyền xem đơn hàng này");
    }

    return order.getStatusHistory().stream()
        .map(orderMapper::toOrderStatusHistoryResponse)
        .collect(Collectors.toList());
  }

  // === ADMIN METHODS ===

  // Admin: Get all orders
  @Transactional(readOnly = true)
  public Page<OrderResponse.Simple> getAllOrders(Pageable pageable) {
    Page<Order> orders = orderRepository.findAll(pageable);
    return orders.map(orderMapper::toSimpleOrderResponse);
  }

  // Admin: Get orders by status
  @Transactional(readOnly = true)
  public Page<OrderResponse.Simple> getOrdersByStatus(OrderStatus status, Pageable pageable) {
    Page<Order> orders = orderRepository.findByStatusOrderByOrderDateDesc(status, pageable);
    return orders.map(orderMapper::toSimpleOrderResponse);
  }

  // Admin: Search orders
  @Transactional(readOnly = true)
  public Page<OrderResponse.Simple> searchOrders(String keyword, Pageable pageable) {
    Page<Order> orders = orderRepository.searchOrders(keyword, pageable);
    return orders.map(orderMapper::toSimpleOrderResponse);
  }

  // Admin: Lấy chi tiết đơn hàng (không cần validate ownership)
  @Transactional(readOnly = true)
  public OrderResponse getOrderDetailAdmin(Long orderId) {
    Order order =
        orderRepository
            .findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    return orderMapper.toOrderResponse(order);
  }

  // Admin: Lấy lịch sử trạng thái đơn hàng (không cần validate ownership)
  @Transactional(readOnly = true)
  public List<OrderStatusHistoryResponse> getOrderStatusHistoryAdmin(Long orderId) {
    Order order =
        orderRepository
            .findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    return order.getStatusHistory().stream()
        .map(orderMapper::toOrderStatusHistoryResponse)
        .collect(Collectors.toList());
  }

  // Admin: Cập nhật trạng thái đơn hàng
  public OrderResponse updateOrderStatus(
      Long orderId, UpdateOrderStatusRequest request, Long adminUserId) {
    Order order =
        orderRepository
            .findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    User admin =
        userRepository
            .findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin không tồn tại"));

    // Validate status transition
    validateStatusTransition(order.getStatus(), request.getStatus());

    // Update status
    order.setStatus(request.getStatus());
    orderRepository.save(order);

    // Create status history
    createStatusHistory(order, request.getStatus(), request.getNotes(), admin);

    log.info(
        "Admin {} updated order {} status to {}",
        adminUserId,
        order.getOrderNumber(),
        request.getStatus());

    // Send notification to customer
    String statusLabel = getOrderStatusLabel(request.getStatus());
    notificationService.notifyOrderStatusChange(
        order.getUser().getId(), order.getOrderNumber(), statusLabel);

    return orderMapper.toOrderResponse(order);
  }

  // Admin: Update order item quantity
  public OrderResponse updateOrderItemQuantity(
      Long orderId, Long orderItemId, Integer newQuantity, Long adminUserId) {
    Order order =
        orderRepository
            .findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

    // Only allow editing pending or confirmed orders
    if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
      throw new IllegalArgumentException(
          "Chỉ có thể chỉnh sửa đơn hàng ở trạng thái 'Chờ xử lý' hoặc 'Đã xác nhận'");
    }

    // Find the order item
    OrderItem orderItem =
        order.getOrderItems().stream()
            .filter(item -> item.getId().equals(orderItemId))
            .findFirst()
            .orElseThrow(
                () -> new ResourceNotFoundException("Sản phẩm không tồn tại trong đơn hàng"));

    if (newQuantity <= 0) {
      throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
    }

    // Check stock availability
    Product product = orderItem.getProduct();
    int stockDiff = newQuantity - orderItem.getQuantity();
    if (stockDiff > 0 && product.getStock() < stockDiff) {
      throw new IllegalArgumentException(
          "Sản phẩm '" + product.getName() + "' không đủ số lượng. Còn lại: " + product.getStock());
    }

    // Update stock
    product.setStock(product.getStock() - stockDiff);
    productRepository.save(product);

    // Update order item quantity (subtotal is calculated by @PreUpdate)
    orderItem.setQuantity(newQuantity);
    orderItemRepository.save(orderItem);

    // Recalculate order totals
    BigDecimal newTotalAmount = BigDecimal.ZERO;
    for (OrderItem item : order.getOrderItems()) {
      newTotalAmount = newTotalAmount.add(item.getSubtotal());
    }
    order.setTotalAmount(newTotalAmount);
    order.setFinalAmount(newTotalAmount.subtract(order.getDiscountAmount()));
    orderRepository.save(order);

    // Add to status history
    User admin =
        userRepository
            .findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin không tồn tại"));
    createStatusHistory(
        order,
        order.getStatus(),
        String.format(
            "Đã cập nhật số lượng sản phẩm '%s' thành %d", product.getName(), newQuantity),
        admin);

    log.info(
        "Admin {} updated order {} item {} quantity to {}",
        adminUserId,
        order.getOrderNumber(),
        orderItemId,
        newQuantity);

    return orderMapper.toOrderResponse(order);
  }

  // === HELPER METHODS ===

  // Generate unique order number (Format: ORD-YYYY-MM-DD-XXX)
  // Ví dụ: ORD-2024-12-25-001 (năm-tháng-ngày-số thứ tự)
  private String generateOrderNumber() {
    LocalDate today = LocalDate.now();
    String datePrefix = today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

    // Get the latest order number for today
    Pageable pageable = Pageable.ofSize(1);
    List<String> latestNumbers = orderRepository.findLatestOrderNumber(pageable);

    int sequence = 1;
    if (!latestNumbers.isEmpty()) {
      String latestNumber = latestNumbers.get(0);
      // Check if latest order is from today (format: ORD-YYYY-MM-DD-XXX)
      if (latestNumber.startsWith("ORD-" + datePrefix)) {
        try {
          // Extract sequence from format: ORD-YYYY-MM-DD-XXX
          String seqStr = latestNumber.substring(latestNumber.lastIndexOf('-') + 1);
          sequence = Integer.parseInt(seqStr) + 1;
        } catch (Exception e) {
          log.warn("Failed to parse sequence from order number: {}", latestNumber);
        }
      }
    }

    return String.format("ORD-%s-%03d", datePrefix, sequence);
  }

  // Create order status history record
  private String getOrderStatusLabel(OrderStatus status) {
    return switch (status) {
      case PENDING -> "Chờ xử lý";
      case CONFIRMED -> "Đã xác nhận";
      case SHIPPED -> "Đã giao hàng";
      case DELIVERED -> "Đã nhận hàng";
      case CANCELLED -> "Đã hủy";
    };
  }

  private void createStatusHistory(Order order, OrderStatus status, String notes, User changedBy) {
    OrderStatusHistory history = new OrderStatusHistory();
    history.setOrder(order);
    history.setStatus(status);
    history.setNotes(notes);
    history.setChangedBy(changedBy);
    orderStatusHistoryRepository.save(history);
  }

  // Validate status transition
  private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
    // Business rules for status transitions
    if (currentStatus == OrderStatus.CANCELLED) {
      throw new IllegalArgumentException("Không thể thay đổi trạng thái đơn hàng đã hủy");
    }

    if (currentStatus == OrderStatus.DELIVERED) {
      throw new IllegalArgumentException("Không thể thay đổi trạng thái đơn hàng đã giao");
    }

    // Validate specific transitions
    if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.SHIPPED) {
      throw new IllegalArgumentException(
          "Không thể chuyển từ 'Chờ xử lý' sang 'Đang giao'. Vui lòng xác nhận đơn hàng trước.");
    }

    if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.DELIVERED) {
      throw new IllegalArgumentException(
          "Không thể chuyển trực tiếp từ 'Chờ xử lý' sang 'Đã giao'.");
    }

    if (currentStatus == OrderStatus.CONFIRMED && newStatus == OrderStatus.PENDING) {
      throw new IllegalArgumentException(
          "Không thể quay lại trạng thái 'Chờ xử lý' sau khi đã xác nhận.");
    }
  }
}
