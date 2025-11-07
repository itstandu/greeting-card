# Tổng Quan Dự Án

## 1. Giới Thiệu

**Tên dự án:** Website giới thiệu, bán thiệp trực tuyến (Greeting Card E-Commerce Platform)

**Mô tả:** Dự án xây dựng hệ thống RESTful API cho website bán thiệp chúc mừng trực tuyến, cho phép người dùng xem, chọn mua và đặt hàng thiệp chúc mừng qua mạng Internet.

**Công nghệ:** Spring Boot 3.5.7, PostgreSQL, Spring Security, Spring Mail, RESTful API

## 2. Mục Tiêu Dự Án

### 2.1. Mục Tiêu Chức Năng

- Xây dựng hệ thống API hỗ trợ đầy đủ các chức năng cho website bán thiệp trực tuyến
- Quản lý thông tin sản phẩm (thiệp chúc mừng), loại sản phẩm
- Quản lý người dùng và phân quyền (Guest, Customer, Admin)
- Xử lý giỏ hàng và đơn hàng
- Gửi email thông báo cho người dùng

### 2.2. Mục Tiêu Kỹ Thuật

- Xây dựng RESTful API theo chuẩn REST
- Sử dụng Spring Ecosystem (Spring Boot, Spring Security, Spring Data JPA)
- Kết nối và quản lý cơ sở dữ liệu PostgreSQL với Hibernate Auto DDL
- Bảo mật API với Spring Security
- Xử lý email với Spring Mail

## 3. Ràng Buộc Dự Án

### 3.1. Ràng Buộc Kỹ Thuật

- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.5.7
- **Database:** PostgreSQL
- **API Style:** RESTful API
- **Authentication:** Spring Security (JWT hoặc Session-based)
- **Email Service:** Spring Mail (SMTP)

### 3.2. Ràng Buộc Chức Năng

- **Validation:** Kiểm tra dữ liệu phía Client (JavaScript/jQuery) và Server (Spring Validation)
- **Ràng buộc xóa:**
  - Không xóa sản phẩm đã có trong đơn hàng
  - Không xóa loại sản phẩm đã có sản phẩm
  - Không xóa tài khoản đã có đơn hàng
- **Email:** Gửi email khi đăng ký thành công và đặt hàng thành công
- **Session:** Giỏ hàng lưu trong Session (không lưu vào database cho đến khi thanh toán)

### 3.3. Ràng Buộc Bảo Mật

- Password không được hiển thị trong API response
- Phân quyền rõ ràng giữa các vai trò người dùng
- Xác thực người dùng trước khi thực hiện các thao tác quan trọng

## 4. Kiến Trúc Hệ Thống

### 4.1. Kiến Trúc Tổng Quan

```
┌─────────────────┐
│   Frontend      │
│   (Client)      │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼─────────────────────────┐
│   RESTful API (Spring Boot)     │
│   ┌───────────────────────────┐ │
│   │ Controllers (REST)        │ │
│   ├───────────────────────────┤ │
│   │ Services (Business Logic) │ │
│   ├───────────────────────────┤ │
│   │ Repositories (Data Access)│ │
│   └───────────────────────────┘ │
└────────┬────────────────────────┘
         │ JDBC
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

### 4.2. Các Thành Phần Chính

1. **REST Controllers:** Xử lý HTTP requests và responses
2. **Services:** Chứa business logic
3. **Repositories:** Truy cập dữ liệu từ database
4. **Entities:** Mô hình dữ liệu
5. **DTOs:** Data Transfer Objects cho API
6. **Security:** Xác thực và phân quyền
7. **Mail Service:** Gửi email thông báo

## 5. Cấu Trúc Dự Án

```
greeting-card-api/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── iuh/fit/se/
│   │   │       ├── controller/      # REST Controllers
│   │   │       ├── service/         # Business Logic
│   │   │       ├── repository/      # Data Access
│   │   │       ├── entity/          # JPA Entities
│   │   │       ├── dto/             # Data Transfer Objects
│   │   │       ├── security/        # Security Configuration
│   │   │       ├── config/          # Configuration Classes
│   │   │       └── exception/       # Exception Handling
│   │   └── resources/
│   │       ├── application.yml      # Application Configuration
│   │       └── ...                  # Không cần migration folder
│   └── test/                        # Unit Tests
└── docs/                            # Documentation
```

## 6. Tiêu Chí Đánh Giá (CLO)

### CLO 1: Làm Việc Nhóm
- Tham gia các hoạt động nhóm trong quá trình hoàn thành công việc
- Hoàn thành công việc được phân công

### CLO 2: Viết Tài Liệu
- Tài liệu báo cáo rõ ràng, đúng cấu trúc
- Đầy đủ nội dung, trích dẫn, tài liệu tham khảo

### CLO 3: Phân Tích Yêu Cầu
- Xác định mục tiêu công việc và ràng buộc của ứng dụng Web

### CLO 4: Kết Nối Database
- Trình bày và cài đặt kết nối đến data sources
- Sử dụng JPA/Hibernate với PostgreSQL

### CLO 5: Spring Ecosystem
- Trình bày các công nghệ trong phát triển ứng dụng Web
- Trình bày kiến trúc và cấu hình môi trường Spring

### CLO 6: Web Services
- Chọn lựa và cài đặt ứng dụng sử dụng Spring ecosystem
- Sử dụng RESTful Web Services

