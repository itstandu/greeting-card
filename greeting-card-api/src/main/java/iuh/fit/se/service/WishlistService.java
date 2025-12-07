package iuh.fit.se.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.AddToWishlistRequest;
import iuh.fit.se.dto.request.SyncWishlistRequest;
import iuh.fit.se.dto.response.ProductImageResponse;
import iuh.fit.se.dto.response.ProductResponse;
import iuh.fit.se.dto.response.WishlistItemResponse;
import iuh.fit.se.dto.response.WishlistResponse;
import iuh.fit.se.dto.response.WishlistSummaryResponse;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.Wishlist;
import iuh.fit.se.entity.WishlistItem;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.UserRepository;
import iuh.fit.se.repository.WishlistItemRepository;
import iuh.fit.se.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class WishlistService {
  private final WishlistRepository wishlistRepository;
  private final WishlistItemRepository wishlistItemRepository;
  private final ProductRepository productRepository;
  private final UserRepository userRepository;

  @Transactional
  public WishlistResponse getWishlist(Long userId) {
    Wishlist wishlist = getOrCreateWishlist(userId);
    return mapToWishlistResponse(wishlist);
  }

  // Lấy wishlist theo wishlistId (dùng cho admin)
  @Transactional(readOnly = true)
  public WishlistResponse getWishlistById(Long wishlistId) {
    Wishlist wishlist =
        wishlistRepository
            .findByIdWithItems(wishlistId)
            .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích không tồn tại"));
    return mapToWishlistResponse(wishlist);
  }

  // Thêm sản phẩm vào wishlist
  public WishlistResponse addToWishlist(Long userId, AddToWishlistRequest request) {
    Wishlist wishlist = getOrCreateWishlist(userId);
    Product product = getProductOrThrow(request.getProductId());

    // Check if product already exists in wishlist
    boolean exists =
        wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), product.getId());

    if (exists) {
      throw new IllegalArgumentException("Sản phẩm đã có trong danh sách yêu thích");
    }

    // Add new item
    WishlistItem newItem = new WishlistItem();
    newItem.setWishlist(wishlist);
    newItem.setProduct(product);
    wishlist.addItem(newItem);
    wishlistItemRepository.save(newItem);

    log.info("Added product {} to wishlist for user {}", request.getProductId(), userId);

    return mapToWishlistResponse(wishlist);
  }

  // Xóa item khỏi wishlist
  @SuppressWarnings("null")
  public void removeWishlistItem(Long userId, Long productId) {
    Wishlist wishlist = getWishlistByUserIdOrThrow(userId);

    WishlistItem wishlistItem =
        wishlistItemRepository
            .findByWishlistIdAndProductId(wishlist.getId(), productId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Sản phẩm không có trong danh sách yêu thích"));

    wishlist.removeItem(wishlistItem);
    wishlistItemRepository.delete(wishlistItem);

    log.info("Removed product {} from wishlist for user {}", productId, userId);
  }

  // Xóa toàn bộ wishlist
  @SuppressWarnings("null")
  public void clearWishlist(Long userId) {
    Wishlist wishlist = getWishlistByUserIdOrThrow(userId);
    wishlist.clearItems();
    wishlistItemRepository.deleteAll(wishlist.getItems());
    log.info("Cleared wishlist for user {}", userId);
  }

  // Sync wishlist từ localStorage lên server khi user login
  public WishlistResponse syncWishlist(Long userId, SyncWishlistRequest request) {
    Wishlist wishlist = getOrCreateWishlist(userId);

    for (SyncWishlistRequest.ProductIdData item : request.getProductIds()) {
      Product product = getProductOrThrow(item.getProductId());

      // Check if already exists
      boolean exists =
          wishlistItemRepository.existsByWishlistIdAndProductId(
              wishlist.getId(), item.getProductId());

      if (!exists) {
        // Add new item
        WishlistItem newItem = new WishlistItem();
        newItem.setWishlist(wishlist);
        newItem.setProduct(product);
        wishlist.addItem(newItem);
        wishlistItemRepository.save(newItem);
      }
    }

    log.info("Synced wishlist from localStorage for user {}", userId);

    return mapToWishlistResponse(wishlist);
  }

  // Check if product is in wishlist
  @Transactional(readOnly = true)
  public boolean isInWishlist(Long userId, Long productId) {
    Wishlist wishlist = wishlistRepository.findByUserId(userId).orElse(null);
    if (wishlist == null) {
      return false;
    }
    return wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), productId);
  }

  // === Helper Methods ===

  @SuppressWarnings("null")
  private Wishlist getOrCreateWishlist(Long userId) {
    return wishlistRepository
        .findByUserIdWithItems(userId)
        .orElseGet(
            () -> {
              User user =
                  userRepository
                      .findById(userId)
                      .orElseThrow(() -> new ResourceNotFoundException("User not found"));
              Wishlist newWishlist = new Wishlist();
              newWishlist.setUser(user);
              return wishlistRepository.save(newWishlist);
            });
  }

  private Wishlist getWishlistByUserIdOrThrow(Long userId) {
    return wishlistRepository
        .findByUserIdWithItems(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích không tồn tại"));
  }

  @SuppressWarnings("null")
  private Product getProductOrThrow(Long productId) {
    return productRepository
        .findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
  }

  private WishlistResponse mapToWishlistResponse(Wishlist wishlist) {
    List<WishlistItemResponse> items =
        wishlist.getItems().stream()
            .map(this::mapToWishlistItemResponse)
            .collect(Collectors.toList());

    return new WishlistResponse(wishlist.getId(), items);
  }

  private WishlistItemResponse mapToWishlistItemResponse(WishlistItem item) {
    Product product = item.getProduct();

    // Map product images
    List<ProductImageResponse> images =
        product.getImages().stream()
            .map(
                img ->
                    new ProductImageResponse(
                        img.getId(),
                        img.getImageUrl(),
                        img.getAltText(),
                        img.getIsPrimary(),
                        img.getDisplayOrder()))
            .collect(Collectors.toList());

    ProductResponse productResponse =
        new ProductResponse(
            product.getId(),
            product.getName(),
            product.getSlug(),
            product.getDescription(),
            product.getPrice(),
            product.getStock(),
            product.getSku(),
            product.getIsActive(),
            product.getIsFeatured(),
            null, // category
            images, // images
            null, // tags
            product.getCreatedAt(),
            product.getUpdatedAt(),
            true, // inWishlist - item is in wishlist since it's a wishlist item
            null // inCart - not needed in wishlist context
            );

    return new WishlistItemResponse(item.getId(), productResponse, item.getAddedAt());
  }

  // Admin: Lấy tất cả wishlist (phân trang)
  @Transactional(readOnly = true)
  public Page<WishlistSummaryResponse> getAllWishlists(Pageable pageable) {
    Page<Wishlist> wishlists = wishlistRepository.findAllWithUserAndItems(pageable);
    return wishlists.map(this::mapToWishlistSummary);
  }

  // Admin: Tìm kiếm wishlist theo email hoặc tên user
  @Transactional(readOnly = true)
  public Page<WishlistSummaryResponse> searchWishlists(String keyword, Pageable pageable) {
    Page<Wishlist> wishlists = wishlistRepository.searchWishlists(keyword, pageable);
    return wishlists.map(this::mapToWishlistSummary);
  }

  private WishlistSummaryResponse mapToWishlistSummary(Wishlist wishlist) {
    int totalItems = wishlist.getItems().size();

    return WishlistSummaryResponse.builder()
        .id(wishlist.getId())
        .userId(wishlist.getUser().getId())
        .userEmail(wishlist.getUser().getEmail())
        .userFullName(wishlist.getUser().getFullName())
        .totalItems(totalItems)
        .updatedAt(wishlist.getUpdatedAt())
        .build();
  }
}
