# Kiến Trúc Kỹ Thuật

## 1. Tổng Quan Kiến Trúc

Dự án sử dụng **Clean Architecture** kết hợp với **Spring Boot** để xây dựng RESTful API cho hệ thống bán thiệp trực tuyến.

## 2. Kiến Trúc Phân Lớp

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         REST Controllers (API Endpoints)         │  │
│  │  - ProductController                              │  │
│  │  - CategoryController                              │  │
│  │  - CartController                                  │  │
│  │  - OrderController                                 │  │
│  │  - AuthController                                  │  │
│  │  - ReviewController                                │  │
│  │  - WishlistController                              │  │
│  │  - AddressController                               │  │
│  │  - CouponController                                │  │
│  │  - NotificationController                          │  │
│  │  - AdminController                                 │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Services (Business Logic)           │  │
│  │  - ProductService                                 │  │
│  │  - CategoryService                                │  │
│  │  - CartService                                    │  │
│  │  - OrderService                                   │  │
│  │  - UserService                                    │  │
│  │  - AuthService                                    │  │
│  │  - EmailService                                   │  │
│  │  - ReviewService                                  │  │
│  │  - WishlistService                                │  │
│  │  - AddressService                                 │  │
│  │  - CouponService                                  │  │
│  │  - NotificationService                            │  │
│  │  - PaymentMethodService                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              DTOs (Data Transfer Objects)         │  │
│  │  - ProductDTO, ProductRequestDTO                  │  │
│  │  - CategoryDTO, CategoryRequestDTO                │  │
│  │  - OrderDTO, OrderRequestDTO                      │  │
│  │  - UserDTO, RegisterRequestDTO                    │  │
│  │  - ReviewDTO, ReviewRequestDTO                    │  │
│  │  - WishlistDTO                                    │  │
│  │  - AddressDTO, AddressRequestDTO                 │  │
│  │  - CouponDTO, CouponRequestDTO                   │  │
│  │  - NotificationDTO                                │  │
│  │  - PaymentMethodDTO                               │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    Domain Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Entities (JPA Entities)             │  │
│  │  - User                                           │  │
│  │  - Product                                        │  │
│  │  - Category                                        │  │
│  │  - Order                                          │  │
│  │  - OrderItem                                      │  │
│  │  - ProductImage                                   │  │
│  │  - ProductReview                                  │  │
│  │  - Wishlist                                       │  │
│  │  - UserAddress                                    │  │
│  │  - OrderStatusHistory                             │  │
│  │  - Coupon                                         │  │
│  │  - PaymentMethod                                  │  │
│  │  - Notification                                   │  │
│  │  - ProductTag                                      │  │
│  │  - RefreshToken                                    │  │
│  │  - BaseEntity (MappedSuperclass)                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Repositories (Data Access)           │  │
│  │  - UserRepository                                 │  │
│  │  - ProductRepository                              │  │
│  │  - CategoryRepository                              │  │
│  │  - OrderRepository                                │  │
│  │  - OrderItemRepository                            │  │
│  │  - ProductImageRepository                         │  │
│  │  - ProductReviewRepository                        │  │
│  │  - WishlistRepository                             │  │
│  │  - UserAddressRepository                          │  │
│  │  - OrderStatusHistoryRepository                   │  │
│  │  - CouponRepository                               │  │
│  │  - PaymentMethodRepository                        │  │
│  │  - NotificationRepository                          │  │
│  │  - ProductTagRepository                           │  │
│  │  - RefreshTokenRepository                         │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                Infrastructure Layer                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Database (PostgreSQL)                │  │
│  │  - Hibernate Auto DDL                            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              External Services                    │  │
│  │  - Email Service (SMTP)                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 3. Các Thành Phần Chính

### 3.1. Presentation Layer (Controllers)

**Trách nhiệm:**
- Nhận HTTP requests
- Validate input (sử dụng Spring Validation)
- Gọi Services để xử lý business logic
- Trả về HTTP responses
- Xử lý exceptions

**Ví dụ cấu trúc:**
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts(
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size,
        @RequestParam(required = false) Long categoryId
    ) {
        // Implementation
    }
}
```

### 3.2. Application Layer (Services)

**Trách nhiệm:**
- Chứa business logic
- Xử lý các quy tắc nghiệp vụ
- Gọi Repositories để truy cập dữ liệu
- Xử lý transactions
- Gọi các service khác khi cần

**Ví dụ cấu trúc:**
```java
@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductDTO createProduct(CreateProductRequest request) {
        // Business logic
        // Validation
        // Save to database
    }

    public void deleteProduct(Long id) {
        // Check if product has orders
        // Delete if allowed
    }
}
```

### 3.3. Domain Layer (Entities & Repositories)

**Entities:**
- Mô hình dữ liệu của domain
- Sử dụng JPA annotations (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`, etc.)
- Chứa các relationships (`@OneToMany`, `@ManyToOne`, `@ManyToMany`)
- Sử dụng Bean Validation annotations (`@NotNull`, `@Min`, `@DecimalMin`, etc.)
- **Soft Delete:** Sử dụng `@SQLDelete` và `@Where` để xóa mềm dữ liệu
- **JPA Auditing:** Tracking `created_by`, `updated_by` với `@EntityListeners(AuditingEntityListener.class)`
- Hỗ trợ JPA Auditing cho timestamps (`@CreatedDate`, `@LastModifiedDate`)
- **BaseEntity:** MappedSuperclass chứa các fields chung (id, deletedAt, createdAt, updatedAt, createdBy, updatedBy)

**Repositories:**
- Interface extends `JpaRepository<T, ID>` hoặc `PagingAndSortingRepository<T, ID>`
- Spring Data JPA tự động implement các methods cơ bản (save, findById, findAll, delete, etc.)
- Query Methods: Định nghĩa methods theo naming convention, Spring tự generate queries
- Custom Queries: Sử dụng `@Query` annotation với JPQL hoặc native SQL
- Specifications: Sử dụng JPA Specifications cho dynamic queries phức tạp
- Không chứa business logic, chỉ truy cập dữ liệu

**Ví dụ Query Methods:**
```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    // Getters, setters
}

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Query Methods - Spring tự generate queries dựa trên method name
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByNameContainingIgnoreCase(String name);
    Page<Product> findByCategoryIdAndPriceBetween(
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Pageable pageable
    );

    // Custom Query với JPQL
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.stock > 0")
    List<Product> findAvailableProductsByCategory(@Param("categoryId") Long categoryId);

    // Custom Query với native SQL
    @Query(value = "SELECT * FROM products WHERE price > :minPrice ORDER BY price ASC",
           nativeQuery = true)
    List<Product> findProductsAbovePrice(@Param("minPrice") BigDecimal minPrice);

    // Kiểm tra ràng buộc xóa
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.product.id = :productId")
    boolean hasOrderItems(@Param("productId") Long productId);

    // Exists methods
    boolean existsByIdAndOrderItemsIsNotEmpty(Long id);
}
```

### 3.4. DTOs (Data Transfer Objects)

**Mục đích:**
- Tách biệt Entity và API response/request
- Kiểm soát dữ liệu được expose ra ngoài
- Tránh lộ thông tin nhạy cảm (như password)

**Các loại DTO:**
- **Request DTOs:** Dữ liệu đầu vào từ client
- **Response DTOs:** Dữ liệu trả về cho client
- **Mapper:** Chuyển đổi giữa Entity và DTO

## 4. Spring Ecosystem Components

### 4.1. Spring Boot

**Version:** 3.5.7

**Các Starter được sử dụng:**
- `spring-boot-starter-web`: REST API, embedded Tomcat
- `spring-boot-starter-data-jpa`: JPA/Hibernate
- `spring-boot-starter-security`: Authentication & Authorization
- `spring-boot-starter-validation`: Bean Validation
- `spring-boot-starter-mail`: Email service
- `spring-boot-starter-actuator`: Monitoring & Health checks

### 4.2. Spring Security với JWT

**Chức năng:**
- Authentication: Xác thực người dùng bằng JWT (JSON Web Token)
- Authorization: Phân quyền theo role (ROLE_CUSTOMER, ROLE_ADMIN)
- Password encoding: BCryptPasswordEncoder
- JWT Token Provider: Tạo và validate JWT tokens
- Cookie-based Token Storage: Lưu tokens trong HTTP-only cookies
- Refresh Token Mechanism: Làm mới accessToken từ refreshToken
- CORS configuration
- Security filters

**JWT Token Structure:**
- **AccessToken:** Ngắn hạn (ví dụ: 15 phút)
  - Chứa: userId, email, role
  - Dùng để xác thực các API requests
  - Lưu trong HTTP-only cookie

- **RefreshToken:** Dài hạn (ví dụ: 7 ngày)
  - Chứa: userId, tokenId (UUID)
  - Dùng để refresh accessToken khi hết hạn
  - Lưu trong HTTP-only cookie

**Cấu hình Security:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF cho REST API
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint())
                .accessDeniedHandler(jwtAccessDeniedHandler())
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength = 12
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);
    }
}
```

**JWT Token Provider:**
```java
@Component
public class JwtTokenProvider {
    private final String secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public String createAccessToken(UserDetails userDetails) {
        Claims claims = Jwts.claims().setSubject(userDetails.getUsername());
        claims.put("roles", userDetails.getAuthorities());

        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS512, secretKey)
            .compact();
    }

    public String createRefreshToken(Long userId) {
        Claims claims = Jwts.claims();
        claims.put("userId", userId);
        claims.put("tokenId", UUID.randomUUID().toString());

        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS512, secretKey)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

**Cookie Configuration:**
```java
@Component
public class CookieUtil {
    public void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true); // HTTP-only để tránh XSS
        cookie.setSecure(true); // Chỉ gửi qua HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", "Strict"); // CSRF protection
        response.addCookie(cookie);
    }

    public void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
```

### 4.3. Spring Data JPA

**Chức năng:**
- ORM mapping với Hibernate (JPA implementation)
- Repository pattern với auto-implementation
- Query Methods: Tự động generate queries từ method names
- Custom Queries: JPQL và Native SQL với `@Query`
- Pagination và Sorting: Hỗ trợ `Pageable` và `Sort`
- Specifications: Dynamic queries với JPA Specifications
- Transaction management: `@Transactional` annotation
- JPA Auditing: Tự động quản lý timestamps

**Cấu hình:**
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # validate trong production, update trong development
    show-sql: false  # false trong production
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:greeting_cards_db}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
```

**Enable JPA Auditing:**
```java
@SpringBootApplication
@EnableJpaAuditing
public class GreetingCardApiApplication {
    // ...
}
```

**Ví dụ sử dụng Pagination:**
```java
@Service
public class ProductService {
    private final ProductRepository productRepository;

    public Page<ProductDTO> getAllProducts(int page, int size, Long categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Product> products;

        if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(this::toDTO);
    }
}
```

### 4.4. Database Schema Management với Hibernate Auto DDL

**Dự án này sử dụng Hibernate Auto DDL** để tự động tạo schema từ JPA Entities.

**Cách hoạt động:** Hibernate tự động tạo và cập nhật database schema dựa trên các JPA Entities.

**Cấu hình:**
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Tự động tạo/sửa schema từ Entities
    show-sql: true      # Development: true, Production: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

**Ưu điểm:**
- Đơn giản, không cần viết SQL migration scripts
- Tự động sync với Entities
- Phù hợp cho development và bài tập lớn
- Tập trung vào Entities, không cần maintain SQL

**Quy trình:**
1. Định nghĩa JPA Entities với đầy đủ annotations
2. Hibernate tự động tạo các bảng khi ứng dụng start
3. Khi thay đổi Entity, Hibernate tự động update schema

**Lưu ý:**
- Với `ddl-auto: update`, chỉ cần định nghĩa Entities là đủ
- Hibernate tự động generate SQL từ Entities
- Indexes được định nghĩa trong `@Table(indexes = {...})`
- Constraints được định nghĩa qua annotations

### 4.5. Soft Delete Pattern

**Mục đích:**
- Giữ lại lịch sử dữ liệu thay vì xóa cứng
- Cho phép khôi phục dữ liệu nếu cần
- Tuân thủ các yêu cầu về audit trail

**Cách triển khai:**
- Sử dụng `@SQLDelete` annotation để override SQL DELETE
- Sử dụng `@Where` annotation để tự động filter deleted records
- Thêm field `deletedAt` (TIMESTAMP) vào các Entity cần soft delete

**Ví dụ BaseEntity:**
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
}
```

**Ví dụ Entity với Soft Delete:**
```java
@Entity
@Table(name = "products")
@SQLDelete(sql = "UPDATE products SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Product extends BaseEntity {
    // Fields...
}
```

**Lợi ích:**
- Dữ liệu không bị mất khi "xóa"
- Có thể khôi phục nếu cần
- Giữ lại lịch sử cho audit trail
- Các query mặc định tự động filter deleted records

### 4.6. JPA Auditing

**Mục đích:**
- Tự động tracking timestamps (`createdAt`, `updatedAt`)
- Tracking người tạo/sửa (`createdBy`, `updatedBy`)
- Không cần set thủ công trong code

**Cấu hình:**
```java
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class GreetingCardApiApplication {
    // ...
}

@Component
public class AuditorProvider implements AuditorAware<User> {
    @Override
    public Optional<User> getCurrentAuditor() {
        // Lấy current user từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            // Return current user
        }
        return Optional.empty();
    }
}
```

**Sử dụng trong Entity:**
```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Product extends BaseEntity {
    // Fields...
    // createdAt, updatedAt, createdBy, updatedBy được tự động set
}
```

**Lợi ích:**
- Tự động tracking mà không cần code thủ công
- Đảm bảo tính nhất quán
- Hỗ trợ audit trail đầy đủ

### 4.7. Spring Mail

**Chức năng:**
- Gửi email xác thực khi đăng ký
- Gửi lại email xác thực nếu cần
- Gửi email xác nhận đơn hàng

**Cấu hình:**
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

**Email Verification Service:**
```java
@Service
public class EmailVerificationService {
    private final JavaMailSender mailSender;
    private final JwtTokenProvider jwtTokenProvider;

    public void sendVerificationEmail(User user) {
        String token = jwtTokenProvider.createEmailVerificationToken(user.getId());
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusDays(1));

        String verificationUrl = "http://localhost:3000/verify-email?token=" + token;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setTo(user.getEmail());
        helper.setSubject("Xác thực email đăng ký");
        helper.setText(buildVerificationEmail(user.getFullName(), verificationUrl), true);

        mailSender.send(message);
    }

    private String buildVerificationEmail(String name, String url) {
        return "<html><body>" +
               "<h2>Xin chào " + name + "!</h2>" +
               "<p>Vui lòng click vào link sau để xác thực email:</p>" +
               "<a href=\"" + url + "\">" + url + "</a>" +
               "<p>Link này sẽ hết hạn sau 24 giờ.</p>" +
               "</body></html>";
    }
}
```

## 5. Design Patterns

### 5.1. Repository Pattern

- Tách biệt data access logic khỏi business logic
- Dễ dàng test và thay đổi data source

### 5.2. Service Layer Pattern

- Tập trung business logic vào một lớp
- Dễ dàng quản lý transactions
- Tái sử dụng logic

### 5.3. DTO Pattern

- Tách biệt Entity và API contract
- Bảo mật tốt hơn
- Linh hoạt trong việc thay đổi API

### 5.4. Dependency Injection

- Giảm coupling giữa các components
- Dễ dàng test
- Quản lý lifecycle của objects

## 6. Exception Handling

### 6.1. Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(EntityNotFoundException e) {
        // Handle 404
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(ValidationException e) {
        // Handle 400
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException e) {
        // Handle 403
    }
}
```

### 6.2. Custom Exceptions

- `EntityNotFoundException`: Resource không tồn tại
- `ValidationException`: Lỗi validation
- `BusinessException`: Lỗi business logic
- `UnauthorizedException`: Chưa đăng nhập
- `ForbiddenException`: Không có quyền

## 7. Validation

### 7.1. Server-side Validation

**Sử dụng Bean Validation (JSR-303):**
```java
public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
}
```

### 7.2. Custom Validators

- Email unique validator
- Business rule validators

## 8. Session Management

### 8.1. Cart Storage

- Giỏ hàng lưu trong HTTP Session
- Key: `cart`
- Structure: Map<ProductId, Quantity>
- Tự động xóa sau khi thanh toán thành công

### 8.2. Session Configuration

```java
@Configuration
public class SessionConfig {
    @Bean
    public HttpSessionIdResolver httpSessionIdResolver() {
        // Cookie-based hoặc Header-based
    }
}
```

## 9. Email Service

### 9.1. Email Templates

- Đăng ký thành công
- Đặt hàng thành công

### 9.2. Email Service Implementation

```java
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendRegistrationEmail(String to, String fullName) {
        // Send email
    }

    public void sendOrderConfirmationEmail(String to, Order order) {
        // Send email with order details
    }
}
```

## 10. Testing Strategy

### 10.1. Unit Tests

- Test Services với Mock Repositories
- Test Controllers với MockMvc
- Test Validators

### 10.2. Integration Tests

- Test API endpoints với TestContainers (PostgreSQL)
- Test Database operations
- Test Security configuration

### 10.3. Test Coverage

- Mục tiêu: > 80% code coverage
- Focus vào business logic và critical paths

## 11. Configuration Management

### 11.1. Application Properties

- `application.yml`: Cấu hình chung
- Environment variables: Sensitive data (DB password, email password)

### 11.2. Environment-specific Configuration

- Development
- Production
- Sử dụng Spring Profiles

## 12. Logging

### 12.1. Logging Framework

- SLF4J + Logback
- Log levels: DEBUG, INFO, WARN, ERROR

### 12.2. Logging Strategy

- Log requests/responses (sensitive data excluded)
- Log business events
- Log errors với stack traces

## 13. API Documentation

### 13.1. OpenAPI/Swagger

- Sử dụng SpringDoc OpenAPI
- Tự động generate API documentation
- Interactive API testing

## 14. Performance Considerations

### 14.1. Database Optimization

- Indexes trên các cột thường query
- Pagination cho danh sách
- Lazy loading cho relationships

### 14.2. Caching (Future)

- Cache danh sách categories
- Cache product details
- Redis integration

## 15. Security Best Practices

1. **Password:** Hash bằng BCrypt
2. **SQL Injection:** Sử dụng JPA/Prepared Statements
3. **XSS:** Validate và sanitize input
4. **CSRF:** Spring Security CSRF protection
5. **CORS:** Configure đúng origins
6. **Rate Limiting:** Prevent abuse

## 16. Deployment Considerations

### 16.1. Build

- Maven build: `mvn clean package`
- JAR file: `target/greeting-card-api-0.0.1-SNAPSHOT.jar`

### 16.2. Environment Variables

- Database connection
- Email configuration
- JWT secret (nếu dùng JWT)

### 16.3. Health Checks

- Spring Actuator endpoints
- `/actuator/health`
- `/actuator/info`

