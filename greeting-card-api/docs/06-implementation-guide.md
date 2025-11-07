# Hướng Dẫn Triển Khai

## 1. Yêu Cầu Hệ Thống

### 1.1. Phần Mềm Cần Thiết

- **Java:** JDK 17 hoặc cao hơn
- **Maven:** 3.6+ (hoặc sử dụng Maven Wrapper)
- **PostgreSQL:** 12+
- **IDE:** IntelliJ IDEA, Eclipse, hoặc VS Code với Java extensions

### 1.2. Công Cụ Khác

- **Git:** Để quản lý source code
- **Postman/Insomnia:** Để test API
- **pgAdmin/DBeaver:** Để quản lý database

## 2. Cài Đặt Môi Trường

### 2.1. Cài Đặt PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Tạo Database:**
```bash
sudo -u postgres psql
CREATE DATABASE greeting_cards_db;
CREATE USER greeting_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE greeting_cards_db TO greeting_user;
\q
```

### 2.2. Cấu Hình Environment Variables

Tạo file `.env` trong thư mục root của project:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greeting_cards_db
DB_USERNAME=greeting_user
DB_PASSWORD=your_password

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Application Configuration
SERVER_PORT=8080
```

**Lưu ý:** File `.env` nên được thêm vào `.gitignore` để không commit lên repository.

## 3. Cấu Trúc Thư Mục Đề Xuất

```
src/main/java/iuh/fit/se/
├── controller/
│   ├── ProductController.java
│   ├── CategoryController.java
│   ├── CartController.java
│   ├── OrderController.java
│   ├── AuthController.java
│   └── admin/
│       ├── AdminProductController.java
│       ├── AdminCategoryController.java
│       ├── AdminUserController.java
│       └── AdminOrderController.java
├── service/
│   ├── ProductService.java
│   ├── CategoryService.java
│   ├── CartService.java
│   ├── OrderService.java
│   ├── UserService.java
│   ├── AuthService.java
│   └── EmailService.java
├── repository/
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   ├── CategoryRepository.java
│   ├── OrderRepository.java
│   └── OrderItemRepository.java
├── entity/
│   ├── User.java
│   ├── Product.java
│   ├── Category.java
│   ├── Order.java
│   └── OrderItem.java
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── CreateProductRequest.java
│   │   └── UpdateProductRequest.java
│   ├── response/
│   │   ├── ProductDTO.java
│   │   ├── CategoryDTO.java
│   │   ├── OrderDTO.java
│   │   └── UserDTO.java
│   └── ApiResponse.java
├── mapper/
│   ├── ProductMapper.java
│   ├── CategoryMapper.java
│   ├── OrderMapper.java
│   └── UserMapper.java
├── security/
│   ├── SecurityConfig.java
│   ├── JwtTokenProvider.java (nếu dùng JWT)
│   └── UserDetailsServiceImpl.java
├── config/
│   ├── EnvironmentConfig.java
│   ├── WebConfig.java
│   └── SessionConfig.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── EntityNotFoundException.java
│   ├── ValidationException.java
│   └── BusinessException.java
└── util/
    ├── PasswordEncoder.java
    └── ValidationUtil.java
```

## 4. Các Bước Triển Khai

### 4.1. Bước 1: Tạo BaseEntity và Entities

Bắt đầu với BaseEntity (MappedSuperclass) chứa các fields chung:

**BaseEntity:**
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    // Getters, setters
}
```

Sau đó tạo các JPA Entities:

1. **User Entity** (với Soft Delete)
   ```java
   @Entity
   @Table(name = "users",
          indexes = {
              @Index(name = "idx_users_email", columnList = "email"),
              @Index(name = "idx_users_deleted_at", columnList = "deleted_at"),
              @Index(name = "idx_users_role", columnList = "role")
          })
   @SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
   @Where(clause = "deleted_at IS NULL")
   public class User extends BaseEntity {
       @Column(nullable = false, unique = true, length = 255)
       @Email
       private String email;

       @Column(nullable = false)
       private String password; // Sẽ được hash bằng BCrypt

       @Column(name = "full_name", nullable = false, length = 255)
       private String fullName;

       @Column(length = 20)
       private String phone;

       @Enumerated(EnumType.STRING)
       @Column(nullable = false, length = 20)
       private UserRole role = UserRole.CUSTOMER;

       @Column(name = "email_verified", nullable = false)
       private Boolean emailVerified = false;

       @Column(name = "email_verification_token", length = 255)
       private String emailVerificationToken;

       @Column(name = "email_verification_expires_at")
       private LocalDateTime emailVerificationExpiresAt;

       @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<Order> orders = new ArrayList<>();

       @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<RefreshToken> refreshTokens = new ArrayList<>();

       @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<UserAddress> addresses = new ArrayList<>();

       @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<Wishlist> wishlistItems = new ArrayList<>();

       @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<ProductReview> reviews = new ArrayList<>();

       // Getters, setters
   }
   ```

2. **Category Entity** (với Hierarchy và Soft Delete)
   ```java
   @Entity
   @Table(name = "categories",
          indexes = {
              @Index(name = "idx_categories_name", columnList = "name"),
              @Index(name = "idx_categories_slug", columnList = "slug"),
              @Index(name = "idx_categories_parent_id", columnList = "parent_id")
          })
   @SQLDelete(sql = "UPDATE categories SET deleted_at = NOW() WHERE id = ?")
   @Where(clause = "deleted_at IS NULL")
   public class Category extends BaseEntity {
       @Column(nullable = false, length = 255)
       private String name;

       @Column(unique = true, length = 255)
       private String slug;

       @Column(columnDefinition = "TEXT")
       private String description;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "parent_id")
       private Category parent;

       @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
       private List<Category> children = new ArrayList<>();

       @Column(name = "image_url", length = 500)
       private String imageUrl;

       @Column(name = "display_order")
       private Integer displayOrder = 0;

       @Column(name = "is_active", nullable = false)
       private Boolean isActive = true;

       @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<Product> products = new ArrayList<>();

       // Getters, setters
   }
   ```

3. **Product Entity** (với Soft Delete)
   ```java
   @Entity
   @Table(name = "products",
          indexes = {
              @Index(name = "idx_products_category_id", columnList = "category_id"),
              @Index(name = "idx_products_name", columnList = "name"),
              @Index(name = "idx_products_slug", columnList = "slug"),
              @Index(name = "idx_products_sku", columnList = "sku")
          })
   @SQLDelete(sql = "UPDATE products SET deleted_at = NOW() WHERE id = ?")
   @Where(clause = "deleted_at IS NULL")
   public class Product extends BaseEntity {
       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "category_id", nullable = false)
       private Category category;

       @Column(nullable = false, length = 255)
       private String name;

       @Column(unique = true, length = 255)
       private String slug;

       @Column(columnDefinition = "TEXT")
       private String description;

       @Column(nullable = false, precision = 10, scale = 2)
       @DecimalMin(value = "0.01")
       private BigDecimal price;

       @Column(nullable = false)
       @Min(0)
       private Integer stock = 0;

       @Column(unique = true, length = 100)
       private String sku;

       @Column(name = "is_active", nullable = false)
       private Boolean isActive = true;

       @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<ProductImage> images = new ArrayList<>();

       @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
       private List<OrderItem> orderItems = new ArrayList<>();

       @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<ProductReview> reviews = new ArrayList<>();

       @ManyToMany
       @JoinTable(
           name = "product_tag_map",
           joinColumns = @JoinColumn(name = "product_id"),
           inverseJoinColumns = @JoinColumn(name = "tag_id")
       )
       private Set<ProductTag> tags = new HashSet<>();

       // Getters, setters
   }
   ```

4. **ProductImage Entity**
   ```java
   @Entity
   @Table(name = "product_images",
          indexes = @Index(name = "idx_product_images_product_id", columnList = "product_id"))
   public class ProductImage {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "product_id", nullable = false)
       private Product product;

       @Column(name = "image_url", nullable = false, length = 500)
       private String imageUrl;

       @Column(name = "alt_text", length = 255)
       private String altText;

       @Column(name = "is_primary", nullable = false)
       private Boolean isPrimary = false;

       @Column(name = "display_order")
       private Integer displayOrder = 0;

       @Column(name = "created_at", nullable = false, updatable = false)
       @CreationTimestamp
       private LocalDateTime createdAt;

       // Getters, setters
   }
   ```

5. **ProductReview Entity**
   ```java
   @Entity
   @Table(name = "product_reviews",
          indexes = {
              @Index(name = "idx_product_reviews_product_id", columnList = "product_id"),
              @Index(name = "idx_product_reviews_user_id", columnList = "user_id"),
              @Index(name = "idx_product_reviews_rating", columnList = "rating")
          },
          uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
   public class ProductReview {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "product_id", nullable = false)
       private Product product;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "user_id", nullable = false)
       private User user;

       @Column(nullable = false)
       @Min(1)
       @Max(5)
       private Integer rating;

       @Column(columnDefinition = "TEXT")
       private String comment;

       @Column(name = "is_verified_purchase", nullable = false)
       private Boolean isVerifiedPurchase = false;

       @Column(name = "is_approved", nullable = false)
       private Boolean isApproved = false;

       @Column(name = "created_at", nullable = false, updatable = false)
       @CreationTimestamp
       private LocalDateTime createdAt;

       @Column(name = "updated_at")
       @UpdateTimestamp
       private LocalDateTime updatedAt;

       // Getters, setters
   }
   ```

6. **Wishlist Entity**
   ```java
   @Entity
   @Table(name = "wishlist",
          indexes = {
              @Index(name = "idx_wishlist_user_id", columnList = "user_id"),
              @Index(name = "idx_wishlist_product_id", columnList = "product_id")
          },
          uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
   public class Wishlist {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "user_id", nullable = false)
       private User user;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "product_id", nullable = false)
       private Product product;

       @Column(name = "created_at", nullable = false, updatable = false)
       @CreationTimestamp
       private LocalDateTime createdAt;

       // Getters, setters
   }
   ```

7. **UserAddress Entity** (với Soft Delete)
   ```java
   @Entity
   @Table(name = "user_addresses",
          indexes = {
              @Index(name = "idx_user_addresses_user_id", columnList = "user_id"),
              @Index(name = "idx_user_addresses_is_default", columnList = "is_default")
          })
   @SQLDelete(sql = "UPDATE user_addresses SET deleted_at = NOW() WHERE id = ?")
   @Where(clause = "deleted_at IS NULL")
   public class UserAddress extends BaseEntity {
       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "user_id", nullable = false)
       private User user;

       @Column(name = "recipient_name", nullable = false, length = 255)
       private String recipientName;

       @Column(nullable = false, length = 20)
       private String phone;

       @Column(name = "address_line1", nullable = false, length = 255)
       private String addressLine1;

       @Column(name = "address_line2", length = 255)
       private String addressLine2;

       @Column(nullable = false, length = 100)
       private String city;

       @Column(length = 100)
       private String district;

       @Column(length = 100)
       private String ward;

       @Column(name = "postal_code", length = 20)
       private String postalCode;

       @Column(name = "is_default", nullable = false)
       private Boolean isDefault = false;

       // Getters, setters
   }
   ```

8. **Order Entity** (với Soft Delete và các trường mới)
   ```java
   @Entity
   @Table(name = "orders",
          indexes = {
              @Index(name = "idx_orders_user_id", columnList = "user_id"),
              @Index(name = "idx_orders_order_date", columnList = "order_date"),
              @Index(name = "idx_orders_status", columnList = "status"),
              @Index(name = "idx_orders_order_number", columnList = "order_number")
          })
   @SQLDelete(sql = "UPDATE orders SET deleted_at = NOW() WHERE id = ?")
   @Where(clause = "deleted_at IS NULL")
   public class Order extends BaseEntity {
       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "user_id", nullable = false)
       private User user;

       @Column(name = "order_number", unique = true, length = 50)
       private String orderNumber;

       @Column(name = "order_date", nullable = false, updatable = false)
       @CreationTimestamp
       private LocalDateTime orderDate;

       @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
       @DecimalMin(value = "0.01")
       private BigDecimal totalAmount;

       @Column(name = "discount_amount", precision = 10, scale = 2)
       private BigDecimal discountAmount = BigDecimal.ZERO;

       @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
       private BigDecimal finalAmount;

       @Enumerated(EnumType.STRING)
       @Column(nullable = false, length = 20)
       private OrderStatus status = OrderStatus.PENDING;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "payment_method_id")
       private PaymentMethod paymentMethod;

       @Enumerated(EnumType.STRING)
       @Column(name = "payment_status", length = 20)
       private PaymentStatus paymentStatus = PaymentStatus.PENDING;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "shipping_address_id")
       private UserAddress shippingAddress;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "coupon_id")
       private Coupon coupon;

       @Column(columnDefinition = "TEXT")
       private String notes;

       @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<OrderItem> orderItems = new ArrayList<>();

       @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
       private List<OrderStatusHistory> statusHistory = new ArrayList<>();

       // Getters, setters
   }
   ```

9. **OrderItem Entity** (với subtotal)
   ```java
   @Entity
   @Table(name = "order_items",
          indexes = {
              @Index(name = "idx_order_items_order_id", columnList = "order_id"),
              @Index(name = "idx_order_items_product_id", columnList = "product_id")
          })
   public class OrderItem {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "order_id", nullable = false)
       private Order order;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "product_id", nullable = false)
       private Product product;

       @Column(nullable = false)
       @Min(1)
       private Integer quantity;

       @Column(nullable = false, precision = 10, scale = 2)
       @DecimalMin(value = "0.01")
       private BigDecimal price;

       @Column(nullable = false, precision = 10, scale = 2)
       private BigDecimal subtotal; // quantity × price

       // Getters, setters
   }
   ```

10. **OrderStatusHistory Entity**
    ```java
    @Entity
    @Table(name = "order_status_history",
           indexes = {
               @Index(name = "idx_order_status_history_order_id", columnList = "order_id"),
               @Index(name = "idx_order_status_history_created_at", columnList = "created_at")
           })
    public class OrderStatusHistory {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "order_id", nullable = false)
        private Order order;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 20)
        private OrderStatus status;

        @Column(columnDefinition = "TEXT")
        private String notes;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "changed_by", nullable = false)
        private User changedBy;

        @Column(name = "created_at", nullable = false, updatable = false)
        @CreationTimestamp
        private LocalDateTime createdAt;

        // Getters, setters
    }
    ```

11. **Coupon Entity** (với Soft Delete)
    ```java
    @Entity
    @Table(name = "coupons",
           indexes = {
               @Index(name = "idx_coupons_code", columnList = "code"),
               @Index(name = "idx_coupons_is_active", columnList = "is_active")
           })
    @SQLDelete(sql = "UPDATE coupons SET deleted_at = NOW() WHERE id = ?")
    @Where(clause = "deleted_at IS NULL")
    public class Coupon extends BaseEntity {
        @Column(nullable = false, unique = true, length = 50)
        private String code;

        @Enumerated(EnumType.STRING)
        @Column(name = "discount_type", nullable = false, length = 20)
        private DiscountType discountType;

        @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
        @DecimalMin(value = "0.01")
        private BigDecimal discountValue;

        @Column(name = "min_purchase", precision = 10, scale = 2)
        private BigDecimal minPurchase = BigDecimal.ZERO;

        @Column(name = "max_discount", precision = 10, scale = 2)
        private BigDecimal maxDiscount;

        @Column(name = "valid_from", nullable = false)
        private LocalDateTime validFrom;

        @Column(name = "valid_until", nullable = false)
        private LocalDateTime validUntil;

        @Column(name = "usage_limit")
        private Integer usageLimit;

        @Column(name = "used_count", nullable = false)
        private Integer usedCount = 0;

        @Column(name = "is_active", nullable = false)
        private Boolean isActive = true;

        @OneToMany(mappedBy = "coupon")
        private List<Order> orders = new ArrayList<>();

        // Getters, setters

        public boolean isValid() {
            LocalDateTime now = LocalDateTime.now();
            return isActive
                && now.isAfter(validFrom)
                && now.isBefore(validUntil)
                && (usageLimit == null || usedCount < usageLimit);
        }
    }
    ```

12. **PaymentMethod Entity**
    ```java
    @Entity
    @Table(name = "payment_methods",
           indexes = {
               @Index(name = "idx_payment_methods_code", columnList = "code"),
               @Index(name = "idx_payment_methods_is_active", columnList = "is_active")
           })
    public class PaymentMethod {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, length = 100)
        private String name;

        @Column(unique = true, length = 50)
        private String code;

        @Column(columnDefinition = "TEXT")
        private String description;

        @Column(name = "is_active", nullable = false)
        private Boolean isActive = true;

        @Column(name = "display_order")
        private Integer displayOrder = 0;

        @Column(name = "created_at", nullable = false, updatable = false)
        @CreationTimestamp
        private LocalDateTime createdAt;

        @Column(name = "updated_at")
        @UpdateTimestamp
        private LocalDateTime updatedAt;

        @OneToMany(mappedBy = "paymentMethod")
        private List<Order> orders = new ArrayList<>();

        // Getters, setters
    }
    ```

13. **Notification Entity**
    ```java
    @Entity
    @Table(name = "notifications",
           indexes = {
               @Index(name = "idx_notifications_user_id", columnList = "user_id"),
               @Index(name = "idx_notifications_is_read", columnList = "is_read"),
               @Index(name = "idx_notifications_type", columnList = "type")
           })
    public class Notification {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 50)
        private NotificationType type;

        @Column(nullable = false, length = 255)
        private String title;

        @Column(nullable = false, columnDefinition = "TEXT")
        private String message;

        @Column(name = "link_url", length = 500)
        private String linkUrl;

        @Column(name = "is_read", nullable = false)
        private Boolean isRead = false;

        @Column(name = "read_at")
        private LocalDateTime readAt;

        @Column(name = "created_at", nullable = false, updatable = false)
        @CreationTimestamp
        private LocalDateTime createdAt;

        // Getters, setters
    }
    ```

14. **ProductTag Entity**
    ```java
    @Entity
    @Table(name = "product_tags",
           indexes = {
               @Index(name = "idx_product_tags_name", columnList = "name"),
               @Index(name = "idx_product_tags_slug", columnList = "slug")
           })
    public class ProductTag {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true, length = 100)
        private String name;

        @Column(unique = true, length = 100)
        private String slug;

        @Column(name = "created_at", nullable = false, updatable = false)
        @CreationTimestamp
        private LocalDateTime createdAt;

        @ManyToMany(mappedBy = "tags")
        private Set<Product> products = new HashSet<>();

        // Getters, setters
    }
    ```

15. **RefreshToken Entity** (giữ nguyên như cũ)
   ```java
   @Entity
   @Table(name = "refresh_tokens")
   public class RefreshToken {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "user_id", nullable = false)
       private User user;

       @Column(nullable = false, unique = true, length = 500)
       private String token;

       @Column(name = "expires_at", nullable = false)
       private LocalDateTime expiresAt;

       @CreatedDate
       @Column(name = "created_at", nullable = false, updatable = false)
       private LocalDateTime createdAt;

       public boolean isExpired() {
           return expiresAt.isBefore(LocalDateTime.now());
       }
   }
   ```

**Lưu ý:**
- Sử dụng `@EntityListeners(AuditingEntityListener.class)` trên các Entity cần auditing
- Enable JPA Auditing trong main class: `@EnableJpaAuditing(auditorAwareRef = "auditorProvider")`
- Sử dụng `FetchType.LAZY` để tránh N+1 problem
- Sử dụng `CascadeType.ALL` và `orphanRemoval = true` cho parent-child relationships
- **Soft Delete:** Sử dụng `@SQLDelete` và `@Where` để tự động filter deleted records
- **BaseEntity:** Tất cả entities quan trọng extend BaseEntity để có Soft Delete và Auditing

### 4.2. Bước 2: Tạo Repositories

Tạo các interface Repository extends `JpaRepository<T, ID>` hoặc `PagingAndSortingRepository<T, ID>`:

**ProductRepository:**
```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Query Methods - Spring tự generate queries
    List<Product> findByCategoryId(Long categoryId);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    List<Product> findByNameContainingIgnoreCase(String name);

    // Kiểm tra ràng buộc xóa
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.product.id = :productId")
    boolean hasOrderItems(@Param("productId") Long productId);

    // Hoặc sử dụng exists method
    boolean existsByIdAndOrderItemsIsNotEmpty(Long id);

    // Tìm kiếm với nhiều điều kiện
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "p.stock > 0")
    Page<Product> searchProducts(
        @Param("categoryId") Long categoryId,
        @Param("search") String search,
        Pageable pageable
    );
}
```

**CategoryRepository:**
```java
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.category.id = :categoryId")
    boolean hasProducts(@Param("categoryId") Long categoryId);

    boolean existsByIdAndProductsIsNotEmpty(Long id);
}
```

**UserRepository:**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.user.id = :userId AND o.deletedAt IS NULL")
    boolean hasOrders(@Param("userId") Long userId);

    boolean existsByIdAndOrdersIsNotEmpty(Long id);

    // Tìm kiếm với phân trang
    Page<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
        String email, String fullName, Pageable pageable
    );
}
```

**ProductImageRepository:**
```java
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);
    void deleteByProductId(Long productId);
}
```

**ProductReviewRepository:**
```java
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductIdAndIsApprovedTrue(Long productId, Pageable pageable);
    Optional<ProductReview> findByProductIdAndUserId(Long productId, Long userId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.isApproved = true")
    Double getAverageRating(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.isApproved = true")
    Long getReviewCount(@Param("productId") Long productId);
}
```

**WishlistRepository:**
```java
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Page<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
}
```

**UserAddressRepository:**
```java
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdAndDeletedAtIsNull(Long userId);
    Optional<UserAddress> findByUserIdAndIsDefaultTrueAndDeletedAtIsNull(Long userId);
    void updateIsDefaultToFalseForUser(Long userId);
}
```

**OrderStatusHistoryRepository:**
```java
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
```

**CouponRepository:**
```java
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeAndDeletedAtIsNull(String code);

    @Query("SELECT c FROM Coupon c WHERE " +
           "c.deletedAt IS NULL AND " +
           "c.isActive = true AND " +
           "c.validFrom <= :now AND " +
           "c.validUntil >= :now AND " +
           "(c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    List<Coupon> findActiveCoupons(@Param("now") LocalDateTime now);

    boolean existsByCodeAndDeletedAtIsNull(String code);
}
```

**PaymentMethodRepository:**
```java
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<PaymentMethod> findByCode(String code);
}
```

**NotificationRepository:**
```java
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead, Pageable pageable);
    long countByUserIdAndIsReadFalse(Long userId);
    void markAllAsReadByUserId(Long userId);
}
```

**ProductTagRepository:**
```java
public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {
    Optional<ProductTag> findByName(String name);
    Optional<ProductTag> findBySlug(String slug);
    List<ProductTag> findByNameContainingIgnoreCase(String name);
}
```

**OrderRepository:**
```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByOrderDateDesc(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findAllByUserId(@Param("userId") Long userId);

    // Admin: Lấy tất cả đơn hàng với filter
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findAllOrders(@Param("status") OrderStatus status, Pageable pageable);
}
```

**OrderItemRepository:**
```java
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findAllByOrderId(@Param("orderId") Long orderId);
}
```

**RefreshTokenRepository:**
```java
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserId(Long userId);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiresAt < :now")
    List<RefreshToken> findExpiredTokens(@Param("now") LocalDateTime now);

    void deleteByUserId(Long userId);

    void deleteByToken(String token);
}
```

**Lưu ý về Query Methods:**
- Spring Data JPA tự động generate queries dựa trên method names
- Naming convention: `findBy...`, `existsBy...`, `countBy...`
- Hỗ trợ `Pageable` và `Sort` cho pagination và sorting
- Sử dụng `@Query` cho custom queries phức tạp
- Sử dụng `@Param` để bind parameters trong JPQL queries

### 4.3. Bước 3: Tạo DTOs

Tạo các DTO cho Request và Response:

**Request DTOs:**
- RegisterRequest
- LoginRequest
- CreateProductRequest
- UpdateProductRequest
- CreateOrderRequest

**Response DTOs:**
- ProductDTO
- CategoryDTO
- OrderDTO
- UserDTO (không bao gồm password)

**Wrapper:**
- ApiResponse<T> - Wrapper cho tất cả API responses

### 4.4. Bước 4: Tạo Mappers

Sử dụng MapStruct hoặc manual mapping để chuyển đổi giữa Entity và DTO:

```java
@Component
public class ProductMapper {
    public ProductDTO toDTO(Product product) {
        // Mapping logic
    }

    public Product toEntity(CreateProductRequest request) {
        // Mapping logic
    }
}
```

### 4.5. Bước 5: Tạo Services

Implement business logic trong Services:

**ProductService:**
```java
@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductDTO createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException("Loại sản phẩm không tồn tại"));

        Product product = productMapper.toEntity(request);
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    public ProductDTO updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        productMapper.updateEntity(request, product);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDTO(updatedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        if (productRepository.hasOrderItems(id)) {
            throw new BusinessException("Không thể xóa sản phẩm đã có trong đơn hàng");
        }

        // Soft delete - chỉ set deletedAt
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public Page<ProductDTO> getAllProducts(int page, int size, Long categoryId, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Product> products = productRepository.searchProducts(categoryId, search, pageable);
        return products.map(productMapper::toDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));
        return productMapper.toDTO(product);
    }
}
```

**CategoryService:**
```java
@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryDTO createCategory(CreateCategoryRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new ValidationException("Tên loại sản phẩm đã tồn tại");
        }

        Category category = categoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDTO(savedCategory);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Loại sản phẩm không tồn tại"));

        if (categoryRepository.hasProducts(id)) {
            throw new BusinessException("Không thể xóa loại sản phẩm đã có sản phẩm");
        }

        // Soft delete
        category.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(category);
    }

    // Các methods khác tương tự
}
```

**OrderService:**
```java
@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final CouponRepository couponRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final HttpSession session;

    public OrderDTO createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        // Lấy giỏ hàng từ session
        Map<Long, Integer> cart = getCartFromSession();
        if (cart.isEmpty()) {
            throw new BusinessException("Giỏ hàng trống");
        }

        // Validate và lấy địa chỉ giao hàng
        UserAddress shippingAddress = addressRepository.findById(request.getShippingAddressId())
            .orElseThrow(() -> new EntityNotFoundException("Địa chỉ không tồn tại"));

        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new BusinessException("Địa chỉ không thuộc về người dùng");
        }

        // Validate và lấy phương thức thanh toán
        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
            .orElseThrow(() -> new EntityNotFoundException("Phương thức thanh toán không tồn tại"));

        if (!paymentMethod.getIsActive()) {
            throw new BusinessException("Phương thức thanh toán không khả dụng");
        }

        // Validate và áp dụng mã giảm giá (nếu có)
        Coupon coupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            coupon = couponRepository.findByCodeAndDeletedAtIsNull(request.getCouponCode())
                .orElseThrow(() -> new BusinessException("Mã giảm giá không hợp lệ"));

            if (!coupon.isValid()) {
                throw new BusinessException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
            }
        }

        // Tính toán tổng tiền
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

            int quantity = entry.getValue();
            if (product.getStock() < quantity) {
                throw new BusinessException("Số lượng tồn kho không đủ cho sản phẩm: " + product.getName());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(null); // Sẽ set sau khi tạo Order
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(itemTotal);
            orderItems.add(orderItem);

            // Cập nhật số lượng tồn kho
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);
        }

        // Tính toán giảm giá
        if (coupon != null && totalAmount.compareTo(coupon.getMinPurchase()) >= 0) {
            if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                discountAmount = totalAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (coupon.getMaxDiscount() != null && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discountAmount = coupon.getMaxDiscount();
                }
            } else {
                discountAmount = coupon.getDiscountValue();
            }

            // Cập nhật số lần sử dụng coupon
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Tạo đơn hàng
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
        order.setNotes(request.getNotes());

        // Set order cho các orderItems
        orderItems.forEach(item -> item.setOrder(order));
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Tạo record đầu tiên trong order_status_history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setStatus(OrderStatus.PENDING);
        history.setNotes("Đơn hàng mới được tạo");
        history.setChangedBy(user);
        statusHistoryRepository.save(history);

        // Gửi email xác nhận
        emailService.sendOrderConfirmationEmail(user, savedOrder);

        // Tạo thông báo
        notificationService.createOrderNotification(user, savedOrder);

        // Xóa giỏ hàng
        session.removeAttribute("cart");

        return orderMapper.toDTO(savedOrder);
    }

    public void updateOrderStatus(Long orderId, OrderStatus newStatus, String notes, User changedBy) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Đơn hàng không tồn tại"));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        orderRepository.save(order);

        // Tạo record trong order_status_history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(newStatus);
        history.setNotes(notes != null ? notes : "Thay đổi từ " + oldStatus + " sang " + newStatus);
        history.setChangedBy(changedBy);
        statusHistoryRepository.save(history);

        // Tạo thông báo cho khách hàng
        notificationService.createOrderStatusChangeNotification(order.getUser(), order, newStatus);
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
               "-" + String.format("%03d", getNextOrderSequence());
    }

    private int getNextOrderSequence() {
        // Implement logic để lấy sequence number
        // Có thể sử dụng database sequence hoặc count orders trong ngày
        return 1; // Placeholder
    }
}
```

**CartService:**
- addToCart() - lưu vào session
- getCart() - lấy từ session
- updateCartItem() - cập nhật số lượng
- removeFromCart() - xóa khỏi session
- clearCart() - xóa toàn bộ cart

**AuthService:**
```java
@Service
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationService emailVerificationService;
    private final CookieUtil cookieUtil;

    public UserDTO register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email đã tồn tại");
        }

        // Tạo user mới
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt hash
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Gửi email xác thực
        emailVerificationService.sendVerificationEmail(savedUser);

        return userMapper.toDTO(savedUser);
    }

    public void login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthenticationException("Email hoặc mật khẩu không đúng"));

        // Kiểm tra password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Email hoặc mật khẩu không đúng");
        }

        // Kiểm tra email đã xác thực
        if (!user.getEmailVerified()) {
            throw new ForbiddenException("Email chưa được xác thực. Vui lòng kiểm tra email.");
        }

        // Tạo tokens
        String accessToken = jwtTokenProvider.createAccessToken(
            UserPrincipal.create(user)
        );
        String refreshTokenString = jwtTokenProvider.createRefreshToken(user.getId());

        // Lưu refresh token vào database
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenString);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 ngày
        refreshTokenRepository.save(refreshToken);

        // Set cookies
        cookieUtil.setCookie(response, "accessToken", accessToken, 15 * 60); // 15 phút
        cookieUtil.setCookie(response, "refreshToken", refreshTokenString, 7 * 24 * 60 * 60); // 7 ngày
    }

    public void refreshToken(String refreshTokenString, HttpServletResponse response) {
        // Tìm refresh token trong database
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
            .orElseThrow(() -> new AuthenticationException("Refresh token không hợp lệ"));

        // Kiểm tra token đã hết hạn chưa
        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new AuthenticationException("Refresh token đã hết hạn");
        }

        User user = refreshToken.getUser();

        // Tạo accessToken mới
        String newAccessToken = jwtTokenProvider.createAccessToken(
            UserPrincipal.create(user)
        );

        cookieUtil.setCookie(response, "accessToken", newAccessToken, 15 * 60);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
            .orElseThrow(() -> new ValidationException("Token xác thực không hợp lệ"));

        if (user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Token xác thực đã hết hạn");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);
    }

    public void logout(String refreshTokenString, HttpServletResponse response) {
        // Xóa refresh token từ database
        refreshTokenRepository.findByToken(refreshTokenString)
            .ifPresent(refreshTokenRepository::delete);

        // Xóa cookies
        cookieUtil.deleteCookie(response, "accessToken");
        cookieUtil.deleteCookie(response, "refreshToken");
    }

    // Logout tất cả thiết bị (xóa tất cả refresh tokens của user)
    public void logoutAll(Long userId, HttpServletResponse response) {
        refreshTokenRepository.deleteByUserId(userId);
        cookieUtil.deleteCookie(response, "accessToken");
        cookieUtil.deleteCookie(response, "refreshToken");
    }
}
```

**ReviewService:**
```java
@Service
@Transactional
public class ReviewService {
    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public ProductReviewDTO createReview(Long userId, Long productId, CreateReviewRequest request) {
        // Kiểm tra đã đánh giá chưa
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        // Kiểm tra đã mua sản phẩm chưa
        boolean hasPurchased = orderRepository.existsByUserIdAndOrderItemsProductId(userId, productId);

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsVerifiedPurchase(hasPurchased);
        review.setIsApproved(false); // Cần admin duyệt

        ProductReview savedReview = reviewRepository.save(review);
        return reviewMapper.toDTO(savedReview);
    }

    public void approveReview(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new EntityNotFoundException("Đánh giá không tồn tại"));
        review.setIsApproved(true);
        reviewRepository.save(review);
    }
}
```

**WishlistService:**
```java
@Service
@Transactional
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public void addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BusinessException("Sản phẩm đã có trong wishlist");
        }

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(userRepository.findById(userId).orElseThrow());
        wishlist.setProduct(product);
        wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
```

**AddressService:**
```java
@Service
@Transactional
public class AddressService {
    private final UserAddressRepository addressRepository;

    public UserAddressDTO createAddress(Long userId, CreateAddressRequest request) {
        UserAddress address = new UserAddress();
        address.setUser(userRepository.findById(userId).orElseThrow());
        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setPostalCode(request.getPostalCode());
        address.setIsDefault(request.getIsDefault());

        // Nếu set làm mặc định, bỏ mặc định của các địa chỉ khác
        if (request.getIsDefault()) {
            addressRepository.updateIsDefaultToFalseForUser(userId);
        }

        UserAddress savedAddress = addressRepository.save(address);
        return addressMapper.toDTO(savedAddress);
    }

    public void setDefaultAddress(Long userId, Long addressId) {
        addressRepository.updateIsDefaultToFalseForUser(userId);
        UserAddress address = addressRepository.findById(addressId).orElseThrow();
        address.setIsDefault(true);
        addressRepository.save(address);
    }
}
```

**CouponService:**
```java
@Service
@Transactional
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponValidationDTO validateCoupon(String code, BigDecimal totalAmount) {
        Coupon coupon = couponRepository.findByCodeAndDeletedAtIsNull(code)
            .orElseThrow(() -> new BusinessException("Mã giảm giá không hợp lệ"));

        if (!coupon.isValid()) {
            throw new BusinessException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        }

        if (totalAmount.compareTo(coupon.getMinPurchase()) < 0) {
            throw new BusinessException("Giá trị đơn hàng chưa đạt mức tối thiểu");
        }

        BigDecimal discountAmount = calculateDiscount(coupon, totalAmount);
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        return CouponValidationDTO.builder()
            .code(code)
            .discountAmount(discountAmount)
            .finalAmount(finalAmount)
            .build();
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal totalAmount) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal discount = totalAmount.multiply(coupon.getDiscountValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                return coupon.getMaxDiscount();
            }
            return discount;
        } else {
            return coupon.getDiscountValue();
        }
    }
}
```

**NotificationService:**
```java
@Service
@Transactional
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public void createOrderNotification(User user, Order order) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.ORDER);
        notification.setTitle("Đơn hàng mới");
        notification.setMessage("Đơn hàng #" + order.getOrderNumber() + " đã được tạo thành công");
        notification.setLinkUrl("/orders/" + order.getId());
        notificationRepository.save(notification);
    }

    public void createOrderStatusChangeNotification(User user, Order order, OrderStatus newStatus) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.ORDER);
        notification.setTitle("Trạng thái đơn hàng thay đổi");
        notification.setMessage("Đơn hàng #" + order.getOrderNumber() + " đã chuyển sang trạng thái: " + newStatus);
        notification.setLinkUrl("/orders/" + order.getId());
        notificationRepository.save(notification);
    }

    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new EntityNotFoundException("Thông báo không tồn tại"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Không có quyền truy cập thông báo này");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
}
```

**EmailService:**
- sendRegistrationEmail()
- sendOrderConfirmationEmail()

### 4.6. Bước 6: Tạo Controllers

Implement REST Controllers:

**Public Controllers (không cần auth):**
- ProductController - GET endpoints
- CategoryController - GET endpoints
- AuthController - register, login

**Customer Controllers (cần auth với role CUSTOMER hoặc ADMIN):**
- CartController
- OrderController - GET, POST
- ProfileController

**Admin Controllers (cần auth với role ADMIN):**
- AdminProductController - CRUD
- AdminCategoryController - CRUD
- AdminUserController - CRUD
- AdminOrderController - CRUD

### 4.7. Bước 7: Cấu Hình Security

**SecurityConfig:**
- Cấu hình các endpoints public
- Cấu hình authentication
- Cấu hình authorization theo role
- Password encoder (BCrypt)
- CORS configuration

### 4.8. Bước 8: Exception Handling

**GlobalExceptionHandler:**
- Xử lý EntityNotFoundException → 404
- Xử lý ValidationException → 400
- Xử lý AccessDeniedException → 403
- Xử lý AuthenticationException → 401
- Xử lý BusinessException → 400 với message cụ thể

### 4.9. Bước 9: Database Schema Management với Hibernate Auto DDL

**Dự án này sử dụng Hibernate Auto DDL** để tự động tạo schema từ JPA Entities.

**Cấu hình `application.yml`:**
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Tự động tạo/sửa schema từ Entities
    show-sql: true      # Hiển thị SQL để debug (development)
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

**Quy trình:**
1. Định nghĩa JPA Entities với đầy đủ annotations (`@Entity`, `@Table`, `@Column`, etc.)
2. Hibernate tự động tạo các bảng khi ứng dụng start
3. Khi thay đổi Entity, Hibernate tự động update schema

**Ưu điểm:**
- ✅ Đơn giản, không cần viết SQL migration scripts
- ✅ Tự động sync với Entities
- ✅ Phù hợp cho development và bài tập lớn
- ✅ Tập trung vào Entities, không cần maintain SQL

**Lưu ý:**
- Với `ddl-auto: update`, Hibernate sẽ tự động tạo các bảng từ Entities
- Chỉ cần đảm bảo Entities được định nghĩa đúng là đủ
- Cẩn thận khi thay đổi schema có dữ liệu (có thể mất dữ liệu)
- Indexes được định nghĩa trong `@Table(indexes = {...})`
- Constraints được định nghĩa qua annotations (`@NotNull`, `@Unique`, etc.)

**Ví dụ:**
Khi bạn định nghĩa Entity `User` với các annotations đầy đủ, Hibernate sẽ tự động tạo bảng `users` với tất cả các cột, indexes, và constraints tương ứng. Bạn không cần viết SQL CREATE TABLE thủ công.

### 4.10. Bước 10: Email Configuration

Cấu hình Spring Mail và implement EmailService để gửi email:
- Đăng ký thành công
- Đặt hàng thành công

## 5. Validation Rules

### 5.1. User Registration

- Email: required, valid format, unique
- Password: required, min 6 characters
- FullName: required, min 2 characters
- Phone: optional, valid format
- Address: optional

### 5.2. Product

- Name: required, min 3 characters
- Price: required, > 0
- Stock: required, >= 0
- CategoryId: required, must exist
- Description: optional

### 5.3. Order

- ShippingAddress: required
- Cart must not be empty
- User must be authenticated
- Stock must be sufficient

## 6. Testing

### 6.1. Unit Tests

Test các Services với Mock Repositories:

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void testCreateProduct() {
        // Test implementation
    }
}
```

### 6.2. Integration Tests

Test API endpoints với MockMvc:

```java
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetAllProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk());
    }
}
```

## 7. Checklist Triển Khai

### 7.1. Entities & Database
- [ ] Tạo tất cả Entities
- [ ] Tạo tất cả Repositories
- [ ] Định nghĩa JPA Entities với đầy đủ annotations
- [ ] Test database connections

### 7.2. Business Logic
- [ ] Implement tất cả Services
- [ ] Implement validation logic
- [ ] Implement business rules (delete constraints)
- [ ] Implement email service

### 7.3. API Layer
- [ ] Tạo tất cả Controllers
- [ ] Implement tất cả endpoints
- [ ] Implement exception handling
- [ ] Test tất cả endpoints

### 7.4. Security
- [ ] Cấu hình Spring Security
- [ ] Implement authentication
- [ ] Implement authorization
- [ ] Test security rules

### 7.5. Testing
- [ ] Unit tests cho Services
- [ ] Integration tests cho Controllers
- [ ] Test security
- [ ] Test email service

### 7.6. Documentation
- [ ] API documentation (Swagger)
- [ ] Code comments
- [ ] README file

## 8. Lưu Ý Quan Trọng

1. **Password:** Luôn hash password trước khi lưu vào database
2. **Validation:** Validate ở cả Client và Server
3. **Error Messages:** Cung cấp error messages rõ ràng, dễ hiểu
4. **Transactions:** Sử dụng @Transactional cho các operations có nhiều bước
5. **Session:** Giỏ hàng chỉ lưu trong session, không lưu vào DB cho đến khi thanh toán
6. **Delete Constraints:** Luôn kiểm tra ràng buộc trước khi xóa
7. **Email:** Gửi email bất đồng bộ để không block request
8. **Logging:** Log các operations quan trọng và errors
9. **Security:** Không bao giờ trả về password trong API response
10. **Code Quality:** Tuân thủ coding standards, clean code principles

## 9. Troubleshooting

### 9.1. Database Connection Issues

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra credentials trong `.env`
- Kiểm tra database đã được tạo chưa

### 9.2. Email Sending Issues

- Kiểm tra email credentials
- Với Gmail, cần sử dụng App Password thay vì mật khẩu thường
- Kiểm tra firewall/network

### 9.3. Security Issues

- Kiểm tra SecurityConfig
- Kiểm tra role của user
- Kiểm tra token/session

### 9.4. Validation Issues

- Kiểm tra @Valid annotations
- Kiểm tra validation rules trong DTOs
- Kiểm tra GlobalExceptionHandler

