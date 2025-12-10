package iuh.fit.se.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreatePromotionRequest;
import iuh.fit.se.dto.request.UpdatePromotionRequest;
import iuh.fit.se.dto.response.CartPromotionPreviewResponse;
import iuh.fit.se.dto.response.PromotionResponse;
import iuh.fit.se.entity.Cart;
import iuh.fit.se.entity.CartItem;
import iuh.fit.se.entity.Category;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.Promotion;
import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.PromotionScope;
import iuh.fit.se.entity.enumeration.PromotionType;
import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.PromotionMapper;
import iuh.fit.se.repository.CartRepository;
import iuh.fit.se.repository.CategoryRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.PromotionRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PromotionService {
  // Shipping fee constants
  private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");
  private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500000");

  private final PromotionRepository promotionRepository;
  private final PromotionMapper promotionMapper;
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final CartRepository cartRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public Page<PromotionResponse> getAllPromotions(
      int page, int size, String sortBy, String sortDir) {
    Sort sort =
        sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();

    Pageable pageable = PageRequest.of(page, size, sort);
    return promotionRepository.findAll(pageable).map(promotionMapper::toResponse);
  }

  @Transactional(readOnly = true)
  @SuppressWarnings("null")
  public PromotionResponse getPromotionById(Long id) {
    Promotion promotion =
        promotionRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));
    return promotionMapper.toResponse(promotion);
  }

  @Transactional
  @SuppressWarnings("null")
  public PromotionResponse createPromotion(CreatePromotionRequest request) {
    // Validate date range
    if (request.getValidUntil().isBefore(request.getValidFrom())) {
      throw new AppException("Ngày kết thúc phải sau ngày bắt đầu", ErrorCode.VALIDATION_ERROR);
    }

    // Validate promotion configuration based on type
    validatePromotionConfiguration(request);

    Promotion promotion = new Promotion();
    promotion.setName(request.getName().trim());
    promotion.setDescription(request.getDescription());
    promotion.setType(request.getType());
    promotion.setScope(request.getScope());

    // Set fields based on type
    if (request.getType() == PromotionType.DISCOUNT) {
      promotion.setDiscountType(request.getDiscountType());
      promotion.setDiscountValue(request.getDiscountValue());
      promotion.setMinPurchase(
          request.getMinPurchase() != null ? request.getMinPurchase() : BigDecimal.ZERO);
      promotion.setMaxDiscount(request.getMaxDiscount());
    } else if (request.getType() == PromotionType.BOGO) {
      promotion.setBuyQuantity(1);
      promotion.setGetQuantity(1);
    } else if (request.getType() == PromotionType.BUY_X_GET_Y) {
      promotion.setBuyQuantity(request.getBuyQuantity());
      promotion.setGetQuantity(request.getGetQuantity());
    } else if (request.getType() == PromotionType.BUY_X_PAY_Y) {
      promotion.setBuyQuantity(request.getBuyQuantity());
      promotion.setPayQuantity(request.getPayQuantity());
    }

    // Set scope-specific fields
    if (request.getScope() == PromotionScope.PRODUCT) {
      if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
        throw new AppException(
            "Phải chọn ít nhất một sản phẩm cho khuyến mãi loại sản phẩm",
            ErrorCode.VALIDATION_ERROR);
      }
      Set<Product> products = new HashSet<>();
      for (Long productId : request.getProductIds()) {
        Product product =
            productRepository
                .findById(productId)
                .orElseThrow(
                    () ->
                        new ResourceNotFoundException(
                            "Sản phẩm với ID " + productId + " không tồn tại"));
        products.add(product);
      }
      promotion.setProducts(products);
    } else if (request.getScope() == PromotionScope.CATEGORY) {
      if (request.getCategoryId() == null) {
        throw new AppException(
            "Phải chọn danh mục cho khuyến mãi loại danh mục", ErrorCode.VALIDATION_ERROR);
      }
      Category category =
          categoryRepository
              .findById(request.getCategoryId())
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          "Danh mục với ID " + request.getCategoryId() + " không tồn tại"));
      promotion.setCategory(category);
    }

    promotion.setValidFrom(request.getValidFrom());
    promotion.setValidUntil(request.getValidUntil());
    promotion.setUsageLimit(request.getUsageLimit());
    promotion.setUsedCount(0);
    promotion.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

    Promotion savedPromotion = promotionRepository.save(promotion);
    return promotionMapper.toResponse(savedPromotion);
  }

  @Transactional
  @SuppressWarnings("null")
  public PromotionResponse updatePromotion(Long id, UpdatePromotionRequest request) {
    Promotion promotion =
        promotionRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));

    // Update fields if provided
    if (request.getName() != null) {
      promotion.setName(request.getName().trim());
    }
    if (request.getDescription() != null) {
      promotion.setDescription(request.getDescription());
    }
    if (request.getType() != null) {
      promotion.setType(request.getType());
    }
    if (request.getScope() != null) {
      promotion.setScope(request.getScope());
    }

    // Update type-specific fields
    if (request.getType() != null
        || request.getDiscountType() != null
        || request.getDiscountValue() != null) {
      if (promotion.getType() == PromotionType.DISCOUNT) {
        if (request.getDiscountType() != null) {
          promotion.setDiscountType(request.getDiscountType());
        }
        if (request.getDiscountValue() != null) {
          if (promotion.getDiscountType() == DiscountType.PERCENTAGE
              && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new AppException(
                "Phần trăm giảm giá không được vượt quá 100%", ErrorCode.VALIDATION_ERROR);
          }
          promotion.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinPurchase() != null) {
          promotion.setMinPurchase(request.getMinPurchase());
        }
        if (request.getMaxDiscount() != null) {
          promotion.setMaxDiscount(request.getMaxDiscount());
        }
      } else if (promotion.getType() == PromotionType.BUY_X_GET_Y) {
        if (request.getBuyQuantity() != null) {
          promotion.setBuyQuantity(request.getBuyQuantity());
        }
        if (request.getGetQuantity() != null) {
          promotion.setGetQuantity(request.getGetQuantity());
        }
      } else if (promotion.getType() == PromotionType.BUY_X_PAY_Y) {
        if (request.getBuyQuantity() != null) {
          promotion.setBuyQuantity(request.getBuyQuantity());
        }
        if (request.getPayQuantity() != null) {
          promotion.setPayQuantity(request.getPayQuantity());
        }
      }
    }

    // Update scope-specific fields
    if (request.getScope() != null) {
      if (request.getScope() == PromotionScope.PRODUCT) {
        if (request.getProductIds() != null) {
          Set<Product> products = new HashSet<>();
          for (Long productId : request.getProductIds()) {
            Product product =
                productRepository
                    .findById(productId)
                    .orElseThrow(
                        () ->
                            new ResourceNotFoundException(
                                "Sản phẩm với ID " + productId + " không tồn tại"));
            products.add(product);
          }
          promotion.setProducts(products);
        }
      } else if (request.getScope() == PromotionScope.CATEGORY) {
        if (request.getCategoryId() != null) {
          Category category =
              categoryRepository
                  .findById(request.getCategoryId())
                  .orElseThrow(
                      () ->
                          new ResourceNotFoundException(
                              "Danh mục với ID " + request.getCategoryId() + " không tồn tại"));
          promotion.setCategory(category);
        }
      }
    }

    if (request.getValidFrom() != null) {
      promotion.setValidFrom(request.getValidFrom());
    }
    if (request.getValidUntil() != null) {
      promotion.setValidUntil(request.getValidUntil());
    }
    if (request.getUsageLimit() != null) {
      promotion.setUsageLimit(request.getUsageLimit());
    }
    if (request.getIsActive() != null) {
      promotion.setIsActive(request.getIsActive());
    }

    // Validate date range after update
    if (promotion.getValidUntil().isBefore(promotion.getValidFrom())) {
      throw new AppException("Ngày kết thúc phải sau ngày bắt đầu", ErrorCode.VALIDATION_ERROR);
    }

    // Validate: ORDER scope chỉ cho phép DISCOUNT type
    if (promotion.getScope() == PromotionScope.ORDER
        && promotion.getType() != PromotionType.DISCOUNT) {
      throw new AppException(
          "Phạm vi 'Toàn bộ đơn hàng' chỉ hỗ trợ loại khuyến mãi 'Giảm giá'",
          ErrorCode.VALIDATION_ERROR);
    }

    // Validate configuration
    if (!promotion.isValidConfiguration()) {
      throw new AppException("Cấu hình khuyến mãi không hợp lệ", ErrorCode.VALIDATION_ERROR);
    }

    Promotion updatedPromotion = promotionRepository.save(promotion);
    return promotionMapper.toResponse(updatedPromotion);
  }

  @Transactional
  @SuppressWarnings("null")
  public void deletePromotion(Long id) {
    Promotion promotion =
        promotionRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));
    promotionRepository.delete(promotion);
  }

  @Transactional(readOnly = true)
  public List<PromotionResponse> getActivePromotions() {
    List<Promotion> promotions = promotionRepository.findActivePromotions(LocalDateTime.now());
    return promotions.stream().map(promotionMapper::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public CartPromotionPreviewResponse previewCartPromotions(Long userId) {
    userRepository
        .findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

    Cart cart =
        cartRepository
            .findByUserIdWithItems(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng trống"));

    if (cart.getItems().isEmpty()) {
      return CartPromotionPreviewResponse.builder()
          .originalTotal(BigDecimal.ZERO)
          .promotionDiscount(BigDecimal.ZERO)
          .shippingFee(SHIPPING_FEE)
          .freeShippingThreshold(FREE_SHIPPING_THRESHOLD)
          .finalTotal(SHIPPING_FEE)
          .itemPromotions(new ArrayList<>())
          .freeItems(new ArrayList<>())
          .build();
    }

    LocalDateTime now = LocalDateTime.now();
    BigDecimal originalTotal = BigDecimal.ZERO;
    BigDecimal totalPromotionDiscount = BigDecimal.ZERO;
    List<CartPromotionPreviewResponse.ItemPromotion> itemPromotions = new ArrayList<>();
    List<CartPromotionPreviewResponse.FreeItem> freeItems = new ArrayList<>();

    // Tính tổng tiền gốc trước
    for (CartItem cartItem : cart.getItems()) {
      Product product = cartItem.getProduct();
      BigDecimal itemSubtotal =
          product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
      originalTotal = originalTotal.add(itemSubtotal);
    }

    // Lấy khuyến mãi ORDER scope (áp dụng cho toàn bộ đơn hàng)
    List<Promotion> orderPromotions = promotionRepository.findActivePromotionsForOrder(now);
    Promotion appliedOrderPromotion = null;
    BigDecimal orderDiscountAmount = BigDecimal.ZERO;

    // Áp dụng khuyến mãi ORDER scope (chỉ áp dụng 1 khuyến mãi tốt nhất)
    for (Promotion promotion : orderPromotions) {
      if (promotion.getType() == PromotionType.DISCOUNT) {
        // Kiểm tra điều kiện minPurchase
        if (promotion.getMinPurchase() != null
            && originalTotal.compareTo(promotion.getMinPurchase()) < 0) {
          continue;
        }

        BigDecimal discount = calculateDiscountAmount(promotion, originalTotal);
        if (discount.compareTo(orderDiscountAmount) > 0) {
          appliedOrderPromotion = promotion;
          orderDiscountAmount = discount;
        }
      }
    }

    if (appliedOrderPromotion != null) {
      totalPromotionDiscount = totalPromotionDiscount.add(orderDiscountAmount);
    }

    // Xử lý từng item trong giỏ hàng
    for (CartItem cartItem : cart.getItems()) {
      Product product = cartItem.getProduct();
      BigDecimal itemSubtotal =
          product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

      // Find promotions for this product (PRODUCT scope)
      List<Promotion> productPromotions =
          new ArrayList<>(promotionRepository.findActivePromotionsForProduct(product.getId(), now));

      // Also check category promotions (CATEGORY scope)
      if (product.getCategory() != null) {
        List<Promotion> categoryPromotions =
            promotionRepository.findActivePromotionsForCategory(product.getCategory().getId(), now);
        productPromotions.addAll(categoryPromotions);
      }

      Promotion appliedPromotion = null;
      int freeQuantity = 0;
      BigDecimal discountAmount = BigDecimal.ZERO;

      // Apply first valid promotion (ưu tiên BOGO/BUY_X_GET_Y/BUY_X_PAY_Y trước, sau đó DISCOUNT)
      for (Promotion promotion : productPromotions) {
        if (promotion.getType() == PromotionType.BOGO) {
          // Buy 1 Get 1 Free - mua bao nhiêu tặng bấy nhiêu
          int qty = cartItem.getQuantity(); // Mua 1 tặng 1, mua 2 tặng 2, ...
          if (qty > 0) {
            appliedPromotion = promotion;
            freeQuantity = qty;
            discountAmount = product.getPrice().multiply(BigDecimal.valueOf(freeQuantity));
            break;
          }
        } else if (promotion.getType() == PromotionType.BUY_X_GET_Y) {
          // Buy X Get Y - for every (X+Y) items, Y are free
          int sets =
              cartItem.getQuantity() / (promotion.getBuyQuantity() + promotion.getGetQuantity());
          int qty = sets * promotion.getGetQuantity();
          if (qty > 0) {
            appliedPromotion = promotion;
            freeQuantity = qty;
            discountAmount = product.getPrice().multiply(BigDecimal.valueOf(freeQuantity));
            break;
          }
        } else if (promotion.getType() == PromotionType.BUY_X_PAY_Y) {
          // Buy X Pay Y - for every X items, only pay for Y
          int sets = cartItem.getQuantity() / promotion.getBuyQuantity();
          int paidQuantity = sets * promotion.getPayQuantity();
          int remainder = cartItem.getQuantity() % promotion.getBuyQuantity();
          paidQuantity += remainder;
          int qty = cartItem.getQuantity() - paidQuantity;
          if (qty > 0) {
            appliedPromotion = promotion;
            freeQuantity = qty;
            discountAmount = product.getPrice().multiply(BigDecimal.valueOf(freeQuantity));
            break;
          }
        } else if (promotion.getType() == PromotionType.DISCOUNT) {
          // DISCOUNT type cho PRODUCT/CATEGORY scope
          // Kiểm tra điều kiện minPurchase
          if (promotion.getMinPurchase() != null
              && itemSubtotal.compareTo(promotion.getMinPurchase()) < 0) {
            continue;
          }

          BigDecimal discount = calculateDiscountAmount(promotion, itemSubtotal);
          if (discount.compareTo(BigDecimal.ZERO) > 0) {
            appliedPromotion = promotion;
            discountAmount = discount;
            break;
          }
        }
      }

      // Get primary image
      String productImage = null;
      if (product.getImages() != null && !product.getImages().isEmpty()) {
        productImage =
            product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(product.getImages().iterator().next().getImageUrl());
      }

      // Build item promotion info
      CartPromotionPreviewResponse.ItemPromotion itemPromo =
          CartPromotionPreviewResponse.ItemPromotion.builder()
              .productId(product.getId())
              .productName(product.getName())
              .productImage(productImage)
              .price(product.getPrice())
              .quantity(cartItem.getQuantity())
              .subtotal(itemSubtotal)
              .promotionId(appliedPromotion != null ? appliedPromotion.getId() : null)
              .promotionName(appliedPromotion != null ? appliedPromotion.getName() : null)
              .promotionType(appliedPromotion != null ? appliedPromotion.getType() : null)
              .freeQuantity(freeQuantity)
              .discountAmount(discountAmount)
              .build();
      itemPromotions.add(itemPromo);

      // Add to free items list if has promotion (BOGO, BUY_X_GET_Y, BUY_X_PAY_Y)
      if (appliedPromotion != null && freeQuantity > 0) {
        CartPromotionPreviewResponse.FreeItem freeItem =
            CartPromotionPreviewResponse.FreeItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productImage(productImage)
                .originalPrice(product.getPrice())
                .freeQuantity(freeQuantity)
                .promotionId(appliedPromotion.getId())
                .promotionName(appliedPromotion.getName())
                .promotionType(appliedPromotion.getType())
                .build();
        freeItems.add(freeItem);

        // Only BUY_X_PAY_Y reduces the total (you pay less for what you buy)
        // BOGO and BUY_X_GET_Y give free items (added to order, not reducing price)
        if (appliedPromotion.getType() == PromotionType.BUY_X_PAY_Y) {
          totalPromotionDiscount = totalPromotionDiscount.add(discountAmount);
        }
      }

      // Add DISCOUNT type discount to total
      if (appliedPromotion != null
          && appliedPromotion.getType() == PromotionType.DISCOUNT
          && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
        totalPromotionDiscount = totalPromotionDiscount.add(discountAmount);
      }
    }

    BigDecimal subtotalAfterDiscount = originalTotal.subtract(totalPromotionDiscount);
    if (subtotalAfterDiscount.compareTo(BigDecimal.ZERO) < 0) {
      subtotalAfterDiscount = BigDecimal.ZERO;
    }

    // Calculate shipping fee (free if subtotal >= 500k)
    BigDecimal shippingFee =
        subtotalAfterDiscount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
            ? BigDecimal.ZERO
            : SHIPPING_FEE;

    BigDecimal finalTotal = subtotalAfterDiscount.add(shippingFee);

    return CartPromotionPreviewResponse.builder()
        .originalTotal(originalTotal)
        .promotionDiscount(totalPromotionDiscount)
        .shippingFee(shippingFee)
        .freeShippingThreshold(FREE_SHIPPING_THRESHOLD)
        .finalTotal(finalTotal)
        .itemPromotions(itemPromotions)
        .freeItems(freeItems)
        .appliedOrderPromotion(
            appliedOrderPromotion != null ? promotionMapper.toResponse(appliedOrderPromotion) : null)
        .orderDiscountAmount(orderDiscountAmount)
        .build();
  }

  // Helper method to calculate discount amount based on promotion type
  private BigDecimal calculateDiscountAmount(Promotion promotion, BigDecimal amount) {
    BigDecimal discount;
    if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
      discount =
          amount.multiply(promotion.getDiscountValue()).divide(BigDecimal.valueOf(100));
      // Apply max discount cap if set
      if (promotion.getMaxDiscount() != null
          && discount.compareTo(promotion.getMaxDiscount()) > 0) {
        discount = promotion.getMaxDiscount();
      }
    } else {
      // FIXED amount
      discount = promotion.getDiscountValue();
      // Don't discount more than the amount
      if (discount.compareTo(amount) > 0) {
        discount = amount;
      }
    }
    return discount;
  }

  // Helper method to validate promotion configuration
  private void validatePromotionConfiguration(CreatePromotionRequest request) {
    // Validate: ORDER scope chỉ cho phép DISCOUNT type
    if (request.getScope() == PromotionScope.ORDER
        && request.getType() != PromotionType.DISCOUNT) {
      throw new AppException(
          "Phạm vi 'Toàn bộ đơn hàng' chỉ hỗ trợ loại khuyến mãi 'Giảm giá'",
          ErrorCode.VALIDATION_ERROR);
    }

    if (request.getType() == PromotionType.DISCOUNT) {
      if (request.getDiscountType() == null || request.getDiscountValue() == null) {
        throw new AppException(
            "Loại giảm giá phải có loại giảm giá và giá trị giảm giá", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getDiscountType() == DiscountType.PERCENTAGE
          && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
        throw new AppException(
            "Phần trăm giảm giá không được vượt quá 100%", ErrorCode.VALIDATION_ERROR);
      }
    } else if (request.getType() == PromotionType.BOGO) {
      // BOGO is automatically set to buyQuantity=1, getQuantity=1
    } else if (request.getType() == PromotionType.BUY_X_GET_Y) {
      if (request.getBuyQuantity() == null || request.getBuyQuantity() <= 0) {
        throw new AppException(
            "Loại mua X tặng Y phải có số lượng mua > 0", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getGetQuantity() == null || request.getGetQuantity() < 0) {
        throw new AppException(
            "Loại mua X tặng Y phải có số lượng tặng >= 0", ErrorCode.VALIDATION_ERROR);
      }
    } else if (request.getType() == PromotionType.BUY_X_PAY_Y) {
      if (request.getBuyQuantity() == null || request.getBuyQuantity() <= 0) {
        throw new AppException(
            "Loại mua X trả Y phải có số lượng mua > 0", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getPayQuantity() == null || request.getPayQuantity() <= 0) {
        throw new AppException(
            "Loại mua X trả Y phải có số lượng tính tiền > 0", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getPayQuantity() >= request.getBuyQuantity()) {
        throw new AppException(
            "Số lượng tính tiền phải nhỏ hơn số lượng mua", ErrorCode.VALIDATION_ERROR);
      }
    }
  }
}
