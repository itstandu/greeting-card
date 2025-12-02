package iuh.fit.se.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.AddToCartRequest;
import iuh.fit.se.dto.request.SyncCartRequest;
import iuh.fit.se.dto.request.UpdateCartItemRequest;
import iuh.fit.se.dto.response.CartItemResponse;
import iuh.fit.se.dto.response.CartResponse;
import iuh.fit.se.dto.response.CartSummaryResponse;
import iuh.fit.se.dto.response.ProductImageResponse;
import iuh.fit.se.dto.response.ProductResponse;
import iuh.fit.se.entity.Cart;
import iuh.fit.se.entity.CartItem;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.User;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.repository.CartItemRepository;
import iuh.fit.se.repository.CartRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CartService {
  private final CartRepository cartRepository;
  private final CartItemRepository cartItemRepository;
  private final ProductRepository productRepository;
  private final UserRepository userRepository;

  @Transactional
  public CartResponse getCart(Long userId) {
    Cart cart = getOrCreateCart(userId);
    return mapToCartResponse(cart);
  }

  // Lấy giỏ hàng theo cartId (dùng cho admin)
  @Transactional(readOnly = true)
  public CartResponse getCartById(Long cartId) {
    Cart cart =
        cartRepository
            .findByIdWithItems(cartId)
            .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));
    return mapToCartResponse(cart);
  }

  // Thêm sản phẩm vào giỏ hàng
  public CartResponse addToCart(Long userId, AddToCartRequest request) {
    Cart cart = getOrCreateCart(userId);
    Product product = getProductOrThrow(request.getProductId());

    // Validate stock
    if (product.getStock() < request.getQuantity()) {
      throw new IllegalArgumentException(
          "Sản phẩm không đủ số lượng trong kho. Còn lại: " + product.getStock());
    }

    // Check if product already exists in cart
    CartItem existingItem =
        cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).orElse(null);

    if (existingItem != null) {
      // Update quantity
      int newQuantity = existingItem.getQuantity() + request.getQuantity();
      if (product.getStock() < newQuantity) {
        throw new IllegalArgumentException(
            "Không thể thêm. Tồn kho chỉ còn: " + product.getStock());
      }
      existingItem.setQuantity(newQuantity);
      cartItemRepository.save(existingItem);
    } else {
      // Add new item
      CartItem newItem = new CartItem();
      newItem.setCart(cart);
      newItem.setProduct(product);
      newItem.setQuantity(request.getQuantity());
      cart.addItem(newItem);
      cartItemRepository.save(newItem);
    }

    log.info("Added product {} to cart for user {}", request.getProductId(), userId);

    return mapToCartResponse(cart);
  }

  // Cập nhật số lượng của item trong giỏ hàng (quantity = 0 sẽ xóa item)
  public CartResponse updateCartItem(Long userId, Long productId, UpdateCartItemRequest request) {
    Cart cart = getCartByUserIdOrThrow(userId);

    CartItem cartItem =
        cartItemRepository
            .findByCartIdAndProductId(cart.getId(), productId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));

    if (request.getQuantity() == 0) {
      // Remove item
      cart.removeItem(cartItem);
      cartItemRepository.delete(cartItem);
      log.info("Removed product {} from cart for user {}", productId, userId);
    } else {
      // Update quantity
      Product product = cartItem.getProduct();
      if (product.getStock() < request.getQuantity()) {
        throw new IllegalArgumentException(
            "Số lượng vượt quá tồn kho. Còn lại: " + product.getStock());
      }
      cartItem.setQuantity(request.getQuantity());
      cartItemRepository.save(cartItem);
      log.info(
          "Updated product {} quantity to {} in cart for user {}",
          productId,
          request.getQuantity(),
          userId);
    }

    return mapToCartResponse(cart);
  }

  // Xóa item khỏi giỏ hàng
  public void removeCartItem(Long userId, Long productId) {
    Cart cart = getCartByUserIdOrThrow(userId);

    CartItem cartItem =
        cartItemRepository
            .findByCartIdAndProductId(cart.getId(), productId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));

    cart.removeItem(cartItem);
    cartItemRepository.delete(cartItem);

    log.info("Removed product {} from cart for user {}", productId, userId);
  }

  // Xóa toàn bộ giỏ hàng
  public void clearCart(Long userId) {
    Cart cart = getCartByUserIdOrThrow(userId);
    cart.clearItems();
    cartItemRepository.deleteAll(cart.getItems());
    log.info("Cleared cart for user {}", userId);
  }

  // Sync giỏ hàng từ localStorage lên server khi user login (merge với cart hiện tại)
  public CartResponse syncCart(Long userId, SyncCartRequest request) {
    Cart cart = getOrCreateCart(userId);

    for (SyncCartRequest.CartItemData item : request.getItems()) {
      Product product = getProductOrThrow(item.getProductId());

      // Skip if out of stock
      if (product.getStock() < item.getQuantity()) {
        log.warn(
            "Skipping product {} - out of stock. Requested: {}, Available: {}",
            item.getProductId(),
            item.getQuantity(),
            product.getStock());
        continue;
      }

      CartItem existingItem =
          cartItemRepository
              .findByCartIdAndProductId(cart.getId(), item.getProductId())
              .orElse(null);

      if (existingItem != null) {
        // Merge: cộng dồn số lượng, nhưng không vượt quá stock
        int newQuantity =
            Math.min(existingItem.getQuantity() + item.getQuantity(), product.getStock());
        existingItem.setQuantity(newQuantity);
        cartItemRepository.save(existingItem);
      } else {
        // Add new item
        CartItem newItem = new CartItem();
        newItem.setCart(cart);
        newItem.setProduct(product);
        newItem.setQuantity(Math.min(item.getQuantity(), product.getStock()));
        cart.addItem(newItem);
        cartItemRepository.save(newItem);
      }
    }

    log.info("Synced cart from localStorage for user {}", userId);

    return mapToCartResponse(cart);
  }

  // === Helper Methods ===

  private Cart getOrCreateCart(Long userId) {
    return cartRepository
        .findByUserIdWithItems(userId)
        .orElseGet(
            () -> {
              User user =
                  userRepository
                      .findById(userId)
                      .orElseThrow(() -> new ResourceNotFoundException("User not found"));
              Cart newCart = new Cart();
              newCart.setUser(user);
              return cartRepository.save(newCart);
            });
  }

  private Cart getCartByUserIdOrThrow(Long userId) {
    return cartRepository
        .findByUserIdWithItems(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));
  }

  private Product getProductOrThrow(Long productId) {
    return productRepository
        .findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
  }

  private CartResponse mapToCartResponse(Cart cart) {
    List<CartItemResponse> items =
        cart.getItems().stream().map(this::mapToCartItemResponse).collect(Collectors.toList());

    return new CartResponse(cart.getId(), items);
  }

  private CartItemResponse mapToCartItemResponse(CartItem item) {
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
            null, // inWishlist - not needed in cart context
            true // inCart - item is in cart since it's a cart item
            );

    return new CartItemResponse(item.getId(), productResponse, item.getQuantity());
  }

  // Admin: Lấy tất cả giỏ hàng (phân trang)
  @Transactional(readOnly = true)
  public Page<CartSummaryResponse> getAllCarts(Pageable pageable) {
    Page<Cart> carts = cartRepository.findAllWithUserAndItems(pageable);
    return carts.map(this::mapToCartSummary);
  }

  // Admin: Tìm kiếm giỏ hàng theo email hoặc tên user
  @Transactional(readOnly = true)
  public Page<CartSummaryResponse> searchCarts(String keyword, Pageable pageable) {
    Page<Cart> carts = cartRepository.searchCarts(keyword, pageable);
    return carts.map(this::mapToCartSummary);
  }

  private CartSummaryResponse mapToCartSummary(Cart cart) {
    int totalItems = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();

    BigDecimal totalAmount =
        cart.getItems().stream()
            .map(
                item ->
                    item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    return CartSummaryResponse.builder()
        .id(cart.getId())
        .userId(cart.getUser().getId())
        .userEmail(cart.getUser().getEmail())
        .userFullName(cart.getUser().getFullName())
        .totalItems(totalItems)
        .totalAmount(totalAmount)
        .updatedAt(cart.getUpdatedAt())
        .build();
  }
}
