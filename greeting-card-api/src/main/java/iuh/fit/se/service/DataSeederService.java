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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
import iuh.fit.se.entity.Payment;
import iuh.fit.se.entity.PaymentMethod;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.ProductImage;
import iuh.fit.se.entity.ProductReview;
import iuh.fit.se.entity.ProductTag;
import iuh.fit.se.entity.Promotion;
import iuh.fit.se.entity.StockTransaction;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.UserAddress;
import iuh.fit.se.entity.Wishlist;
import iuh.fit.se.entity.WishlistItem;
import iuh.fit.se.entity.enumeration.DiscountType;
import iuh.fit.se.entity.enumeration.NotificationType;
import iuh.fit.se.entity.enumeration.OrderStatus;
import iuh.fit.se.entity.enumeration.PaymentStatus;
import iuh.fit.se.entity.enumeration.PromotionScope;
import iuh.fit.se.entity.enumeration.PromotionType;
import iuh.fit.se.entity.enumeration.StockTransactionType;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.repository.CategoryRepository;
import iuh.fit.se.repository.CouponRepository;
import iuh.fit.se.repository.NotificationRepository;
import iuh.fit.se.repository.OrderItemRepository;
import iuh.fit.se.repository.OrderRepository;
import iuh.fit.se.repository.OrderStatusHistoryRepository;
import iuh.fit.se.repository.PaymentMethodRepository;
import iuh.fit.se.repository.PaymentRepository;
import iuh.fit.se.repository.ProductImageRepository;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.ProductReviewRepository;
import iuh.fit.se.repository.ProductTagRepository;
import iuh.fit.se.repository.PromotionRepository;
import iuh.fit.se.repository.StockTransactionRepository;
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
  private final PaymentRepository paymentRepository;
  private final CouponRepository couponRepository;
  private final PromotionRepository promotionRepository;
  private final StockTransactionRepository stockTransactionRepository;
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

  // Time reference for generating distributed data across multiple time periods
  // This ensures meaningful weekly and monthly statistics
  private LocalDateTime seedBaseDate;

  @Transactional(rollbackFor = Exception.class)
  public void seedAll() {
    log.info("=== Bắt đầu seed data ===");
    faker = new Faker(new java.util.Locale("vi"));

    // Set base date to 6 months ago to create historical data for statistics
    // This allows for meaningful weekly and monthly trend analysis
    seedBaseDate = LocalDateTime.now().minusMonths(6);
    log.info("Base date for seed data: {}", seedBaseDate);

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

      seedPromotions();
      entityManager.flush();
      log.info("✓ Promotions seeded");

      seedUserAddresses();
      entityManager.flush();
      log.info("✓ UserAddresses seeded");

      seedOrders();
      entityManager.flush();
      log.info("✓ Orders seeded");

      seedPayments();
      entityManager.flush();
      log.info("✓ Payments seeded");

      seedStockTransactions();
      entityManager.flush();
      log.info("✓ StockTransactions seeded");

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
    entityManager.createNativeQuery("DELETE FROM stock_transactions").executeUpdate();

    // 2. Xóa payments trước (có FK đến orders và payment_methods)
    entityManager.createNativeQuery("DELETE FROM payments").executeUpdate();

    // 3. Xóa orders (có FK đến users, payment_methods, coupons, promotions, user_addresses)
    entityManager.createNativeQuery("DELETE FROM orders").executeUpdate();

    // 4. Xóa user_addresses (có FK đến users)
    entityManager.createNativeQuery("DELETE FROM user_addresses").executeUpdate();

    // 5. Xóa cart_items (có FK đến carts và products)
    entityManager.createNativeQuery("DELETE FROM cart_items").executeUpdate();

    // 6. Xóa carts (có FK đến users)
    entityManager.createNativeQuery("DELETE FROM carts").executeUpdate();

    // 7. Xóa product_images (có FK đến products)
    entityManager.createNativeQuery("DELETE FROM product_images").executeUpdate();

    // 8. Xóa product_tag_map (bảng trung gian)
    entityManager.createNativeQuery("DELETE FROM product_tag_map").executeUpdate();

    // 9. Xóa promotion_products (bảng trung gian cho promotions và products)
    entityManager.createNativeQuery("DELETE FROM promotion_products").executeUpdate();

    // 10. Xóa products (có FK đến categories)
    entityManager.createNativeQuery("DELETE FROM products").executeUpdate();

    // 11. Xóa categories (có self-reference)
    entityManager.createNativeQuery("DELETE FROM categories").executeUpdate();

    // 12. Xóa product_tags
    entityManager.createNativeQuery("DELETE FROM product_tags").executeUpdate();

    // 13. Xóa promotions (có thể có FK từ orders nhưng đã xóa orders rồi)
    entityManager.createNativeQuery("DELETE FROM promotions").executeUpdate();

    // 14. Xóa coupons (có thể có FK từ orders nhưng đã xóa orders rồi)
    entityManager.createNativeQuery("DELETE FROM coupons").executeUpdate();

    // 15. Xóa payment_methods (sau khi đã xóa orders và payments)
    entityManager.createNativeQuery("DELETE FROM payment_methods").executeUpdate();

    // 16. Xóa refresh_tokens (có FK đến users)
    entityManager.createNativeQuery("DELETE FROM refresh_tokens").executeUpdate();

    // 17. Xóa users (cuối cùng)
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

  /**
   * Seeds coupon data with time-distributed validity periods. Creates both fixed and random coupons
   * with realistic validity ranges. Coupons are created with usage counts that reflect realistic
   * adoption rates.
   */
  @Transactional
  public void seedCoupons() {
    log.info("Đang seed Coupons...");
    List<Coupon> coupons = new ArrayList<>();

    // Fixed coupons - always available with long validity periods
    Coupon coupon1 = new Coupon();
    coupon1.setCode("WELCOME10");
    coupon1.setDiscountType(DiscountType.PERCENTAGE);
    coupon1.setDiscountValue(BigDecimal.valueOf(10));
    coupon1.setMinPurchase(BigDecimal.valueOf(100000));
    coupon1.setMaxDiscount(BigDecimal.valueOf(50000));
    coupon1.setValidFrom(seedBaseDate);
    coupon1.setValidUntil(LocalDateTime.now().plusDays(365));
    coupon1.setUsageLimit(1000);
    coupon1.setUsedCount(faker.number().numberBetween(50, 150));
    coupon1.setIsActive(true);
    coupons.add(coupon1);

    Coupon coupon2 = new Coupon();
    coupon2.setCode("SALE20");
    coupon2.setDiscountType(DiscountType.PERCENTAGE);
    coupon2.setDiscountValue(BigDecimal.valueOf(20));
    coupon2.setMinPurchase(BigDecimal.valueOf(200000));
    coupon2.setMaxDiscount(BigDecimal.valueOf(100000));
    coupon2.setValidFrom(seedBaseDate);
    coupon2.setValidUntil(LocalDateTime.now().plusDays(365));
    coupon2.setUsageLimit(500);
    coupon2.setUsedCount(faker.number().numberBetween(30, 80));
    coupon2.setIsActive(true);
    coupons.add(coupon2);

    Coupon coupon3 = new Coupon();
    coupon3.setCode("FREESHIP");
    coupon3.setDiscountType(DiscountType.FIXED_AMOUNT);
    coupon3.setDiscountValue(BigDecimal.valueOf(30000));
    coupon3.setMinPurchase(BigDecimal.valueOf(150000));
    coupon3.setValidFrom(seedBaseDate);
    coupon3.setValidUntil(LocalDateTime.now().plusDays(365));
    coupon3.setUsageLimit(2000);
    coupon3.setUsedCount(faker.number().numberBetween(100, 300));
    coupon3.setIsActive(true);
    coupons.add(coupon3);

    // Generate time-distributed random coupons for seasonal/promotional campaigns
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

      // Distribute coupon start dates over the past 6 months
      int daysFromBase = faker.number().numberBetween(0, 150);
      coupon.setValidFrom(seedBaseDate.plusDays(daysFromBase));
      coupon.setValidUntil(coupon.getValidFrom().plusDays(faker.number().numberBetween(30, 180)));

      coupon.setUsageLimit(faker.number().numberBetween(100, 1000));
      // Usage count should be proportional to how long the coupon has been active
      int maxUsed = (int) (coupon.getUsageLimit() * 0.3);
      coupon.setUsedCount(faker.number().numberBetween(0, maxUsed));
      coupon.setIsActive(this.random.nextDouble() < 0.8);
      coupons.add(coupon);
    }

    List<Coupon> savedCoupons = couponRepository.saveAll(coupons);
    entityManager.flush();
    log.info("Đã seed {} coupons", savedCoupons.size());
  }

  /**
   * Seeds promotion data with various types and scopes. Creates ORDER-level, CATEGORY-level, and
   * PRODUCT-level promotions. Includes DISCOUNT, BOGO, BUY_X_GET_Y, and BUY_X_PAY_Y promotion
   * types.
   */
  @Transactional
  public void seedPromotions() {
    log.info("Đang seed Promotions...");
    List<Category> categories = categoryRepository.findAll();
    List<Product> products = productRepository.findAll();
    List<Promotion> promotions = new ArrayList<>();

    // ORDER scope promotions - apply to entire order
    Promotion orderPromo1 = new Promotion();
    orderPromo1.setName("Giảm giá đơn hàng 15%");
    orderPromo1.setDescription("Giảm 15% cho đơn hàng từ 500.000đ");
    orderPromo1.setType(PromotionType.DISCOUNT);
    orderPromo1.setScope(PromotionScope.ORDER);
    orderPromo1.setDiscountType(DiscountType.PERCENTAGE);
    orderPromo1.setDiscountValue(BigDecimal.valueOf(15));
    orderPromo1.setMinPurchase(BigDecimal.valueOf(500000));
    orderPromo1.setMaxDiscount(BigDecimal.valueOf(150000));
    orderPromo1.setValidFrom(seedBaseDate.plusMonths(2));
    orderPromo1.setValidUntil(LocalDateTime.now().plusMonths(2));
    orderPromo1.setUsageLimit(500);
    orderPromo1.setUsedCount(faker.number().numberBetween(20, 100));
    orderPromo1.setIsActive(true);
    promotions.add(orderPromo1);

    Promotion orderPromo2 = new Promotion();
    orderPromo2.setName("Flash Sale - Giảm 50k");
    orderPromo2.setDescription("Giảm ngay 50.000đ cho đơn hàng từ 300.000đ");
    orderPromo2.setType(PromotionType.DISCOUNT);
    orderPromo2.setScope(PromotionScope.ORDER);
    orderPromo2.setDiscountType(DiscountType.FIXED_AMOUNT);
    orderPromo2.setDiscountValue(BigDecimal.valueOf(50000));
    orderPromo2.setMinPurchase(BigDecimal.valueOf(300000));
    orderPromo2.setValidFrom(seedBaseDate.plusMonths(3));
    orderPromo2.setValidUntil(LocalDateTime.now().plusDays(30));
    orderPromo2.setUsageLimit(1000);
    orderPromo2.setUsedCount(faker.number().numberBetween(50, 200));
    orderPromo2.setIsActive(true);
    promotions.add(orderPromo2);

    // CATEGORY scope promotions - apply to specific categories
    if (!categories.isEmpty()) {
      for (int i = 0; i < Math.min(3, categories.size()); i++) {
        Category category = categories.get(this.random.nextInt(categories.size()));

        Promotion categoryPromo = new Promotion();
        categoryPromo.setName("Khuyến mãi " + category.getName());
        categoryPromo.setDescription("Giảm giá đặc biệt cho danh mục " + category.getName());
        categoryPromo.setType(PromotionType.DISCOUNT);
        categoryPromo.setScope(PromotionScope.CATEGORY);
        categoryPromo.setCategory(category);
        categoryPromo.setDiscountType(DiscountType.PERCENTAGE);
        categoryPromo.setDiscountValue(BigDecimal.valueOf(faker.number().numberBetween(10, 30)));
        categoryPromo.setMinPurchase(BigDecimal.ZERO);
        categoryPromo.setMaxDiscount(
            BigDecimal.valueOf(faker.number().numberBetween(50000, 100000)));

        int monthsFromBase = faker.number().numberBetween(1, 4);
        categoryPromo.setValidFrom(seedBaseDate.plusMonths(monthsFromBase));
        categoryPromo.setValidUntil(
            categoryPromo.getValidFrom().plusDays(faker.number().numberBetween(30, 90)));
        categoryPromo.setUsageLimit(faker.number().numberBetween(200, 500));
        categoryPromo.setUsedCount(faker.number().numberBetween(10, 100));
        categoryPromo.setIsActive(this.random.nextDouble() < 0.8);
        promotions.add(categoryPromo);
      }
    }

    // PRODUCT scope promotions - apply to specific products
    if (!products.isEmpty()) {
      // BOGO Promotion
      Promotion bogoPromo = new Promotion();
      bogoPromo.setName("Mua 1 Tặng 1");
      bogoPromo.setDescription("Mua 1 sản phẩm được tặng thêm 1 sản phẩm");
      bogoPromo.setType(PromotionType.BOGO);
      bogoPromo.setScope(PromotionScope.PRODUCT);
      bogoPromo.setBuyQuantity(1);
      bogoPromo.setGetQuantity(1);
      Set<Product> bogoProducts = new HashSet<>();
      for (int i = 0; i < Math.min(5, products.size()); i++) {
        bogoProducts.add(products.get(this.random.nextInt(products.size())));
      }
      bogoPromo.setProducts(bogoProducts);
      bogoPromo.setValidFrom(seedBaseDate.plusMonths(1));
      bogoPromo.setValidUntil(LocalDateTime.now().plusDays(60));
      bogoPromo.setUsageLimit(300);
      bogoPromo.setUsedCount(faker.number().numberBetween(10, 50));
      bogoPromo.setIsActive(true);
      promotions.add(bogoPromo);

      // BUY_X_GET_Y Promotion
      Promotion buyXGetYPromo = new Promotion();
      buyXGetYPromo.setName("Mua 2 Tặng 1");
      buyXGetYPromo.setDescription("Mua 2 sản phẩm được tặng thêm 1 sản phẩm");
      buyXGetYPromo.setType(PromotionType.BUY_X_GET_Y);
      buyXGetYPromo.setScope(PromotionScope.PRODUCT);
      buyXGetYPromo.setBuyQuantity(2);
      buyXGetYPromo.setGetQuantity(1);
      Set<Product> buyXGetYProducts = new HashSet<>();
      for (int i = 0; i < Math.min(8, products.size()); i++) {
        buyXGetYProducts.add(products.get(this.random.nextInt(products.size())));
      }
      buyXGetYPromo.setProducts(buyXGetYProducts);
      buyXGetYPromo.setValidFrom(seedBaseDate.plusMonths(2));
      buyXGetYPromo.setValidUntil(LocalDateTime.now().plusDays(45));
      buyXGetYPromo.setUsageLimit(200);
      buyXGetYPromo.setUsedCount(faker.number().numberBetween(5, 40));
      buyXGetYPromo.setIsActive(true);
      promotions.add(buyXGetYPromo);

      // BUY_X_PAY_Y Promotion
      Promotion buyXPayYPromo = new Promotion();
      buyXPayYPromo.setName("Mua 3 Chỉ Tính Tiền 2");
      buyXPayYPromo.setDescription("Mua 3 sản phẩm chỉ phải trả tiền 2 sản phẩm");
      buyXPayYPromo.setType(PromotionType.BUY_X_PAY_Y);
      buyXPayYPromo.setScope(PromotionScope.PRODUCT);
      buyXPayYPromo.setBuyQuantity(3);
      buyXPayYPromo.setPayQuantity(2);
      Set<Product> buyXPayYProducts = new HashSet<>();
      for (int i = 0; i < Math.min(6, products.size()); i++) {
        buyXPayYProducts.add(products.get(this.random.nextInt(products.size())));
      }
      buyXPayYPromo.setProducts(buyXPayYProducts);
      buyXPayYPromo.setValidFrom(seedBaseDate.plusMonths(3));
      buyXPayYPromo.setValidUntil(LocalDateTime.now().plusDays(30));
      buyXPayYPromo.setUsageLimit(150);
      buyXPayYPromo.setUsedCount(faker.number().numberBetween(5, 30));
      buyXPayYPromo.setIsActive(true);
      promotions.add(buyXPayYPromo);
    }

    List<Promotion> savedPromotions = promotionRepository.saveAll(promotions);
    entityManager.flush();
    log.info("Đã seed {} promotions", savedPromotions.size());
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

  /**
   * Seeds order data with time-distributed dates for meaningful statistics.
   *
   * <p>Distribution strategy: - Orders are spread across 6 months of historical data - More recent
   * orders (last 2 months) have higher frequency - Order statuses are correlated with order age
   * (older orders more likely completed/delivered) - Payment status correlates with order status
   * for data consistency - Applies coupons and promotions based on validity periods
   *
   * <p>This ensures weekly and monthly statistics show realistic trends and growth patterns.
   */
  @Transactional
  public void seedOrders() {
    log.info("Đang seed Orders...");
    List<User> customers =
        userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.CUSTOMER).toList();
    List<Product> products = productRepository.findAll();
    List<PaymentMethod> paymentMethods = paymentMethodRepository.findAll();
    List<Coupon> coupons = couponRepository.findAll();
    List<Promotion> promotions = promotionRepository.findAll();
    List<Order> orders = new ArrayList<>();
    int orderCounter = 1;

    // Generate 400 orders distributed over 6 months for better statistics
    for (int i = 0; i < 400; i++) {
      User customer = customers.get(this.random.nextInt(customers.size()));
      List<UserAddress> addresses = userAddressRepository.findByUserId(customer.getId());
      if (addresses.isEmpty()) {
        continue;
      }

      // Generate time-distributed order dates with weighted distribution
      // 50% of orders in last 2 months, 30% in months 2-4, 20% in months 4-6
      LocalDateTime orderDate = generateWeightedOrderDate();

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
      order.setShippingAddress(addresses.get(this.random.nextInt(addresses.size())));

      // Determine order status based on order age for realistic data
      order.setStatus(determineOrderStatusByAge(orderDate));

      // Set payment status based on order status for data coherence
      order.setPaymentStatus(determinePaymentStatusByOrderStatus(order.getStatus()));

      // Apply coupon if valid during order date
      Coupon validCoupon = findValidCoupon(coupons, orderDate);
      if (validCoupon != null && this.random.nextDouble() < 0.25) { // 25% of orders use coupons
        order.setCoupon(validCoupon);
      }

      // Apply promotion if valid during order date
      Promotion validPromotion = findValidPromotion(promotions, orderDate, PromotionScope.ORDER);
      if (validPromotion != null
          && this.random.nextDouble() < 0.15) { // 15% of orders use promotions
        order.setPromotion(validPromotion);
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

      // Calculate discount from coupon
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

      // Calculate promotion discount (simplified - only for ORDER scope DISCOUNT type)
      BigDecimal promotionDiscount = BigDecimal.ZERO;
      if (order.getPromotion() != null
          && order.getPromotion().getType() == PromotionType.DISCOUNT) {
        Promotion promo = order.getPromotion();
        if (totalAmount.compareTo(promo.getMinPurchase()) >= 0) {
          if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
            promotionDiscount =
                totalAmount
                    .multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            if (promo.getMaxDiscount() != null
                && promotionDiscount.compareTo(promo.getMaxDiscount()) > 0) {
              promotionDiscount = promo.getMaxDiscount();
            }
          } else {
            promotionDiscount = promo.getDiscountValue();
          }
        }
      }

      order.setTotalAmount(totalAmount);
      order.setDiscountAmount(discountAmount);
      order.setPromotionDiscountAmount(promotionDiscount);
      order.setFinalAmount(totalAmount.subtract(discountAmount).subtract(promotionDiscount));
      order.setNotes(this.random.nextDouble() < 0.2 ? faker.lorem().sentence() : null);

      orders.add(order);
      orderRepository.save(order);
      orderItemRepository.saveAll(orderItems);

      // Create order status history with realistic progression
      List<OrderStatusHistory> history = createOrderStatusHistory(order, orderDate);
      orderStatusHistoryRepository.saveAll(history);
    }

    log.info("Đã seed {} orders distributed over 6 months", orders.size());
  }

  /**
   * Generates order dates with weighted distribution: - 50% in last 2 months (recent activity) -
   * 30% in months 2-4 - 20% in months 4-6 (historical data)
   */
  private LocalDateTime generateWeightedOrderDate() {
    double rand = this.random.nextDouble();
    LocalDateTime now = LocalDateTime.now();

    if (rand < 0.5) {
      // Last 2 months - 50%
      long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(now.minusMonths(2), now);
      int daysOffset = faker.number().numberBetween(0, (int) daysBetween);
      return now.minusDays(daysOffset);
    } else if (rand < 0.8) {
      // Months 2-4 - 30%
      long daysBetween =
          java.time.temporal.ChronoUnit.DAYS.between(now.minusMonths(4), now.minusMonths(2));
      int daysOffset = faker.number().numberBetween(0, (int) daysBetween);
      return now.minusMonths(2).minusDays(daysOffset);
    } else {
      // Months 4-6 - 20%
      long daysBetween =
          java.time.temporal.ChronoUnit.DAYS.between(seedBaseDate, now.minusMonths(4));
      int daysOffset = faker.number().numberBetween(0, (int) daysBetween);
      return now.minusMonths(4).minusDays(daysOffset);
    }
  }

  /**
   * Determines order status based on order age for realistic progression. Older orders are more
   * likely to be delivered, recent orders more likely pending/confirmed.
   */
  private OrderStatus determineOrderStatusByAge(LocalDateTime orderDate) {
    long daysOld = java.time.temporal.ChronoUnit.DAYS.between(orderDate, LocalDateTime.now());

    // Orders from more than 30 days ago - mostly delivered or cancelled
    if (daysOld > 30) {
      double rand = this.random.nextDouble();
      if (rand < 0.75) return OrderStatus.DELIVERED; // 75% delivered
      if (rand < 0.90) return OrderStatus.CANCELLED; // 15% cancelled
      return OrderStatus.SHIPPED; // 10% still shipped
    }
    // Orders from 15-30 days ago - mix of shipped and delivered
    else if (daysOld > 15) {
      double rand = this.random.nextDouble();
      if (rand < 0.50) return OrderStatus.DELIVERED; // 50% delivered
      if (rand < 0.80) return OrderStatus.SHIPPED; // 30% shipped
      if (rand < 0.90) return OrderStatus.CONFIRMED; // 10% confirmed
      return OrderStatus.CANCELLED; // 10% cancelled
    }
    // Orders from 7-15 days ago - mostly confirmed or shipped
    else if (daysOld > 7) {
      double rand = this.random.nextDouble();
      if (rand < 0.40) return OrderStatus.SHIPPED; // 40% shipped
      if (rand < 0.70) return OrderStatus.CONFIRMED; // 30% confirmed
      if (rand < 0.85) return OrderStatus.DELIVERED; // 15% delivered
      if (rand < 0.95) return OrderStatus.PENDING; // 10% pending
      return OrderStatus.CANCELLED; // 5% cancelled
    }
    // Orders from last 7 days - mostly pending or confirmed
    else {
      double rand = this.random.nextDouble();
      if (rand < 0.40) return OrderStatus.PENDING; // 40% pending
      if (rand < 0.75) return OrderStatus.CONFIRMED; // 35% confirmed
      if (rand < 0.90) return OrderStatus.SHIPPED; // 15% shipped
      if (rand < 0.95) return OrderStatus.DELIVERED; // 5% delivered
      return OrderStatus.CANCELLED; // 5% cancelled
    }
  }

  /** Determines payment status based on order status for data coherence. */
  private PaymentStatus determinePaymentStatusByOrderStatus(OrderStatus orderStatus) {
    return switch (orderStatus) {
      case PENDING -> this.random.nextDouble() < 0.3 ? PaymentStatus.PAID : PaymentStatus.PENDING;
      case CONFIRMED -> this.random.nextDouble() < 0.8 ? PaymentStatus.PAID : PaymentStatus.PENDING;
      case SHIPPED, DELIVERED -> PaymentStatus.PAID;
      case CANCELLED ->
          this.random.nextDouble() < 0.5 ? PaymentStatus.FAILED : PaymentStatus.REFUNDED;
    };
  }

  /** Finds a valid coupon that was active during the order date. */
  private Coupon findValidCoupon(List<Coupon> coupons, LocalDateTime orderDate) {
    List<Coupon> validCoupons =
        coupons.stream()
            .filter(c -> c.getIsActive())
            .filter(
                c -> !orderDate.isBefore(c.getValidFrom()) && !orderDate.isAfter(c.getValidUntil()))
            .toList();

    return validCoupons.isEmpty()
        ? null
        : validCoupons.get(this.random.nextInt(validCoupons.size()));
  }

  /** Finds a valid promotion that was active during the order date. */
  private Promotion findValidPromotion(
      List<Promotion> promotions, LocalDateTime orderDate, PromotionScope scope) {
    List<Promotion> validPromotions =
        promotions.stream()
            .filter(p -> p.getIsActive())
            .filter(p -> p.getScope() == scope)
            .filter(
                p -> !orderDate.isBefore(p.getValidFrom()) && !orderDate.isAfter(p.getValidUntil()))
            .toList();

    return validPromotions.isEmpty()
        ? null
        : validPromotions.get(this.random.nextInt(validPromotions.size()));
  }

  /** Creates realistic order status history progression. */
  private List<OrderStatusHistory> createOrderStatusHistory(Order order, LocalDateTime orderDate) {
    List<OrderStatusHistory> history = new ArrayList<>();

    // Always start with PENDING
    history.add(createStatusHistory(order, OrderStatus.PENDING, order.getUser()));

    if (order.getStatus() != OrderStatus.PENDING) {
      // Add CONFIRMED if order progressed
      if (order.getStatus() != OrderStatus.CANCELLED) {
        history.add(createStatusHistory(order, OrderStatus.CONFIRMED, adminUser));
      }

      // Add SHIPPED if order progressed to shipping
      if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
        history.add(createStatusHistory(order, OrderStatus.SHIPPED, adminUser));
      }

      // Add DELIVERED if order completed
      if (order.getStatus() == OrderStatus.DELIVERED) {
        history.add(createStatusHistory(order, OrderStatus.DELIVERED, adminUser));
      }

      // Add CANCELLED if order was cancelled
      if (order.getStatus() == OrderStatus.CANCELLED) {
        history.add(
            createStatusHistory(
                order,
                OrderStatus.CANCELLED,
                this.random.nextDouble() < 0.5 ? order.getUser() : adminUser));
      }
    }

    return history;
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

  /**
   * Seeds payment records for orders. Creates payments that match order payment status and dates.
   * Generates realistic transaction IDs and gateway responses.
   */
  @Transactional
  public void seedPayments() {
    log.info("Đang seed Payments...");
    List<Order> orders = orderRepository.findAll();
    List<Payment> payments = new ArrayList<>();

    for (Order order : orders) {
      // Only create payments for orders that have payment activity
      if (order.getPaymentStatus() == PaymentStatus.PAID
          || order.getPaymentStatus() == PaymentStatus.FAILED) {

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(order.getPaymentMethod());
        payment.setAmount(order.getFinalAmount());
        payment.setStatus(order.getPaymentStatus());

        // Generate realistic transaction ID
        payment.setTransactionId(
            "TXN-"
                + order.getOrderNumber()
                + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // Set payment/failure timestamps based on order date
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
          // Payment usually happens within 1-3 days of order for completed orders
          long daysOffset = faker.number().numberBetween(0, 3);
          payment.setPaidAt(order.getOrderDate().plusDays(daysOffset));
          payment.setGatewayResponse(
              "{\"status\":\"success\",\"message\":\"Payment processed successfully\"}");
        } else if (order.getPaymentStatus() == PaymentStatus.FAILED) {
          // Failed payments happen quickly (same day or next day)
          long hoursOffset = faker.number().numberBetween(1, 24);
          payment.setFailedAt(order.getOrderDate().plusHours(hoursOffset));
          payment.setFailureReason("Insufficient funds");
          payment.setGatewayResponse("{\"status\":\"failed\",\"error\":\"Insufficient funds\"}");
        }

        payments.add(payment);
      }
    }

    List<Payment> savedPayments = paymentRepository.saveAll(payments);
    entityManager.flush();
    log.info("Đã seed {} payments", savedPayments.size());
  }

  /**
   * Seeds stock transaction history for products. Creates realistic inventory movements including:
   * - Initial stock IN transactions - OUT transactions for sold products - Occasional ADJUSTMENT
   * transactions
   *
   * <p>This provides audit trail for inventory management.
   */
  @Transactional
  public void seedStockTransactions() {
    log.info("Đang seed StockTransactions...");
    List<Product> products = productRepository.findAll();
    List<OrderItem> orderItems = orderItemRepository.findAll();
    List<StockTransaction> transactions = new ArrayList<>();

    // Create initial stock IN transactions for all products
    for (Product product : products) {
      StockTransaction initialStock = new StockTransaction();
      initialStock.setProduct(product);
      initialStock.setType(StockTransactionType.IN);
      initialStock.setQuantity(product.getStock() + faker.number().numberBetween(50, 200));
      initialStock.setStockBefore(0);
      initialStock.setStockAfter(initialStock.getQuantity());
      initialStock.setNotes("Nhập kho ban đầu");
      initialStock.setCreatedBy(adminUser);
      transactions.add(initialStock);
    }

    // Create OUT transactions for order items (product sales)
    // Group by product to track running stock
    Map<Long, Integer> productCurrentStock = new HashMap<>();
    for (Product product : products) {
      productCurrentStock.put(
          product.getId(),
          transactions.stream()
              .filter(t -> t.getProduct().getId().equals(product.getId()))
              .mapToInt(StockTransaction::getStockAfter)
              .max()
              .orElse(0));
    }

    // Sample ~30% of order items to create stock OUT transactions
    List<OrderItem> sampledOrderItems =
        orderItems.stream().filter(item -> this.random.nextDouble() < 0.3).toList();

    for (OrderItem orderItem : sampledOrderItems) {
      Long productId = orderItem.getProduct().getId();
      Integer currentStock = productCurrentStock.get(productId);

      if (currentStock != null && currentStock >= orderItem.getQuantity()) {
        StockTransaction outTransaction = new StockTransaction();
        outTransaction.setProduct(orderItem.getProduct());
        outTransaction.setType(StockTransactionType.OUT);
        outTransaction.setQuantity(-orderItem.getQuantity());
        outTransaction.setStockBefore(currentStock);
        outTransaction.setStockAfter(currentStock - orderItem.getQuantity());
        outTransaction.setNotes("Xuất kho cho đơn hàng " + orderItem.getOrder().getOrderNumber());
        outTransaction.setCreatedBy(adminUser);
        transactions.add(outTransaction);

        // Update running stock
        productCurrentStock.put(productId, currentStock - orderItem.getQuantity());
      }
    }

    // Create some random ADJUSTMENT transactions (inventory corrections)
    for (int i = 0; i < 20; i++) {
      Product product = products.get(this.random.nextInt(products.size()));
      Integer currentStock = productCurrentStock.get(product.getId());
      if (currentStock == null) continue;

      // Random adjustment between -10 and +10
      int adjustment = faker.number().numberBetween(-10, 11);
      if (adjustment == 0) continue;

      StockTransaction adjustmentTransaction = new StockTransaction();
      adjustmentTransaction.setProduct(product);
      adjustmentTransaction.setType(StockTransactionType.ADJUSTMENT);
      adjustmentTransaction.setQuantity(adjustment);
      adjustmentTransaction.setStockBefore(currentStock);
      adjustmentTransaction.setStockAfter(currentStock + adjustment);
      adjustmentTransaction.setNotes(
          adjustment > 0
              ? "Điều chỉnh tăng tồn kho do kiểm kê"
              : "Điều chỉnh giảm tồn kho do hư hỏng");
      adjustmentTransaction.setCreatedBy(adminUser);
      transactions.add(adjustmentTransaction);

      productCurrentStock.put(product.getId(), currentStock + adjustment);
    }

    List<StockTransaction> savedTransactions = stockTransactionRepository.saveAll(transactions);
    entityManager.flush();
    log.info("Đã seed {} stock transactions", savedTransactions.size());
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

  /**
   * Seeds notification data with realistic links and messages. Creates notifications for orders,
   * products, and system messages. URLs are validated to ensure they follow proper format.
   */
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

            // Create meaningful message based on order status
            String statusMessage =
                switch (order.getStatus()) {
                  case PENDING -> "đang chờ xử lý";
                  case CONFIRMED -> "đã được xác nhận";
                  case SHIPPED -> "đang trên đường giao đến bạn";
                  case DELIVERED -> "đã được giao thành công";
                  case CANCELLED -> "đã bị hủy";
                };
            notification.setMessage("Đơn hàng của bạn " + statusMessage);

            // Use relative URL format that works with frontend routing
            notification.setLinkUrl("/orders/" + order.getId());
          } else {
            notification.setTitle("Thông báo đơn hàng");
            notification.setMessage(faker.lorem().sentence());
            notification.setLinkUrl("/orders");
          }
          break;

        case PRODUCT:
          if (!products.isEmpty()) {
            Product product = products.get(this.random.nextInt(products.size()));
            String[] productMessages = {
              "Sản phẩm mới: " + product.getName(),
              "Đặc biệt dành cho bạn: " + product.getName(),
              "Sản phẩm hot: " + product.getName() + " - Đừng bỏ lỡ!",
              product.getName() + " đang có khuyến mãi đặc biệt"
            };
            notification.setTitle("Sản phẩm nổi bật");
            notification.setMessage(productMessages[this.random.nextInt(productMessages.length)]);

            // Use slug for SEO-friendly URLs
            notification.setLinkUrl("/products/" + product.getSlug());
          } else {
            notification.setTitle("Thông báo sản phẩm");
            notification.setMessage(faker.lorem().sentence());
            notification.setLinkUrl("/products");
          }
          break;

        case SYSTEM:
          String[] systemTitles = {
            "Cập nhật hệ thống",
            "Thông báo bảo trì",
            "Chính sách mới",
            "Khuyến mãi đặc biệt",
            "Tin tức quan trọng"
          };
          notification.setTitle(systemTitles[this.random.nextInt(systemTitles.length)]);
          notification.setMessage(faker.lorem().paragraph());

          // System notifications may link to various pages
          String[] systemLinks = {"/", "/promotions", "/about", "/contact", "/faq"};
          notification.setLinkUrl(systemLinks[this.random.nextInt(systemLinks.length)]);
          break;
      }

      notification.setIsRead(this.random.nextDouble() < 0.4); // 40% read
      if (notification.getIsRead()) {
        notification.setReadAt(LocalDateTime.now().minusDays(faker.number().numberBetween(0, 30)));
      }

      notifications.add(notification);
    }

    notificationRepository.saveAll(notifications);
    log.info("Đã seed {} notifications với validated URLs", notifications.size());
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
