# Spring Data JPA Best Practices

## 1. Entity Design

### 1.1. Annotations Cơ Bản

```java
@Entity
@Table(name = "products",
       indexes = @Index(name = "idx_products_name", columnList = "name"))
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sử dụng @Column để chỉ định rõ ràng các thuộc tính
    @Column(nullable = false, length = 255)
    private String name;
}
```

### 1.2. Relationships

**ManyToOne (Recommended):**
```java
@ManyToOne(fetch = FetchType.LAZY)  // Luôn dùng LAZY
@JoinColumn(name = "category_id", nullable = false)
private Category category;
```

**OneToMany:**
```java
@OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Product> products = new ArrayList<>();  // Khởi tạo collection
```

**Lưu ý:**
- Luôn sử dụng `FetchType.LAZY` cho relationships để tránh N+1 problem
- Sử dụng `mappedBy` trong `@OneToMany` để tránh tạo join table không cần thiết
- Khởi tạo collections để tránh NullPointerException

### 1.3. Timestamps với JPA Auditing

```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Product {
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// Enable trong main class
@SpringBootApplication
@EnableJpaAuditing
public class Application {
    // ...
}
```

## 2. Repository Patterns

### 2.1. Query Methods

Spring Data JPA tự động generate queries dựa trên method names:

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tìm theo category
    List<Product> findByCategoryId(Long categoryId);

    // Tìm kiếm không phân biệt hoa thường
    List<Product> findByNameContainingIgnoreCase(String name);

    // Tìm với nhiều điều kiện
    List<Product> findByCategoryIdAndPriceBetween(Long categoryId, BigDecimal min, BigDecimal max);

    // Exists check
    boolean existsByEmail(String email);

    // Count
    long countByCategoryId(Long categoryId);

    // Delete
    void deleteByCategoryId(Long categoryId);
}
```

### 2.2. Pagination và Sorting

```java
public interface ProductRepository extends PagingAndSortingRepository<Product, Long> {
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    List<Product> findByCategoryId(Long categoryId, Sort sort);
}

// Sử dụng trong Service
public Page<ProductDTO> getAllProducts(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
    return productRepository.findAll(pageable);
}
```

### 2.3. Custom Queries với @Query

**JPQL (Khuyến nghị):**
```java
@Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.stock > 0")
List<Product> findAvailableProductsByCategory(@Param("categoryId") Long categoryId);

@Query("SELECT p FROM Product p WHERE " +
       "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
       "(:minPrice IS NULL OR p.price >= :minPrice)")
Page<Product> searchProducts(
    @Param("categoryId") Long categoryId,
    @Param("minPrice") BigDecimal minPrice,
    Pageable pageable
);
```

**Native SQL (Khi cần thiết):**
```java
@Query(value = "SELECT * FROM products WHERE price > :minPrice ORDER BY price ASC",
       nativeQuery = true)
List<Product> findProductsAbovePrice(@Param("minPrice") BigDecimal minPrice);
```

### 2.4. Modifying Queries

```java
@Modifying
@Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :productId")
int decreaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

// Phải có @Transactional trong method gọi
@Transactional
public void updateStock(Long productId, Integer quantity) {
    productRepository.decreaseStock(productId, quantity);
}
```

## 3. Transaction Management

### 3.1. @Transactional Annotation

```java
@Service
@Transactional  // Class level - tất cả methods đều transactional
public class ProductService {

    @Transactional(readOnly = true)  // Chỉ đọc - tối ưu performance
    public ProductDTO getProduct(Long id) {
        // ...
    }

    @Transactional(rollbackFor = Exception.class)  // Rollback cho mọi exception
    public void deleteProduct(Long id) {
        // ...
    }
}
```

### 3.2. Transaction Propagation

```java
@Transactional(propagation = Propagation.REQUIRED)  // Mặc định
public void method1() {
    // Sử dụng transaction hiện tại hoặc tạo mới
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void method2() {
    // Luôn tạo transaction mới
}

@Transactional(propagation = Propagation.NEVER)
public void method3() {
    // Không được gọi trong transaction
}
```

## 4. Performance Optimization

### 4.1. Tránh N+1 Problem

**Vấn đề:**
```java
// N+1 queries - không tốt
List<Product> products = productRepository.findAll();
for (Product product : products) {
    Category category = product.getCategory(); // Lazy load - query mỗi lần
}
```

**Giải pháp 1: Sử dụng JOIN FETCH**
```java
@Query("SELECT p FROM Product p JOIN FETCH p.category")
List<Product> findAllWithCategory();

// Hoặc
@Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.id = :id")
Optional<Product> findByIdWithCategory(@Param("id") Long id);
```

**Giải pháp 2: Sử dụng Entity Graph**
```java
@EntityGraph(attributePaths = {"category"})
List<Product> findAll();

@EntityGraph(attributePaths = {"category", "orderItems"})
Optional<Product> findById(Long id);
```

### 4.2. Batch Operations

```java
// Thay vì save từng item
for (Product product : products) {
    productRepository.save(product); // N queries
}

// Sử dụng saveAll
productRepository.saveAll(products); // 1 batch query

// Hoặc với batch size
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
```

### 4.3. Lazy Loading Best Practices

```java
// Không tốt - LazyInitializationException
@Transactional(readOnly = true)
public ProductDTO getProduct(Long id) {
    Product product = productRepository.findById(id).orElseThrow();
    return productMapper.toDTO(product); // Category chưa được load
}

// Tốt - Load relationships cần thiết
@Transactional(readOnly = true)
public ProductDTO getProduct(Long id) {
    Product product = productRepository.findByIdWithCategory(id).orElseThrow();
    return productMapper.toDTO(product);
}
```

## 5. Validation và Constraints

### 5.1. Bean Validation trên Entity

```java
@Entity
public class Product {
    @NotNull(message = "Tên sản phẩm không được để trống")
    @Size(min = 3, max = 255, message = "Tên sản phẩm phải từ 3-255 ký tự")
    private String name;

    @NotNull
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal price;

    @NotNull
    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stock;
}
```

### 5.2. Custom Validators

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Email đã tồn tại";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

## 6. Error Handling

### 6.1. EntityNotFoundException

```java
@Service
public class ProductService {
    public ProductDTO getProduct(Long id) {
        return productRepository.findById(id)
            .map(productMapper::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
    }
}
```

### 6.2. DataIntegrityViolationException

```java
@Transactional
public ProductDTO createProduct(CreateProductRequest request) {
    try {
        Product product = productMapper.toEntity(request);
        return productMapper.toDTO(productRepository.save(product));
    } catch (DataIntegrityViolationException e) {
        if (e.getMessage().contains("email")) {
            throw new ValidationException("Email đã tồn tại");
        }
        throw e;
    }
}
```

## 7. Testing với Spring Data JPA

### 7.1. Unit Test với Mock Repository

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void testGetProduct() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductDTO result = productService.getProduct(1L);

        assertEquals("Test Product", result.getName());
    }
}
```

### 7.2. Integration Test với TestContainers

```java
@SpringBootTest
@Testcontainers
class ProductRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private ProductRepository productRepository;

    @Test
    void testSaveProduct() {
        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(BigDecimal.valueOf(100));

        Product saved = productRepository.save(product);

        assertNotNull(saved.getId());
        assertEquals("Test Product", saved.getName());
    }
}
```

## 8. Common Pitfalls và Solutions

### 8.1. LazyInitializationException

**Vấn đề:** Truy cập lazy-loaded relationship ngoài transaction

**Giải pháp:** Sử dụng JOIN FETCH hoặc Entity Graph

### 8.2. Detached Entity

**Vấn đề:** Entity bị detach sau khi transaction kết thúc

**Giải pháp:** Sử dụng `@Transactional` hoặc merge entity trước khi update

### 8.3. Multiple Queries cho Collection

**Vấn đề:** Load collection gây ra nhiều queries

**Giải pháp:** Sử dụng `@BatchSize` hoặc JOIN FETCH

```java
@Entity
@BatchSize(size = 20)
public class Category {
    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
```

## 9. Checklist Code Review

- [ ] Tất cả relationships sử dụng `FetchType.LAZY`
- [ ] Collections được khởi tạo (`new ArrayList<>()`)
- [ ] Sử dụng `@Transactional` cho write operations
- [ ] Sử dụng `@Transactional(readOnly = true)` cho read-only operations
- [ ] Query methods sử dụng đúng naming convention
- [ ] Custom queries sử dụng `@Param` cho parameters
- [ ] Validation được thực hiện ở cả Entity và DTO level
- [ ] Error handling cho các trường hợp không tìm thấy entity
- [ ] Pagination được sử dụng cho danh sách lớn
- [ ] Indexes được định nghĩa cho các cột thường query

