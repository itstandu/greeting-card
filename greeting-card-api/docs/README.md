# Tài Liệu Dự Án - Greeting Card API

## Tổng Quan

Đây là thư mục chứa tất cả các tài liệu chi tiết về dự án **Website giới thiệu, bán thiệp trực tuyến** - RESTful API Backend.

## Danh Sách Tài Liệu

### 1. [Tổng Quan Dự Án](./01-project-overview.md)

- Giới thiệu dự án
- Mục tiêu và ràng buộc
- Kiến trúc tổng quan
- Cấu trúc dự án
- Tiêu chí đánh giá (CLO)

### 2. [Vai Trò Người Dùng và Phân Quyền](./02-user-roles.md)

- Chi tiết các vai trò: Guest, Customer, Admin
- Chức năng của từng vai trò
- API endpoints theo vai trò
- Bảng tóm tắt phân quyền
- Lưu ý bảo mật

### 3. [Thiết Kế Cơ Sở Dữ Liệu](./03-database-schema.md)

- Sơ đồ ER (Entity Relationship)
- Chi tiết các bảng (16 bảng với các tính năng hiện đại)
- **JPA Entities** với Spring Data JPA annotations
- **Tính năng hiện đại:**
  - Soft Delete với `deleted_at`
  - JPA Auditing (created_by, updated_by)
  - Multi-image support cho sản phẩm
  - Reviews & Ratings
  - Wishlist
  - Multiple addresses
  - Order status history tracking
  - Notifications
  - Coupons/Discounts
  - Payment methods
  - Category hierarchy
  - Product tags
- Ràng buộc xóa dữ liệu với Soft Delete
- Quan hệ giữa các bảng
- Database schema tự động tạo từ JPA Entities (Hibernate Auto DDL)
- Dữ liệu mẫu

### 4. [API Specification](./04-api-specification.md)

- Tổng quan RESTful API
- Cấu trúc Response
- Authentication & Authorization
- Chi tiết tất cả API endpoints
- Error codes
- Rate limiting & Security

### 5. [Kiến Trúc Kỹ Thuật](./05-technical-architecture.md)

- Kiến trúc phân lớp (Clean Architecture)
- Các thành phần chính
- **Spring Data JPA** chi tiết
- Spring Ecosystem components
- Design Patterns
- Exception Handling
- Validation
- Session Management
- Email Service
- Testing Strategy

### 6. [Hướng Dẫn Triển Khai](./06-implementation-guide.md)

- Yêu cầu hệ thống
- Cài đặt môi trường
- Cấu trúc thư mục
- **Các bước triển khai chi tiết với Spring Data JPA:**
  - Tạo Entities với JPA annotations
  - Tạo Repositories với Query Methods
  - Tạo Services với business logic
  - Tạo Controllers
  - Cấu hình Security
  - Database Migrations
- Validation Rules
- Testing
- Checklist triển khai
- Troubleshooting

### 7. [Spring Data JPA Best Practices](./07-spring-data-jpa-best-practices.md)

- Entity Design
- Repository Patterns
- Query Methods
- Pagination và Sorting
- Custom Queries
- Transaction Management
- Performance Optimization
- Tránh N+1 Problem
- Validation và Constraints
- Error Handling
- Testing với Spring Data JPA
- Common Pitfalls và Solutions
- Checklist Code Review

### 8. [JWT Authentication Flow](./08-jwt-authentication-flow.md)

- Tổng quan JWT với accessToken và refreshToken
- Authentication Flow chi tiết:
  - Đăng ký và xác thực email
  - Đăng nhập với JWT
  - Refresh token mechanism
  - Đăng xuất
- HTTP-only Cookies configuration
- BCrypt password encoding
- Email verification flow
- Security best practices
- Frontend integration
- Testing strategies

### 9. [Seed Data Strategy](./09-seed-data-strategy.md)

- Chiến lược tạo dữ liệu mẫu
- Phân phối dữ liệu theo thời gian (6 tháng)
- Đảm bảo tính nhất quán dữ liệu
- Hỗ trợ thống kê theo tuần/tháng
- Các loại Promotions và Coupons
- URL và Redirect strategy
- Hướng dẫn mở rộng và troubleshooting

## Công Nghệ Sử Dụng

- **Framework:** Spring Boot 3.5.7
- **ORM:** Spring Data JPA với Hibernate
- **Database:** PostgreSQL
- **Security:** Spring Security với JWT
- **Authentication:** JWT (accessToken + refreshToken) trong HTTP-only cookies
- **Password Encoding:** BCrypt (strength = 12)
- **Email:** Spring Mail (xác thực email khi đăng ký)
- **Database Management:** Hibernate Auto DDL (tự động tạo schema từ Entities)
- **Language:** Java 17

## Cấu Trúc Dự Án

```
greeting-card-api/
├── docs/                          # Tài liệu dự án
│   ├── 01-project-overview.md
│   ├── 02-user-roles.md
│   ├── 03-database-schema.md
│   ├── 04-api-specification.md
│   ├── 05-technical-architecture.md
│   ├── 06-implementation-guide.md
│   ├── 07-spring-data-jpa-best-practices.md
│   ├── 08-jwt-authentication-flow.md
│   ├── 09-seed-data-strategy.md
│   └── README.md                  # File này
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── iuh/fit/se/
│   │   │       ├── controller/    # REST Controllers
│   │   │       ├── service/      # Business Logic
│   │   │       ├── repository/   # Spring Data JPA Repositories
│   │   │       ├── entity/       # JPA Entities
│   │   │       ├── dto/          # Data Transfer Objects
│   │   │       ├── security/     # Security Configuration
│   │   │       └── config/       # Configuration Classes
│   │   └── resources/
│   │       ├── application.yml
│   │       └── ...               # Không cần migration folder
│   └── test/                     # Unit & Integration Tests
└── pom.xml
```

## Quy Trình Đọc Tài Liệu

Để hiểu rõ dự án, nên đọc theo thứ tự:

1. **Bắt đầu:** [01-project-overview.md](./01-project-overview.md) - Hiểu tổng quan về dự án
2. **Yêu cầu:** [02-user-roles.md](./02-user-roles.md) - Hiểu các vai trò và chức năng
3. **Database:** [03-database-schema.md](./03-database-schema.md) - Hiểu cấu trúc database và JPA Entities
4. **API:** [04-api-specification.md](./04-api-specification.md) - Hiểu các API endpoints
5. **Kiến trúc:** [05-technical-architecture.md](./05-technical-architecture.md) - Hiểu kiến trúc kỹ thuật
6. **Triển khai:** [06-implementation-guide.md](./06-implementation-guide.md) - Hướng dẫn code
7. **Best Practices:** [07-spring-data-jpa-best-practices.md](./07-spring-data-jpa-best-practices.md) - Best practices cho Spring Data JPA
8. **JWT Authentication:** [08-jwt-authentication-flow.md](./08-jwt-authentication-flow.md) - Chi tiết về JWT authentication flow
9. **Seed Data:** [09-seed-data-strategy.md](./09-seed-data-strategy.md) - Chiến lược tạo dữ liệu mẫu

## Lưu Ý Quan Trọng

- Dự án sử dụng **Spring Data JPA** cho data access layer
- Tất cả Entities sử dụng JPA annotations (`@Entity`, `@Table`, `@Id`, etc.)
- Repositories extends `JpaRepository<T, ID>` hoặc `PagingAndSortingRepository<T, ID>`
- Sử dụng Query Methods và Custom Queries với `@Query`
- Database schema được tự động tạo từ JPA Entities bằng Hibernate Auto DDL
- **Soft Delete:** Sử dụng `@SQLDelete` và `@Where` để xóa mềm dữ liệu
- **JPA Auditing:** Tracking `created_by`, `updated_by` với `@EntityListeners(AuditingEntityListener.class)`
- JPA Auditing được sử dụng cho timestamps (`@CreatedDate`, `@LastModifiedDate`)
- **Authentication:** JWT với accessToken (15 phút) và refreshToken (7 ngày)
- **Token Storage:** HTTP-only cookies (HttpOnly, Secure, SameSite=Strict)
- **Password:** BCrypt encoding với strength = 12
- **Email Verification:** Bắt buộc xác thực email trước khi đăng nhập
- **Tính năng mới:** Reviews, Wishlist, Multiple Addresses, Coupons, Notifications, Order History Tracking

## Liên Hệ

Nếu có thắc mắc về tài liệu, vui lòng liên hệ team phát triển.
