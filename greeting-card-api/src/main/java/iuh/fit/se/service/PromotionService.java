package iuh.fit.se.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import iuh.fit.se.dto.response.PromotionResponse;
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
import iuh.fit.se.repository.CategoryRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PromotionService {
  private final PromotionRepository promotionRepository;
  private final PromotionMapper promotionMapper;
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;

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
            .orElseThrow(() -> new ResourceNotFoundException("Promotion không tồn tại"));
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
            "Phải chọn ít nhất một sản phẩm cho promotion loại PRODUCT",
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
            "Phải chọn danh mục cho promotion loại CATEGORY", ErrorCode.VALIDATION_ERROR);
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
            .orElseThrow(() -> new ResourceNotFoundException("Promotion không tồn tại"));

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

    // Validate configuration
    if (!promotion.isValidConfiguration()) {
      throw new AppException("Cấu hình promotion không hợp lệ", ErrorCode.VALIDATION_ERROR);
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
            .orElseThrow(() -> new ResourceNotFoundException("Promotion không tồn tại"));
    promotionRepository.delete(promotion);
  }

  @Transactional(readOnly = true)
  public List<PromotionResponse> getActivePromotions() {
    List<Promotion> promotions = promotionRepository.findActivePromotions(LocalDateTime.now());
    return promotions.stream().map(promotionMapper::toResponse).toList();
  }

  // Helper method to validate promotion configuration
  private void validatePromotionConfiguration(CreatePromotionRequest request) {
    if (request.getType() == PromotionType.DISCOUNT) {
      if (request.getDiscountType() == null || request.getDiscountValue() == null) {
        throw new AppException(
            "DISCOUNT type phải có discountType và discountValue", ErrorCode.VALIDATION_ERROR);
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
            "BUY_X_GET_Y type phải có buyQuantity > 0", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getGetQuantity() == null || request.getGetQuantity() <= 0) {
        throw new AppException(
            "BUY_X_GET_Y type phải có getQuantity > 0", ErrorCode.VALIDATION_ERROR);
      }
    } else if (request.getType() == PromotionType.BUY_X_PAY_Y) {
      if (request.getBuyQuantity() == null || request.getBuyQuantity() <= 0) {
        throw new AppException(
            "BUY_X_PAY_Y type phải có buyQuantity > 0", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getPayQuantity() == null || request.getPayQuantity() <= 0) {
        throw new AppException(
            "BUY_X_PAY_Y type phải có payQuantity > 0", ErrorCode.VALIDATION_ERROR);
      }
      if (request.getPayQuantity() >= request.getBuyQuantity()) {
        throw new AppException("payQuantity phải nhỏ hơn buyQuantity", ErrorCode.VALIDATION_ERROR);
      }
    }
  }
}
