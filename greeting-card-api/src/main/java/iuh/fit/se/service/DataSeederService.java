package iuh.fit.se.service;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import iuh.fit.se.entity.Category;
import iuh.fit.se.entity.Coupon;
import iuh.fit.se.entity.Notification;
import iuh.fit.se.entity.Order;
import iuh.fit.se.entity.OrderItem;
import iuh.fit.se.entity.OrderStatusHistory;
import iuh.fit.se.entity.PaymentMethod;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.ProductImage;
import iuh.fit.se.entity.ProductReview;
import iuh.fit.se.entity.ProductTag;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.UserAddress;
import iuh.fit.se.entity.Wishlist;
import iuh.fit.se.entity.WishlistItem;
import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.NotificationType;
import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.entity.enumeration.PaymentStatus;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.repository.CategoryRepository;
import iuh.fit.se.repository.CouponRepository;
import iuh.fit.se.repository.NotificationRepository;
import iuh.fit.se.repository.OrderItemRepository;
import iuh.fit.se.repository.OrderRepository;
import iuh.fit.se.repository.OrderStatusHistoryRepository;
import iuh.fit.se.repository.PaymentMethodRepository;
import iuh.fit.se.repository.ProductImageRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.ProductReviewRepository;
import iuh.fit.se.repository.ProductTagRepository;
import iuh.fit.se.repository.UserAddressRepository;
import iuh.fit.se.repository.UserRepository;
import iuh.fit.se.repository.WishlistItemRepository;
import iuh.fit.se.repository.WishlistRepository;
import iuh.fit.se.util.CloudinaryFolder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSeederService {

  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;
  private final ProductRepository productRepository;
  private final ProductTagRepository productTagRepository;
  private final ProductImageRepository productImageRepository;
  private final ProductReviewRepository productReviewRepository;
  private final PaymentMethodRepository paymentMethodRepository;
  private final CouponRepository couponRepository;
  private final UserAddressRepository userAddressRepository;
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final OrderStatusHistoryRepository orderStatusHistoryRepository;
  private final WishlistRepository wishlistRepository;
  private final WishlistItemRepository wishlistItemRepository;
  private final NotificationRepository notificationRepository;

  private final PasswordEncoder passwordEncoder;
  private final CloudinaryService cloudinaryService;

  @PersistenceContext private EntityManager entityManager;

  private Faker faker;
  private User adminUser;
  private Random random = new Random();

  @Transactional(rollbackFor = Exception.class)
  public void seedAll() {
    log.info("=== Bắt đầu seed data ===");
    faker = new Faker(new java.util.Locale("vi"));

    try {
      // Xóa sạch dữ liệu cũ
      clearAllData();
      log.info("Đã xóa sạch dữ liệu cũ");

      // Seed theo thứ tự dependency
      seedUsers();
      entityManager.flush();
      log.info("✓ Users seeded");

      seedPaymentMethods();
      entityManager.flush();
      log.info("✓ PaymentMethods seeded");

      seedCategories();
      entityManager.flush();
      log.info("✓ Categories seeded");

      seedProductTags();
      entityManager.flush();
      log.info("✓ ProductTags seeded");

      seedProducts();
      entityManager.flush();
      log.info("✓ Products seeded");

      seedCoupons();
      entityManager.flush();
      log.info("✓ Coupons seeded");

      seedUserAddresses();
      entityManager.flush();
      log.info("✓ UserAddresses seeded");

      seedOrders();
      entityManager.flush();
      log.info("✓ Orders seeded");

      seedProductReviews();
      entityManager.flush();
      log.info("✓ ProductReviews seeded");

      seedWishlists();
      entityManager.flush();
      log.info("✓ Wishlists seeded");

      seedNotifications();
      entityManager.flush();
      log.info("✓ Notifications seeded");

      log.info("=== Hoàn thành seed data ===");
    } catch (Exception e) {
      log.error("Lỗi khi seed data: {}", e.getMessage(), e);
      e.printStackTrace();
      throw new RuntimeException("Lỗi khi seed data: " + e.getMessage(), e);
    }
  }

  @Transactional
  public void clearAllData() {
    log.info("Đang xóa sạch dữ liệu cũ...");

    // Sử dụng native query để hard delete (xóa cả soft deleted records)
    // Xóa theo thứ tự dependency để tránh foreign key constraint violation

    // 1. Xóa các bảng không có foreign key dependency
    entityManager.createNativeQuery("DELETE FROM notifications").executeUpdate();
    entityManager.createNativeQuery("DELETE FROM wishlist_items").executeUpdate();
    entityManager.createNativeQuery("DELETE FROM wishlists").executeUpdate();
    entityManager.createNativeQuery("DELETE FROM product_reviews").executeUpdate();
    entityManager.createNativeQuery("DELETE FROM order_status_history").executeUpdate();
    entityManager.createNativeQuery("DELETE FROM order_items").executeUpdate();

    // 2. Xóa payments trước (có FK đến orders và payment_methods)
    entityManager.createNativeQuery("DELETE FROM payments").executeUpdate();

    // 3. Xóa orders (có FK đến users, payment_methods, coupons, user_addresses)
    entityManager.createNativeQuery("DELETE FROM orders").executeUpdate();

    // 4. Xóa user_addresses (có FK đến users)
    entityManager.createNativeQuery("DELETE FROM user_addresses").executeUpdate();

    // 5. Xóa product_images (có FK đến products)
    entityManager.createNativeQuery("DELETE FROM product_images").executeUpdate();

    // 6. Xóa product_tag_map (bảng trung gian)
    entityManager.createNativeQuery("DELETE FROM product_tag_map").executeUpdate();

    // 7. Xóa products (có FK đến categories)
    entityManager.createNativeQuery("DELETE FROM products").executeUpdate();

    // 8. Xóa categories (có self-reference)
    entityManager.createNativeQuery("DELETE FROM categories").executeUpdate();

    // 9. Xóa product_tags
    entityManager.createNativeQuery("DELETE FROM product_tags").executeUpdate();

    // 10. Xóa coupons (có thể có FK từ orders nhưng đã xóa orders rồi)
    entityManager.createNativeQuery("DELETE FROM coupons").executeUpdate();

    // 11. Xóa payment_methods (sau khi đã xóa orders và payments)
    entityManager.createNativeQuery("DELETE FROM payment_methods").executeUpdate();

    // 12. Xóa refresh_tokens (có FK đến users)
    entityManager.createNativeQuery("DELETE FROM refresh_tokens").executeUpdate();

    // 13. Xóa users (cuối cùng)
    entityManager.createNativeQuery("DELETE FROM users").executeUpdate();

    entityManager.flush();
    entityManager.clear();

    log.info("Đã xóa sạch tất cả dữ liệu");
  }

  @Transactional
  public void seedUsers() {
    log.info("Đang seed Users...");
    List<User> users = new ArrayList<>();

    // Admin user - kiểm tra xem đã tồn tại chưa (bao gồm cả soft deleted)
    User admin = null;
    try {
      // Tìm cả soft deleted users
      List<User> allAdmins =
          entityManager
              .createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
              .setParameter("email", "admin@greetingcard.com")
              .getResultList();
      if (!allAdmins.isEmpty()) {
        admin = allAdmins.get(0);
      }
    } catch (Exception e) {
      log.debug("Không tìm thấy admin user: {}", e.getMessage());
    }

    if (admin == null) {
      admin = new User();
      admin.setEmail("admin@greetingcard.com");
      admin.setPassword(passwordEncoder.encode("password123"));
      admin.setFullName("Quản Trị Viên");
      admin.setPhone("0901234567");
      admin.setRole(UserRole.ADMIN);
      admin.setEmailVerified(true);
      admin = userRepository.save(admin);
      entityManager.flush();
      log.info("Đã tạo admin user với ID: {}", admin.getId());
    } else {
      // Update existing admin
      admin.setPassword(passwordEncoder.encode("password123"));
      admin.setFullName("Quản Trị Viên");
      admin.setPhone("0901234567");
      admin.setRole(UserRole.ADMIN);
      admin.setEmailVerified(true);
      admin.setDeletedAt(null); // Ensure not soft deleted
      admin = userRepository.save(admin);
      entityManager.flush();
      log.info("Đã cập nhật admin user với ID: {}", admin.getId());
    }
    adminUser = admin;

    // Customer users
    for (int i = 0; i < 50; i++) {
      User user = new User();
      user.setEmail(faker.internet().emailAddress());
      user.setPassword(passwordEncoder.encode("password123"));
      user.setFullName(faker.name().fullName());
      user.setPhone(faker.phoneNumber().cellPhone());
      user.setRole(UserRole.CUSTOMER);
      user.setEmailVerified(faker.bool().bool());
      users.add(user);
    }

    List<User> savedUsers = userRepository.saveAll(users);
    entityManager.flush();
    log.info("Đã seed {} users (admin + {} customers)", savedUsers.size() + 1, savedUsers.size());
  }

  @Transactional
  public void seedPaymentMethods() {
    log.info("Đang seed PaymentMethods...");
    List<PaymentMethod> methods = new ArrayList<>();

    PaymentMethod cod = new PaymentMethod();
    cod.setName("Thanh toán khi nhận hàng (COD)");
    cod.setCode("COD");
    cod.setDescription("Thanh toán bằng tiền mặt khi nhận hàng");
    cod.setIsActive(true);
    cod.setDisplayOrder(1);
    methods.add(cod);

    PaymentMethod bank = new PaymentMethod();
    bank.setName("Chuyển khoản ngân hàng");
    bank.setCode("BANK_TRANSFER");
    bank.setDescription("Chuyển khoản qua ngân hàng");
    bank.setIsActive(true);
    bank.setDisplayOrder(2);
    methods.add(bank);

    PaymentMethod momo = new PaymentMethod();
    momo.setName("Ví điện tử Momo");
    momo.setCode("MOMO");
    momo.setDescription("Thanh toán qua ví điện tử Momo");
    momo.setIsActive(true);
    momo.setDisplayOrder(3);
    methods.add(momo);

    PaymentMethod zalopay = new PaymentMethod();
    zalopay.setName("Ví điện tử ZaloPay");
    zalopay.setCode("ZALOPAY");
    zalopay.setDescription("Thanh toán qua ví điện tử ZaloPay");
    zalopay.setIsActive(true);
    zalopay.setDisplayOrder(4);
    methods.add(zalopay);

    PaymentMethod card = new PaymentMethod();
    card.setName("Thẻ tín dụng/Ghi nợ");
    card.setCode("CREDIT_CARD");
    card.setDescription("Thanh toán qua thẻ tín dụng hoặc thẻ ghi nợ");
    card.setIsActive(true);
    card.setDisplayOrder(5);
    methods.add(card);

    List<PaymentMethod> savedMethods = paymentMethodRepository.saveAll(methods);
    entityManager.flush();
    log.info("Đã seed {} payment methods", savedMethods.size());
  }

  @Transactional
  public void seedCategories() {
    log.info("Đang seed Categories...");
    List<Category> categories = new ArrayList<>();

    // Root categories
    Category chucMung = createCategory("Thiệp Chúc Mừng", "thiep-chuc-mung", null, 1);
    categories.add(chucMung);

    Category camOn = createCategory("Thiệp Cảm Ơn", "thiep-cam-on", null, 2);
    categories.add(camOn);

    Category kinhDoanh = createCategory("Thiệp Kinh Doanh", "thiep-kinh-doanh", null, 3);
    categories.add(kinhDoanh);

    Category giangSinh = createCategory("Thiệp Giáng Sinh", "thiep-giang-sinh", null, 4);
    categories.add(giangSinh);

    List<Category> savedCategories = categoryRepository.saveAll(categories);
    entityManager.flush();
    log.info("Đã seed {} root categories", savedCategories.size());

    // Child categories
    List<Category> childCategories = new ArrayList<>();
    childCategories.add(createCategory("Thiệp Sinh Nhật", "thiep-sinh-nhat", chucMung, 1));
    childCategories.add(createCategory("Thiệp Cưới Hỏi", "thiep-cuoi-hoi", chucMung, 2));
    childCategories.add(createCategory("Thiệp Tết", "thiep-tet", chucMung, 3));
    childCategories.add(createCategory("Thiệp Tình Yêu", "thiep-tinh-yeu", chucMung, 4));
    childCategories.add(createCategory("Thiệp Khai Trương", "thiep-khai-truong", kinhDoanh, 1));
    childCategories.add(createCategory("Thiệp Thăng Chức", "thiep-thang-chuc", kinhDoanh, 2));

    List<Category> savedChildCategories = categoryRepository.saveAll(childCategories);
    entityManager.flush();
    log.info(
        "Đã seed {} categories ({} root + {} child)",
        savedCategories.size() + savedChildCategories.size(),
        savedCategories.size(),
        savedChildCategories.size());
  }

  private Category createCategory(String name, String slug, Category parent, int displayOrder) {
    Category category = new Category();
    category.setName(name);
    category.setSlug(slug);
    category.setDescription(faker.lorem().paragraph());
    category.setParent(parent);
    category.setDisplayOrder(displayOrder);
    category.setIsActive(true);
    // Đánh dấu nổi bật: Root categories có xác suất cao hơn
    if (parent == null) {
      category.setIsFeatured(this.random.nextDouble() < 0.7); // ~70% root categories featured
    } else {
      category.setIsFeatured(this.random.nextDouble() < 0.3); // ~30% child categories featured
    }

    // Upload image to Cloudinary
    try {
      String imageUrl = uploadPlaceholderImage(name, CloudinaryFolder.CATEGORIES);
      category.setImageUrl(imageUrl);
    } catch (Exception e) {
      log.warn("Không thể upload ảnh cho category {}: {}", name, e.getMessage());
    }

    return category;
  }

  @Transactional
  public void seedProductTags() {
    log.info("Đang seed ProductTags...");
    List<ProductTag> tags = new ArrayList<>();

    String[] tagNames = {
      "Bestseller",
      "Mới",
      "Hot",
      "Premium",
      "Eco-Friendly",
      "Handmade",
      "3D",
      "Có Nhạc",
      "Có Hương Thơm",
      "Giảm Giá"
    };

    for (String tagName : tagNames) {
      ProductTag tag = new ProductTag();
      tag.setName(tagName);
      tag.setSlug(toSlug(tagName));
      tags.add(tag);
    }

    List<ProductTag> savedTags = productTagRepository.saveAll(tags);
    entityManager.flush();
    log.info("Đã seed {} product tags", savedTags.size());
  }

  @Transactional
  public void seedProducts() {
    log.info("Đang seed Products...");
    List<Category> categories = categoryRepository.findAll();
    List<ProductTag> tags = productTagRepository.findAll();
    List<Product> products = new ArrayList<>();
    for (int i = 0; i < 100; i++) {
      Product product = new Product();
      product.setCategory(categories.get(this.random.nextInt(categories.size())));
      product.setName(faker.commerce().productName() + " - " + faker.lorem().word());
      product.setSlug(generateUniqueSlug(product.getName()));
      product.setDescription(faker.lorem().paragraph(3));
      product.setPrice(BigDecimal.valueOf(faker.number().numberBetween(20000, 200000)).setScale(2));
      product.setStock(faker.number().numberBetween(0, 500));
      product.setSku("SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      product.setIsActive(this.random.nextDouble() < 0.9); // 90% active
      // Khoảng 15% sản phẩm được đánh dấu nổi bật
      product.setIsFeatured(this.random.nextDouble() < 0.15);

      // Random tags
      Set<ProductTag> productTags = new HashSet<>();
      int tagCount = faker.number().numberBetween(0, 4);
      if (!tags.isEmpty()) {
        for (int j = 0; j < tagCount; j++) {
          productTags.add(tags.get(this.random.nextInt(tags.size())));
        }
      }
      product.setTags(productTags);

      products.add(product);
    }

    List<Product> savedProducts = productRepository.saveAll(products);
    entityManager.flush();
    log.info("Đã seed {} products", savedProducts.size());

    // Add images to products
    int totalImages = 0;
    for (Product product : savedProducts) {
      int imageCount = faker.number().numberBetween(1, 5);
      for (int i = 0; i < imageCount; i++) {
        try {
          String imageUrl =
              uploadPlaceholderImage(product.getName() + " - " + i, CloudinaryFolder.PRODUCTS);
          ProductImage image = new ProductImage();
          image.setProduct(product);
          image.setImageUrl(imageUrl);
          image.setAltText(product.getName());
          image.setIsPrimary(i == 0);
          image.setDisplayOrder(i);
          productImageRepository.save(image);
          totalImages++;
        } catch (Exception e) {
          log.warn("Không thể upload ảnh cho product {}: {}", product.getName(), e.getMessage());
        }
      }
    }
    entityManager.flush();
    log.info("Đã seed {} products với {} images", savedProducts.size(), totalImages);
  }

  @Transactional
  public void seedCoupons() {
    log.info("Đang seed Coupons...");
    List<Coupon> coupons = new ArrayList<>();

    Coupon coupon1 = new Coupon();
    coupon1.setCode("WELCOME10");
    coupon1.setDiscountType(DiscountType.PERCENTAGE);
    coupon1.setDiscountValue(BigDecimal.valueOf(10));
    coupon1.setMinPurchase(BigDecimal.valueOf(100000));
    coupon1.setMaxDiscount(BigDecimal.valueOf(50000));
    coupon1.setValidFrom(LocalDateTime.now().minusDays(30));
    coupon1.setValidUntil(LocalDateTime.now().plusDays(365));
    coupon1.setUsageLimit(1000);
    coupon1.setUsedCount(faker.number().numberBetween(0, 100));
    coupon1.setIsActive(true);
    coupons.add(coupon1);

    Coupon coupon2 = new Coupon();
    coupon2.setCode("SALE20");
    coupon2.setDiscountType(DiscountType.PERCENTAGE);
    coupon2.setDiscountValue(BigDecimal.valueOf(20));
    coupon2.setMinPurchase(BigDecimal.valueOf(200000));
    coupon2.setMaxDiscount(BigDecimal.valueOf(100000));
    coupon2.setValidFrom(LocalDateTime.now().minusDays(30));
    coupon2.setValidUntil(LocalDateTime.now().plusDays(365));
    coupon2.setUsageLimit(500);
    coupon2.setUsedCount(faker.number().numberBetween(0, 50));
    coupon2.setIsActive(true);
    coupons.add(coupon2);

    Coupon coupon3 = new Coupon();
    coupon3.setCode("FREESHIP");
    coupon3.setDiscountType(DiscountType.FIXED_AMOUNT);
    coupon3.setDiscountValue(BigDecimal.valueOf(30000));
    coupon3.setMinPurchase(BigDecimal.valueOf(150000));
    coupon3.setValidFrom(LocalDateTime.now().minusDays(30));
    coupon3.setValidUntil(LocalDateTime.now().plusDays(365));
    coupon3.setUsageLimit(2000);
    coupon3.setUsedCount(faker.number().numberBetween(0, 200));
    coupon3.setIsActive(true);
    coupons.add(coupon3);

    // Generate more random coupons
    for (int i = 0; i < 10; i++) {
      Coupon coupon = new Coupon();
      coupon.setCode("CODE" + faker.number().numberBetween(1000, 9999));
      coupon.setDiscountType(faker.options().option(DiscountType.values()));
      if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
        coupon.setDiscountValue(BigDecimal.valueOf(faker.number().numberBetween(5, 50)));
        coupon.setMaxDiscount(BigDecimal.valueOf(faker.number().numberBetween(50000, 200000)));
      } else {
        coupon.setDiscountValue(BigDecimal.valueOf(faker.number().numberBetween(10000, 100000)));
      }
      coupon.setMinPurchase(BigDecimal.valueOf(faker.number().numberBetween(50000, 500000)));
      coupon.setValidFrom(LocalDateTime.now().minusDays(faker.number().numberBetween(0, 30)));
      coupon.setValidUntil(LocalDateTime.now().plusDays(faker.number().numberBetween(30, 365)));
      coupon.setUsageLimit(faker.number().numberBetween(100, 1000));
      coupon.setUsedCount(faker.number().numberBetween(0, coupon.getUsageLimit()));
      coupon.setIsActive(this.random.nextDouble() < 0.8);
      coupons.add(coupon);
    }

    List<Coupon> savedCoupons = couponRepository.saveAll(coupons);
    entityManager.flush();
    log.info("Đã seed {} coupons", savedCoupons.size());
  }

  @Transactional
  public void seedUserAddresses() {
    log.info("Đang seed UserAddresses...");
    List<User> users = userRepository.findAll();
    List<UserAddress> addresses = new ArrayList<>();

    for (User user : users) {
      int addressCount = faker.number().numberBetween(1, 3);
      boolean hasDefault = false;
      for (int i = 0; i < addressCount; i++) {
        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setRecipientName(user.getFullName());
        address.setPhone(user.getPhone());
        address.setAddressLine1(faker.address().streetAddress());
        address.setAddressLine2(
            this.random.nextDouble() < 0.3 ? faker.address().secondaryAddress() : null);
        address.setCity(faker.address().city());
        address.setDistrict(faker.address().state());
        address.setWard(faker.address().streetName());
        address.setPostalCode(faker.address().zipCode());
        address.setIsDefault(!hasDefault);
        hasDefault = true;
        addresses.add(address);
      }
    }

    List<UserAddress> savedAddresses = userAddressRepository.saveAll(addresses);
    entityManager.flush();
    log.info("Đã seed {} user addresses", savedAddresses.size());
  }

  @Transactional
  public void seedOrders() {
    log.info("Đang seed Orders...");
    List<User> customers =
        userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.CUSTOMER).toList();
    List<Product> products = productRepository.findAll();
    List<PaymentMethod> paymentMethods = paymentMethodRepository.findAll();
    List<Coupon> coupons = couponRepository.findAll();
    List<Order> orders = new ArrayList<>();
    int orderCounter = 1;

    for (int i = 0; i < 200; i++) {
      User customer = customers.get(this.random.nextInt(customers.size()));
      List<UserAddress> addresses = userAddressRepository.findByUserId(customer.getId());
      if (addresses.isEmpty()) {
        continue;
      }

      LocalDateTime orderDate = LocalDateTime.now().minusDays(faker.number().numberBetween(0, 90));
      String orderNumber =
          "ORD-"
              + orderDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"))
              + "-"
              + String.format("%04d", orderCounter++);

      Order order = new Order();
      order.setUser(customer);
      order.setOrderNumber(orderNumber);
      order.setOrderDate(orderDate);
      order.setPaymentMethod(paymentMethods.get(this.random.nextInt(paymentMethods.size())));
      order.setPaymentStatus(
          PaymentStatus.values()[this.random.nextInt(PaymentStatus.values().length)]);
      order.setShippingAddress(addresses.get(this.random.nextInt(addresses.size())));
      order.setStatus(OrderStatus.values()[this.random.nextInt(OrderStatus.values().length)]);

      // Random coupon
      if (this.random.nextDouble() < 0.3 && !coupons.isEmpty()) {
        order.setCoupon(coupons.get(this.random.nextInt(coupons.size())));
      }

      // Calculate amounts
      BigDecimal totalAmount = BigDecimal.ZERO;
      List<OrderItem> orderItems = new ArrayList<>();
      int itemCount = faker.number().numberBetween(1, 5);
      for (int j = 0; j < itemCount; j++) {
        Product product = products.get(this.random.nextInt(products.size()));
        int quantity = faker.number().numberBetween(1, 5);
        BigDecimal price = product.getPrice();
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(quantity));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setPrice(price);
        item.setSubtotal(subtotal);
        orderItems.add(item);

        totalAmount = totalAmount.add(subtotal);
      }

      // Calculate discount
      BigDecimal discountAmount = BigDecimal.ZERO;
      if (order.getCoupon() != null) {
        Coupon coupon = order.getCoupon();
        if (totalAmount.compareTo(coupon.getMinPurchase()) >= 0) {
          if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount =
                totalAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null
                && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
              discountAmount = coupon.getMaxDiscount();
            }
          } else {
            discountAmount = coupon.getDiscountValue();
          }
        }
      }

      order.setTotalAmount(totalAmount);
      order.setDiscountAmount(discountAmount);
      order.setFinalAmount(totalAmount.subtract(discountAmount));
      order.setNotes(this.random.nextDouble() < 0.2 ? faker.lorem().sentence() : null);

      orders.add(order);
      orderRepository.save(order);
      orderItemRepository.saveAll(orderItems);

      // Create order status history
      // Note: createdAt will be auto-set by @CreationTimestamp, so we can't set custom dates
      // This is a limitation, but acceptable for seed data
      List<OrderStatusHistory> history = new ArrayList<>();
      history.add(createStatusHistory(order, OrderStatus.PENDING, customer));

      if (order.getStatus() != OrderStatus.PENDING) {
        history.add(createStatusHistory(order, OrderStatus.CONFIRMED, adminUser));

        if (order.getStatus() == OrderStatus.SHIPPED
            || order.getStatus() == OrderStatus.DELIVERED) {
          history.add(createStatusHistory(order, OrderStatus.SHIPPED, adminUser));

          if (order.getStatus() == OrderStatus.DELIVERED) {
            history.add(createStatusHistory(order, OrderStatus.DELIVERED, adminUser));
          }
        }
      }

      orderStatusHistoryRepository.saveAll(history);
    }

    log.info("Đã seed {} orders", orders.size());
  }

  private OrderStatusHistory createStatusHistory(Order order, OrderStatus status, User changedBy) {
    OrderStatusHistory history = new OrderStatusHistory();
    history.setOrder(order);
    history.setStatus(status);
    history.setChangedBy(changedBy);
    history.setNotes(faker.lorem().sentence());
    // Note: createdAt will be set by @CreationTimestamp automatically
    return history;
  }

  @Transactional
  public void seedProductReviews() {
    log.info("Đang seed ProductReviews...");
    List<User> customers =
        userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.CUSTOMER).toList();
    List<Product> products = productRepository.findAll();
    List<OrderItem> orderItems = orderItemRepository.findAll();
    List<ProductReview> reviews = new ArrayList<>();

    // Get products that were ordered
    Set<Long> orderedProductIds = new HashSet<>();
    for (OrderItem item : orderItems) {
      orderedProductIds.add(item.getProduct().getId());
    }

    // Track đã review để tránh duplicate trong cùng một lần seed
    Set<String> reviewedPairs = new HashSet<>();

    // Lấy tất cả reviews hiện có
    List<ProductReview> existingReviews = productReviewRepository.findAll();
    for (ProductReview existing : existingReviews) {
      reviewedPairs.add(existing.getProduct().getId() + "_" + existing.getUser().getId());
    }

    int maxAttempts = 1000; // Giới hạn số lần thử để tránh vòng lặp vô hạn
    int attempts = 0;
    int created = 0;

    while (created < 300 && attempts < maxAttempts) {
      attempts++;
      Product product = products.get(this.random.nextInt(products.size()));
      User user = customers.get(this.random.nextInt(customers.size()));

      String pairKey = product.getId() + "_" + user.getId();

      // Check if already reviewed (trong DB hoặc trong cùng lần seed này)
      if (reviewedPairs.contains(pairKey)) {
        continue;
      }

      ProductReview review = new ProductReview();
      review.setProduct(product);
      review.setUser(user);
      review.setRating(faker.number().numberBetween(1, 6)); // 1-5 (inclusive, exclusive)
      review.setComment(faker.lorem().paragraph());
      review.setIsVerifiedPurchase(orderedProductIds.contains(product.getId()));
      review.setIsApproved(this.random.nextDouble() < 0.9); // 90% approved
      reviews.add(review);
      reviewedPairs.add(pairKey); // Đánh dấu đã tạo
      created++;
    }

    if (!reviews.isEmpty()) {
      productReviewRepository.saveAll(reviews);
    }
    log.info("Đã seed {} product reviews (sau {} attempts)", reviews.size(), attempts);
  }

  @Transactional
  public void seedWishlists() {
    log.info("Đang seed Wishlists...");
    List<User> customers =
        userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.CUSTOMER).toList();
    List<Product> products = productRepository.findAll();

    for (User customer : customers) {
      if (wishlistRepository.existsByUserId(customer.getId())) {
        continue;
      }

      Wishlist wishlist = new Wishlist();
      wishlist.setUser(customer);
      wishlist = wishlistRepository.save(wishlist);

      int itemCount = faker.number().numberBetween(0, 10);
      Set<Long> addedProductIds = new HashSet<>();
      for (int i = 0; i < itemCount; i++) {
        Product product = products.get(this.random.nextInt(products.size()));
        if (addedProductIds.contains(product.getId())) {
          continue;
        }
        addedProductIds.add(product.getId());

        WishlistItem item = new WishlistItem();
        item.setWishlist(wishlist);
        item.setProduct(product);
        wishlistItemRepository.save(item);
      }
    }

    log.info("Đã seed wishlists cho {} users", customers.size());
  }

  @Transactional
  public void seedNotifications() {
    log.info("Đang seed Notifications...");
    List<User> users = userRepository.findAll();
    List<Order> orders = orderRepository.findAll();
    List<Product> products = productRepository.findAll();
    List<Notification> notifications = new ArrayList<>();

    for (int i = 0; i < 500; i++) {
      User user = users.get(this.random.nextInt(users.size()));
      NotificationType type =
          NotificationType.values()[this.random.nextInt(NotificationType.values().length)];

      Notification notification = new Notification();
      notification.setUser(user);
      notification.setType(type);

      switch (type) {
        case ORDER:
          if (!orders.isEmpty()) {
            Order order = orders.get(this.random.nextInt(orders.size()));
            notification.setTitle("Đơn hàng " + order.getOrderNumber());
            notification.setMessage(
                "Đơn hàng của bạn đã được " + order.getStatus().name().toLowerCase());
            notification.setLinkUrl("/orders/" + order.getId());
          } else {
            notification.setTitle("Thông báo đơn hàng");
            notification.setMessage(faker.lorem().sentence());
          }
          break;
        case PRODUCT:
          if (!products.isEmpty()) {
            Product product = products.get(this.random.nextInt(products.size()));
            notification.setTitle("Sản phẩm mới");
            notification.setMessage("Có sản phẩm mới: " + product.getName());
            notification.setLinkUrl("/products/" + product.getSlug());
          } else {
            notification.setTitle("Thông báo sản phẩm");
            notification.setMessage(faker.lorem().sentence());
          }
          break;
        case SYSTEM:
          notification.setTitle(faker.lorem().sentence(3));
          notification.setMessage(faker.lorem().paragraph());
          break;
      }

      notification.setIsRead(this.random.nextDouble() < 0.4); // 40% read
      if (notification.getIsRead()) {
        notification.setReadAt(LocalDateTime.now().minusDays(faker.number().numberBetween(0, 30)));
      }

      notifications.add(notification);
    }

    notificationRepository.saveAll(notifications);
    log.info("Đã seed {} notifications", notifications.size());
  }

  // Helper methods
  private String generateUniqueSlug(String name) {
    String baseSlug = toSlug(name);
    String slug = baseSlug;
    int counter = 1;
    while (productRepository.existsBySlug(slug)) {
      slug = baseSlug + "-" + counter;
      counter++;
    }
    return slug;
  }

  private String toSlug(String input) {
    if (input == null) return "";
    return input.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
  }

  private String uploadPlaceholderImage(String name, CloudinaryFolder folder) throws IOException {
    // Create a simple placeholder image
    int width = 800;
    int height = 600;
    BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
    Graphics2D g = image.createGraphics();

    // Fill background
    g.setColor(new Color(240, 240, 240));
    g.fillRect(0, 0, width, height);

    // Draw text
    g.setColor(new Color(100, 100, 100));
    g.setFont(new Font("Arial", Font.BOLD, 48));
    String text = name.length() > 30 ? name.substring(0, 30) + "..." : name;
    int textWidth = g.getFontMetrics().stringWidth(text);
    int textHeight = g.getFontMetrics().getHeight();
    g.drawString(text, (width - textWidth) / 2, (height + textHeight) / 2);

    g.dispose();

    // Convert to byte array
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ImageIO.write(image, "png", baos);
    byte[] imageBytes = baos.toByteArray();

    // Create MultipartFile
    MultipartFile multipartFile =
        new MockMultipartFile("image", "placeholder.png", "image/png", imageBytes);

    // Upload to Cloudinary
    return cloudinaryService.uploadFile(multipartFile, folder);
  }
}
