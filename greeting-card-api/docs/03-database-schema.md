# Thiết Kế Cơ Sở Dữ Liệu

## 1. Tổng Quan

Hệ thống sử dụng PostgreSQL làm cơ sở dữ liệu chính. Database schema được tự động tạo từ JPA Entities bằng Hibernate Auto DDL.

**Các Tính Năng Hiện Đại:**

- ✅ **Soft Delete** - Xóa mềm với `deleted_at` để giữ lại lịch sử
- ✅ **JPA Auditing** - Tracking ai tạo/sửa với `created_by`, `updated_by`
- ✅ **Multi-Image Support** - Sản phẩm có nhiều hình ảnh
- ✅ **Reviews & Ratings** - Đánh giá và xếp hạng sản phẩm
- ✅ **Wishlist** - Danh sách yêu thích
- ✅ **Multiple Addresses** - Nhiều địa chỉ giao hàng
- ✅ **Order History Tracking** - Lịch sử thay đổi trạng thái đơn hàng
- ✅ **Notifications** - Thông báo hệ thống
- ✅ **Coupons/Discounts** - Mã giảm giá
- ✅ **Payment Methods** - Phương thức thanh toán
- ✅ **Category Hierarchy** - Danh mục đa cấp
- ✅ **Product Tags** - Tags cho sản phẩm (many-to-many)

## 2. Sơ Đồ ER (Entity Relationship)

```
┌─────────────────┐
│     Users        │
├─────────────────┤
│ id (PK)         │
│ email (UK)      │
│ password        │
│ full_name       │
│ phone           │
│ role            │
│ email_verified   │
│ deleted_at      │◄── Soft Delete
│ created_at      │
│ updated_at      │
│ created_by      │◄── Audit Trail
│ updated_by      │
└────────┬────────┘
         │
         ├───┐
         │   │
         │   ├──────────────────┐
         │   │                  │
    ┌────▼────┐         ┌───────▼────────┐         ┌──────────────┐
    │ Orders  │         │ UserAddresses  │         │ RefreshTokens│
    ├─────────┤         ├────────────────┤         ├──────────────┤
    │ id (PK) │         │ id (PK)        │         │ id (PK)      │
    │ user_id │         │ user_id (FK)   │         │ user_id (FK) │
    │ status  │         │ address        │         │ token        │
    │ ...     │         │ is_default     │         │ expires_at   │
    │ deleted_at│      │ deleted_at     │         └──────────────┘
    └────┬────┘         └────────────────┘
         │
         ├──────────────────┐
         │                  │
    ┌────▼──────────┐  ┌─────▼──────────────┐
    │ OrderItems    │  │ OrderStatusHistory  │
    ├───────────────┤  ├────────────────────┤
    │ id (PK)       │  │ id (PK)            │
    │ order_id (FK) │  │ order_id (FK)     │
    │ product_id    │  │ status             │
    │ quantity      │  │ changed_by         │
    │ price         │  │ created_at         │
    └───────────────┘  └────────────────────┘

┌─────────────────┐
│   Categories    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ parent_id (FK)  │◄── Hierarchy
│ slug            │
│ deleted_at      │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │
    ┌────▼──────────┐
    │   Products    │
    ├───────────────┤
    │ id (PK)       │
    │ category_id   │
    │ name          │
    │ slug          │
    │ price         │
    │ stock         │
    │ deleted_at    │
    │ created_at    │
    │ updated_at    │
    └───────┬───────┘
            │
            ├──────────────────┐
            │                  │
    ┌───────▼────────┐  ┌───────▼──────────┐  ┌──────────────┐
    │ ProductImages  │  │ ProductReviews    │  │ Wishlist      │
    ├────────────────┤  ├──────────────────┤  ├──────────────┤
    │ id (PK)        │  │ id (PK)          │  │ id (PK)       │
    │ product_id(FK)│  │ product_id (FK)  │  │ user_id (FK)  │
    │ image_url      │  │ user_id (FK)     │  │ product_id(FK)│
    │ is_primary     │  │ rating (1-5)     │  │ created_at    │
    │ display_order  │  │ comment          │  │
    └────────────────┘  │ created_at       │  └──────────────┘
                        └──────────────────┘

┌─────────────────┐         ┌──────────────────┐
│   ProductTags   │         │ ProductTagMap    │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────┤ product_id (FK)  │
│ name            │         │ tag_id (FK)      │
│ slug            │         └──────────────────┘
│ created_at      │
└─────────────────┘

┌─────────────────┐
│    Coupons      │
├─────────────────┤
│ id (PK)         │
│ code (UK)       │
│ discount_type   │
│ discount_value  │
│ min_purchase    │
│ max_discount    │
│ valid_from      │
│ valid_until     │
│ usage_limit     │
│ used_count      │
│ is_active       │
│ deleted_at      │
└─────────────────┘

┌─────────────────┐
│ PaymentMethods  │
├─────────────────┤
│ id (PK)         │
│ name            │
│ code            │
│ is_active       │
│ display_order   │
└─────────────────┘

┌─────────────────┐
│ Notifications   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ type            │
│ title           │
│ message         │
│ is_read         │
│ created_at      │
└─────────────────┘
```

## 3. Chi Tiết Các Bảng

### 3.1. Bảng `users` (Người Dùng)

Lưu trữ thông tin tài khoản người dùng trong hệ thống.

| Tên Cột                       | Kiểu Dữ Liệu | Ràng Buộc                    | Mô Tả                               |
| ----------------------------- | ------------ | ---------------------------- | ----------------------------------- |
| id                            | BIGSERIAL    | PRIMARY KEY                  | ID tự động tăng                     |
| email                         | VARCHAR(255) | UNIQUE, NOT NULL             | Email đăng nhập (không trùng)       |
| password                      | VARCHAR(255) | NOT NULL                     | Mật khẩu (đã hash BCrypt)           |
| full_name                     | VARCHAR(255) | NOT NULL                     | Họ và tên                           |
| phone                         | VARCHAR(20)  |                              | Số điện thoại                       |
| role                          | VARCHAR(20)  | NOT NULL, DEFAULT 'CUSTOMER' | Vai trò: CUSTOMER, ADMIN            |
| email_verified                | BOOLEAN      | NOT NULL, DEFAULT FALSE      | Trạng thái xác thực email           |
| email_verification_token      | VARCHAR(255) |                              | Token xác thực email                |
| email_verification_expires_at | TIMESTAMP    |                              | Thời hạn token xác thực             |
| deleted_at                    | TIMESTAMP    |                              | Thời điểm xóa mềm (NULL = chưa xóa) |
| created_at                    | TIMESTAMP    | NOT NULL, DEFAULT NOW()      | Ngày tạo                            |
| updated_at                    | TIMESTAMP    | NOT NULL, DEFAULT NOW()      | Ngày cập nhật                       |
| created_by                    | BIGINT       | FOREIGN KEY → users.id       | ID người tạo                        |
| updated_by                    | BIGINT       | FOREIGN KEY → users.id       | ID người cập nhật                   |

**Ràng buộc:**

- Email phải unique (trong các record chưa bị xóa mềm)
- Role phải là một trong: 'CUSTOMER', 'ADMIN'
- Password phải được hash bằng BCrypt trước khi lưu
- Email phải được xác thực (`emailVerified = true`) trước khi đăng nhập

**Index:**

- `idx_users_email` trên `email` (để tìm kiếm nhanh)
- `idx_users_deleted_at` trên `deleted_at` (để filter soft deleted)
- `idx_users_role` trên `role`

**Lưu ý:**

- `deleted_at IS NULL` = record đang active
- `deleted_at IS NOT NULL` = record đã bị xóa mềm
- Các query mặc định sẽ filter `WHERE deleted_at IS NULL`

### 3.2. Bảng `categories` (Loại Sản Phẩm)

Lưu trữ các loại thiệp chúc mừng với hỗ trợ danh mục đa cấp.

| Tên Cột       | Kiểu Dữ Liệu | Ràng Buộc                   | Mô Tả                                |
| ------------- | ------------ | --------------------------- | ------------------------------------ |
| id            | BIGSERIAL    | PRIMARY KEY                 | ID tự động tăng                      |
| name          | VARCHAR(255) | NOT NULL                    | Tên loại sản phẩm                    |
| slug          | VARCHAR(255) | UNIQUE                      | URL-friendly name (ví dụ: sinh-nhat) |
| description   | TEXT         |                             | Mô tả loại sản phẩm                  |
| parent_id     | BIGINT       | FOREIGN KEY → categories.id | ID danh mục cha (NULL = root)        |
| image_url     | VARCHAR(500) |                             | Hình ảnh đại diện                    |
| display_order | INTEGER      | DEFAULT 0                   | Thứ tự hiển thị                      |
| is_active     | BOOLEAN      | DEFAULT TRUE                | Trạng thái hoạt động                 |
| deleted_at    | TIMESTAMP    |                             | Thời điểm xóa mềm                    |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Ngày tạo                             |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Ngày cập nhật                        |

**Ràng buộc:**

- Tên loại sản phẩm không được trùng (trong cùng parent)
- Slug phải unique
- `parent_id` có thể NULL (danh mục gốc) hoặc tham chiếu đến `categories.id`

**Index:**

- `idx_categories_name` trên `name`
- `idx_categories_slug` trên `slug` (unique)
- `idx_categories_parent_id` trên `parent_id`
- `idx_categories_deleted_at` trên `deleted_at`

**Ví dụ cấu trúc:**

```
- Sinh nhật (parent_id = NULL)
  - Thiệp sinh nhật nam (parent_id = 1)
  - Thiệp sinh nhật nữ (parent_id = 1)
- Tết Nguyên Đán (parent_id = NULL)
  - Thiệp Tết truyền thống (parent_id = 2)
```

### 3.3. Bảng `products` (Sản Phẩm)

Lưu trữ thông tin các thiệp chúc mừng.

| Tên Cột     | Kiểu Dữ Liệu  | Ràng Buộc                       | Mô Tả                |
| ----------- | ------------- | ------------------------------- | -------------------- |
| id          | BIGSERIAL     | PRIMARY KEY                     | ID tự động tăng      |
| category_id | BIGINT        | FOREIGN KEY → categories.id     | ID loại sản phẩm     |
| name        | VARCHAR(255)  | NOT NULL                        | Tên sản phẩm         |
| slug        | VARCHAR(255)  | UNIQUE                          | URL-friendly name    |
| description | TEXT          |                                 | Mô tả sản phẩm       |
| price       | DECIMAL(10,2) | NOT NULL, CHECK > 0             | Giá sản phẩm         |
| stock       | INTEGER       | NOT NULL, DEFAULT 0, CHECK >= 0 | Số lượng tồn kho     |
| sku         | VARCHAR(100)  | UNIQUE                          | Mã SKU sản phẩm      |
| is_active   | BOOLEAN       | DEFAULT TRUE                    | Trạng thái hoạt động |
| deleted_at  | TIMESTAMP     |                                 | Thời điểm xóa mềm    |
| created_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW()         | Ngày tạo             |
| updated_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW()         | Ngày cập nhật        |
| created_by  | BIGINT        | FOREIGN KEY → users.id          | ID người tạo         |
| updated_by  | BIGINT        | FOREIGN KEY → users.id          | ID người cập nhật    |

**Ràng buộc:**

- Giá phải > 0
- Số lượng tồn kho >= 0
- category_id phải tồn tại trong bảng categories
- SKU phải unique

**Index:**

- `idx_products_category_id` trên `category_id`
- `idx_products_name` trên `name` (để tìm kiếm)
- `idx_products_slug` trên `slug` (unique)
- `idx_products_sku` trên `sku` (unique)
- `idx_products_deleted_at` trên `deleted_at`
- `idx_products_is_active` trên `is_active`

### 3.4. Bảng `product_images` (Hình Ảnh Sản Phẩm)

Lưu trữ nhiều hình ảnh cho mỗi sản phẩm.

| Tên Cột       | Kiểu Dữ Liệu | Ràng Buộc                 | Mô Tả                |
| ------------- | ------------ | ------------------------- | -------------------- |
| id            | BIGSERIAL    | PRIMARY KEY               | ID tự động tăng      |
| product_id    | BIGINT       | FOREIGN KEY → products.id | ID sản phẩm          |
| image_url     | VARCHAR(500) | NOT NULL                  | URL hình ảnh         |
| alt_text      | VARCHAR(255) |                           | Mô tả hình ảnh (SEO) |
| is_primary    | BOOLEAN      | DEFAULT FALSE             | Hình ảnh chính       |
| display_order | INTEGER      | DEFAULT 0                 | Thứ tự hiển thị      |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Ngày tạo             |

**Ràng buộc:**

- Mỗi sản phẩm chỉ có 1 hình ảnh `is_primary = TRUE`
- product_id phải tồn tại trong bảng products

**Index:**

- `idx_product_images_product_id` trên `product_id`
- `idx_product_images_is_primary` trên `is_primary`

### 3.5. Bảng `product_reviews` (Đánh Giá Sản Phẩm)

Lưu trữ đánh giá và xếp hạng của khách hàng về sản phẩm.

| Tên Cột              | Kiểu Dữ Liệu | Ràng Buộc                 | Mô Tả                   |
| -------------------- | ------------ | ------------------------- | ----------------------- |
| id                   | BIGSERIAL    | PRIMARY KEY               | ID tự động tăng         |
| product_id           | BIGINT       | FOREIGN KEY → products.id | ID sản phẩm             |
| user_id              | BIGINT       | FOREIGN KEY → users.id    | ID người đánh giá       |
| rating               | INTEGER      | NOT NULL, CHECK (1-5)     | Điểm đánh giá (1-5 sao) |
| comment              | TEXT         |                           | Nhận xét chi tiết       |
| is_verified_purchase | BOOLEAN      | DEFAULT FALSE             | Đã mua sản phẩm         |
| is_approved          | BOOLEAN      | DEFAULT FALSE             | Đã được admin duyệt     |
| created_at           | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Ngày đánh giá           |
| updated_at           | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Ngày cập nhật           |

**Ràng buộc:**

- Mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm
- Rating phải từ 1 đến 5
- product_id và user_id phải tồn tại

**Index:**

- `idx_product_reviews_product_id` trên `product_id`
- `idx_product_reviews_user_id` trên `user_id`
- `idx_product_reviews_rating` trên `rating`
- `UNIQUE(product_id, user_id)` - Mỗi user chỉ đánh giá 1 lần

### 3.6. Bảng `wishlist` (Danh Sách Yêu Thích)

Lưu trữ sản phẩm yêu thích của người dùng.

| Tên Cột    | Kiểu Dữ Liệu | Ràng Buộc                 | Mô Tả                  |
| ---------- | ------------ | ------------------------- | ---------------------- |
| id         | BIGSERIAL    | PRIMARY KEY               | ID tự động tăng        |
| user_id    | BIGINT       | FOREIGN KEY → users.id    | ID người dùng          |
| product_id | BIGINT       | FOREIGN KEY → products.id | ID sản phẩm            |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Ngày thêm vào wishlist |

**Ràng buộc:**

- Mỗi user chỉ thêm 1 lần mỗi sản phẩm vào wishlist
- user_id và product_id phải tồn tại

**Index:**

- `idx_wishlist_user_id` trên `user_id`
- `idx_wishlist_product_id` trên `product_id`
- `UNIQUE(user_id, product_id)` - Tránh trùng lặp

### 3.7. Bảng `user_addresses` (Địa Chỉ Người Dùng)

Lưu trữ nhiều địa chỉ giao hàng của người dùng.

| Tên Cột        | Kiểu Dữ Liệu | Ràng Buộc               | Mô Tả                    |
| -------------- | ------------ | ----------------------- | ------------------------ |
| id             | BIGSERIAL    | PRIMARY KEY             | ID tự động tăng          |
| user_id        | BIGINT       | FOREIGN KEY → users.id  | ID người dùng            |
| recipient_name | VARCHAR(255) | NOT NULL                | Tên người nhận           |
| phone          | VARCHAR(20)  | NOT NULL                | Số điện thoại người nhận |
| address_line1  | VARCHAR(255) | NOT NULL                | Địa chỉ dòng 1           |
| address_line2  | VARCHAR(255) |                         | Địa chỉ dòng 2           |
| city           | VARCHAR(100) | NOT NULL                | Thành phố                |
| district       | VARCHAR(100) |                         | Quận/Huyện               |
| ward           | VARCHAR(100) |                         | Phường/Xã                |
| postal_code    | VARCHAR(20)  |                         | Mã bưu điện              |
| is_default     | BOOLEAN      | DEFAULT FALSE           | Địa chỉ mặc định         |
| deleted_at     | TIMESTAMP    |                         | Thời điểm xóa mềm        |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Ngày tạo                 |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Ngày cập nhật            |

**Ràng buộc:**

- Mỗi user chỉ có 1 địa chỉ `is_default = TRUE`
- user_id phải tồn tại trong bảng users

**Index:**

- `idx_user_addresses_user_id` trên `user_id`
- `idx_user_addresses_is_default` trên `is_default`

### 3.8. Bảng `orders` (Đơn Hàng)

Lưu trữ thông tin các đơn hàng đã được thanh toán.

| Tên Cột             | Kiểu Dữ Liệu  | Ràng Buộc                        | Mô Tả                                                         |
| ------------------- | ------------- | -------------------------------- | ------------------------------------------------------------- |
| id                  | BIGSERIAL     | PRIMARY KEY                      | ID tự động tăng                                               |
| user_id             | BIGINT        | FOREIGN KEY → users.id           | ID người dùng đặt hàng                                        |
| order_number        | VARCHAR(50)   | UNIQUE                           | Mã đơn hàng (ví dụ: ORD-20240101-001)                         |
| order_date          | TIMESTAMP     | NOT NULL, DEFAULT NOW()          | Ngày đặt hàng                                                 |
| total_amount        | DECIMAL(10,2) | NOT NULL                         | Tổng tiền đơn hàng                                            |
| discount_amount     | DECIMAL(10,2) | DEFAULT 0                        | Số tiền giảm giá                                              |
| final_amount        | DECIMAL(10,2) | NOT NULL                         | Tổng tiền sau giảm giá                                        |
| status              | VARCHAR(20)   | NOT NULL, DEFAULT 'PENDING'      | Trạng thái: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |
| payment_method_id   | BIGINT        | FOREIGN KEY → payment_methods.id | Phương thức thanh toán                                        |
| payment_status      | VARCHAR(20)   | DEFAULT 'PENDING'                | Trạng thái thanh toán: PENDING, PAID, FAILED, REFUNDED        |
| shipping_address_id | BIGINT        | FOREIGN KEY → user_addresses.id  | Địa chỉ giao hàng                                             |
| coupon_id           | BIGINT        | FOREIGN KEY → coupons.id         | Mã giảm giá đã sử dụng                                        |
| notes               | TEXT          |                                  | Ghi chú của khách hàng                                        |
| deleted_at          | TIMESTAMP     |                                  | Thời điểm xóa mềm                                             |
| created_at          | TIMESTAMP     | NOT NULL, DEFAULT NOW()          | Ngày tạo                                                      |
| updated_at          | TIMESTAMP     | NOT NULL, DEFAULT NOW()          | Ngày cập nhật                                                 |
| created_by          | BIGINT        | FOREIGN KEY → users.id           | ID người tạo                                                  |
| updated_by          | BIGINT        | FOREIGN KEY → users.id           | ID người cập nhật                                             |

**Ràng buộc:**

- user_id phải tồn tại trong bảng users
- total_amount phải > 0
- final_amount = total_amount - discount_amount
- status phải là một trong: 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
- order_number phải unique

**Index:**

- `idx_orders_user_id` trên `user_id`
- `idx_orders_order_date` trên `order_date` (để sắp xếp)
- `idx_orders_status` trên `status`
- `idx_orders_order_number` trên `order_number` (unique)
- `idx_orders_payment_status` trên `payment_status`

### 3.9. Bảng `order_items` (Chi Tiết Đơn Hàng)

Lưu trữ chi tiết các sản phẩm trong mỗi đơn hàng.

| Tên Cột    | Kiểu Dữ Liệu  | Ràng Buộc                 | Mô Tả                        |
| ---------- | ------------- | ------------------------- | ---------------------------- |
| id         | BIGSERIAL     | PRIMARY KEY               | ID tự động tăng              |
| order_id   | BIGINT        | FOREIGN KEY → orders.id   | ID đơn hàng                  |
| product_id | BIGINT        | FOREIGN KEY → products.id | ID sản phẩm                  |
| quantity   | INTEGER       | NOT NULL, CHECK > 0       | Số lượng sản phẩm            |
| price      | DECIMAL(10,2) | NOT NULL                  | Giá tại thời điểm đặt hàng   |
| subtotal   | DECIMAL(10,2) | NOT NULL                  | Tổng tiền = quantity × price |

**Ràng buộc:**

- order_id phải tồn tại trong bảng orders
- product_id phải tồn tại trong bảng products
- quantity phải > 0
- price phải > 0
- subtotal = quantity × price

**Index:**

- `idx_order_items_order_id` trên `order_id`
- `idx_order_items_product_id` trên `product_id`

### 3.10. Bảng `order_status_history` (Lịch Sử Trạng Thái Đơn Hàng)

Lưu trữ lịch sử thay đổi trạng thái đơn hàng.

| Tên Cột    | Kiểu Dữ Liệu | Ràng Buộc               | Mô Tả               |
| ---------- | ------------ | ----------------------- | ------------------- |
| id         | BIGSERIAL    | PRIMARY KEY             | ID tự động tăng     |
| order_id   | BIGINT       | FOREIGN KEY → orders.id | ID đơn hàng         |
| status     | VARCHAR(20)  | NOT NULL                | Trạng thái mới      |
| notes      | TEXT         |                         | Ghi chú về thay đổi |
| changed_by | BIGINT       | FOREIGN KEY → users.id  | ID người thay đổi   |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Thời điểm thay đổi  |

**Ràng buộc:**

- order_id phải tồn tại trong bảng orders
- changed_by phải tồn tại trong bảng users

**Index:**

- `idx_order_status_history_order_id` trên `order_id`
- `idx_order_status_history_created_at` trên `created_at`

### 3.11. Bảng `refresh_tokens` (Refresh Tokens)

Lưu trữ các refresh tokens để quản lý và có thể revoke khi cần thiết.

| Tên Cột    | Kiểu Dữ Liệu | Ràng Buộc              | Mô Tả                      |
| ---------- | ------------ | ---------------------- | -------------------------- |
| id         | BIGSERIAL    | PRIMARY KEY            | ID tự động tăng            |
| user_id    | BIGINT       | FOREIGN KEY → users.id | ID người dùng sở hữu token |
| token      | VARCHAR(500) | NOT NULL, UNIQUE       | Refresh token (JWT string) |
| expires_at | TIMESTAMP    | NOT NULL               | Thời điểm token hết hạn    |
| created_at | TIMESTAMP    | DEFAULT NOW()          | Ngày tạo token             |

**Ràng buộc:**

- user_id phải tồn tại trong bảng users
- token phải unique
- expires_at phải > created_at

**Index:**

- `idx_refresh_tokens_user_id` trên `user_id`
- `idx_refresh_tokens_token` trên `token` (unique)
- `idx_refresh_tokens_expires_at` trên `expires_at` (để cleanup expired tokens)

### 3.12. Bảng `product_tags` (Tags Sản Phẩm)

Lưu trữ các tags để phân loại và tìm kiếm sản phẩm.

| Tên Cột    | Kiểu Dữ Liệu | Ràng Buộc        | Mô Tả             |
| ---------- | ------------ | ---------------- | ----------------- |
| id         | BIGSERIAL    | PRIMARY KEY      | ID tự động tăng   |
| name       | VARCHAR(100) | NOT NULL, UNIQUE | Tên tag           |
| slug       | VARCHAR(100) | UNIQUE           | URL-friendly name |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Ngày tạo          |

**Ràng buộc:**

- name và slug phải unique

**Index:**

- `idx_product_tags_name` trên `name` (unique)
- `idx_product_tags_slug` trên `slug` (unique)

### 3.13. Bảng `product_tag_map` (Bảng Trung Gian Product-Tag)

Bảng trung gian many-to-many giữa Products và Tags.

| Tên Cột    | Kiểu Dữ Liệu | Ràng Buộc                     | Mô Tả       |
| ---------- | ------------ | ----------------------------- | ----------- |
| product_id | BIGINT       | FOREIGN KEY → products.id     | ID sản phẩm |
| tag_id     | BIGINT       | FOREIGN KEY → product_tags.id | ID tag      |

**Ràng buộc:**

- Composite PRIMARY KEY (product_id, tag_id)
- Mỗi cặp (product_id, tag_id) chỉ xuất hiện 1 lần

**Index:**

- PRIMARY KEY (product_id, tag_id)
- `idx_product_tag_map_product_id` trên `product_id`
- `idx_product_tag_map_tag_id` trên `tag_id`

### 3.14. Bảng `coupons` (Mã Giảm Giá)

Lưu trữ các mã giảm giá và khuyến mãi.

| Tên Cột        | Kiểu Dữ Liệu  | Ràng Buộc               | Mô Tả                                         |
| -------------- | ------------- | ----------------------- | --------------------------------------------- |
| id             | BIGSERIAL     | PRIMARY KEY             | ID tự động tăng                               |
| code           | VARCHAR(50)   | UNIQUE, NOT NULL        | Mã giảm giá                                   |
| discount_type  | VARCHAR(20)   | NOT NULL                | Loại: PERCENTAGE, FIXED_AMOUNT                |
| discount_value | DECIMAL(10,2) | NOT NULL                | Giá trị giảm giá                              |
| min_purchase   | DECIMAL(10,2) | DEFAULT 0               | Giá trị đơn hàng tối thiểu                    |
| max_discount   | DECIMAL(10,2) |                         | Giảm giá tối đa (cho PERCENTAGE)              |
| valid_from     | TIMESTAMP     | NOT NULL                | Ngày bắt đầu hiệu lực                         |
| valid_until    | TIMESTAMP     | NOT NULL                | Ngày kết thúc hiệu lực                        |
| usage_limit    | INTEGER       |                         | Số lần sử dụng tối đa (NULL = không giới hạn) |
| used_count     | INTEGER       | DEFAULT 0               | Số lần đã sử dụng                             |
| is_active      | BOOLEAN       | DEFAULT TRUE            | Trạng thái hoạt động                          |
| deleted_at     | TIMESTAMP     |                         | Thời điểm xóa mềm                             |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Ngày tạo                                      |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Ngày cập nhật                                 |

**Ràng buộc:**

- code phải unique
- discount_type phải là 'PERCENTAGE' hoặc 'FIXED_AMOUNT'
- discount_value phải > 0
- valid_until phải > valid_from
- used_count <= usage_limit (nếu usage_limit không NULL)

**Index:**

- `idx_coupons_code` trên `code` (unique)
- `idx_coupons_is_active` trên `is_active`
- `idx_coupons_valid_from` trên `valid_from`
- `idx_coupons_valid_until` trên `valid_until`

### 3.15. Bảng `payment_methods` (Phương Thức Thanh Toán)

Lưu trữ các phương thức thanh toán có sẵn.

| Tên Cột       | Kiểu Dữ Liệu | Ràng Buộc     | Mô Tả                                     |
| ------------- | ------------ | ------------- | ----------------------------------------- |
| id            | BIGSERIAL    | PRIMARY KEY   | ID tự động tăng                           |
| name          | VARCHAR(100) | NOT NULL      | Tên phương thức                           |
| code          | VARCHAR(50)  | UNIQUE        | Mã phương thức (COD, BANK_TRANSFER, etc.) |
| description   | TEXT         |               | Mô tả                                     |
| is_active     | BOOLEAN      | DEFAULT TRUE  | Trạng thái hoạt động                      |
| display_order | INTEGER      | DEFAULT 0     | Thứ tự hiển thị                           |
| created_at    | TIMESTAMP    | DEFAULT NOW() | Ngày tạo                                  |
| updated_at    | TIMESTAMP    | DEFAULT NOW() | Ngày cập nhật                             |

**Ràng buộc:**

- code phải unique

**Index:**

- `idx_payment_methods_code` trên `code` (unique)
- `idx_payment_methods_is_active` trên `is_active`

### 3.16. Bảng `notifications` (Thông Báo)

Lưu trữ thông báo cho người dùng.

| Tên Cột    | Kiểu Dữ Liệu | Ràng Buộc               | Mô Tả                        |
| ---------- | ------------ | ----------------------- | ---------------------------- |
| id         | BIGSERIAL    | PRIMARY KEY             | ID tự động tăng              |
| user_id    | BIGINT       | FOREIGN KEY → users.id  | ID người dùng nhận thông báo |
| type       | VARCHAR(50)  | NOT NULL                | Loại: ORDER, PRODUCT, SYSTEM |
| title      | VARCHAR(255) | NOT NULL                | Tiêu đề thông báo            |
| message    | TEXT         | NOT NULL                | Nội dung thông báo           |
| link_url   | VARCHAR(500) |                         | Link liên kết                |
| is_read    | BOOLEAN      | DEFAULT FALSE           | Đã đọc chưa                  |
| read_at    | TIMESTAMP    |                         | Thời điểm đọc                |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Ngày tạo                     |

**Ràng buộc:**

- user_id phải tồn tại trong bảng users
- type phải là một trong: 'ORDER', 'PRODUCT', 'SYSTEM'

**Index:**

- `idx_notifications_user_id` trên `user_id`
- `idx_notifications_is_read` trên `is_read`
- `idx_notifications_type` trên `type`
- `idx_notifications_created_at` trên `created_at`

## 4. JPA Entities

### 4.1. Base Entity với Soft Delete và Auditing

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

    @SQLDelete(sql = "UPDATE ${tableName} SET deleted_at = NOW() WHERE id = ?")
    @Where(clause = "deleted_at IS NULL")
    public boolean isDeleted() {
        return deletedAt != null;
    }

    // Getters, setters
}
```

### 4.2. User Entity

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
    private String email;

    @Column(nullable = false)
    private String password;

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

    // Constructors, getters, setters
}
```

### 4.3. Category Entity với Hierarchy

```java
@Entity
@Table(name = "categories",
       indexes = {
           @Index(name = "idx_categories_name", columnList = "name"),
           @Index(name = "idx_categories_slug", columnList = "slug"),
           @Index(name = "idx_categories_parent_id", columnList = "parent_id"),
           @Index(name = "idx_categories_deleted_at", columnList = "deleted_at")
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

    // Constructors, getters, setters
}
```

### 4.4. Product Entity

```java
@Entity
@Table(name = "products",
       indexes = {
           @Index(name = "idx_products_category_id", columnList = "category_id"),
           @Index(name = "idx_products_name", columnList = "name"),
           @Index(name = "idx_products_slug", columnList = "slug"),
           @Index(name = "idx_products_sku", columnList = "sku"),
           @Index(name = "idx_products_deleted_at", columnList = "deleted_at"),
           @Index(name = "idx_products_is_active", columnList = "is_active")
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
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @Column(nullable = false)
    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
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

    // Constructors, getters, setters
}
```

### 4.5. ProductImage Entity

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

    // Constructors, getters, setters
}
```

### 4.6. ProductReview Entity

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
    @Min(value = 1)
    @Max(value = 5)
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

    // Constructors, getters, setters
}
```

### 4.7. Wishlist Entity

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

    // Constructors, getters, setters
}
```

### 4.8. UserAddress Entity

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

    // Constructors, getters, setters
}
```

### 4.9. Order Entity

```java
@Entity
@Table(name = "orders",
       indexes = {
           @Index(name = "idx_orders_user_id", columnList = "user_id"),
           @Index(name = "idx_orders_order_date", columnList = "order_date"),
           @Index(name = "idx_orders_status", columnList = "status"),
           @Index(name = "idx_orders_order_number", columnList = "order_number"),
           @Index(name = "idx_orders_payment_status", columnList = "payment_status")
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
    @DecimalMin(value = "0.01", message = "Tổng tiền phải lớn hơn 0")
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

    // Constructors, getters, setters
}
```

### 4.10. OrderStatusHistory Entity

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

    // Constructors, getters, setters
}
```

### 4.11. ProductTag Entity

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

    // Constructors, getters, setters
}
```

### 4.12. Coupon Entity

```java
@Entity
@Table(name = "coupons",
       indexes = {
           @Index(name = "idx_coupons_code", columnList = "code"),
           @Index(name = "idx_coupons_is_active", columnList = "is_active"),
           @Index(name = "idx_coupons_valid_from", columnList = "valid_from"),
           @Index(name = "idx_coupons_valid_until", columnList = "valid_until")
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

    // Constructors, getters, setters

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive
            && now.isAfter(validFrom)
            && now.isBefore(validUntil)
            && (usageLimit == null || usedCount < usageLimit);
    }
}
```

### 4.13. PaymentMethod Entity

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

    // Constructors, getters, setters
}
```

### 4.14. Notification Entity

```java
@Entity
@Table(name = "notifications",
       indexes = {
           @Index(name = "idx_notifications_user_id", columnList = "user_id"),
           @Index(name = "idx_notifications_is_read", columnList = "is_read"),
           @Index(name = "idx_notifications_type", columnList = "type"),
           @Index(name = "idx_notifications_created_at", columnList = "created_at")
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

    // Constructors, getters, setters
}
```

### 4.15. RefreshToken Entity

```java
@Entity
@Table(name = "refresh_tokens",
       indexes = {
           @Index(name = "idx_refresh_tokens_user_id", columnList = "user_id"),
           @Index(name = "idx_refresh_tokens_token", columnList = "token"),
           @Index(name = "idx_refresh_tokens_expires_at", columnList = "expires_at")
       })
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

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors, getters, setters

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }
}
```

## 5. Enums

### 5.1. UserRole

```java
public enum UserRole {
    CUSTOMER,
    ADMIN
}
```

### 5.2. OrderStatus

```java
public enum OrderStatus {
    PENDING,      // Chờ xử lý
    CONFIRMED,    // Đã xác nhận
    SHIPPED,      // Đã giao hàng
    DELIVERED,    // Đã nhận hàng
    CANCELLED     // Đã hủy
}
```

### 5.3. PaymentStatus

```java
public enum PaymentStatus {
    PENDING,      // Chờ thanh toán
    PAID,         // Đã thanh toán
    FAILED,       // Thanh toán thất bại
    REFUNDED      // Đã hoàn tiền
}
```

### 5.4. DiscountType

```java
public enum DiscountType {
    PERCENTAGE,      // Giảm theo phần trăm
    FIXED_AMOUNT     // Giảm số tiền cố định
}
```

### 5.5. NotificationType

```java
public enum NotificationType {
    ORDER,          // Thông báo đơn hàng
    PRODUCT,        // Thông báo sản phẩm
    SYSTEM          // Thông báo hệ thống
}
```

## 6. Ràng Buộc Xóa Dữ Liệu với Soft Delete

Với Soft Delete, các ràng buộc xóa được thực hiện bằng cách đánh dấu `deleted_at` thay vì xóa cứng.

### 6.1. Xóa Sản Phẩm (Soft Delete)

**Điều kiện:** Chỉ được xóa mềm sản phẩm khi:

- Sản phẩm chưa có trong đơn hàng nào (không có record trong `order_items` với `product_id` tương ứng)

**Cách kiểm tra với Spring Data JPA:**

```java
// Trong ProductRepository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.product.id = :productId")
    boolean hasOrderItems(@Param("productId") Long productId);
}

// Trong ProductService
@Transactional
public void deleteProduct(Long id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

    if (productRepository.hasOrderItems(id)) {
        throw new BusinessException("Không thể xóa sản phẩm đã có trong đơn hàng");
    }

    product.setDeletedAt(LocalDateTime.now());
    productRepository.save(product);
}
```

### 6.2. Xóa Loại Sản Phẩm (Soft Delete)

**Điều kiện:** Chỉ được xóa mềm loại sản phẩm khi:

- Loại sản phẩm chưa có sản phẩm nào (không có record trong `products` với `category_id` tương ứng và `deleted_at IS NULL`)

### 6.3. Xóa Người Dùng (Soft Delete)

**Điều kiện:** Chỉ được xóa mềm người dùng khi:

- Người dùng chưa thực hiện đặt hàng online lần nào (không có record trong `orders` với `user_id` tương ứng và `deleted_at IS NULL`)

## 7. Quan Hệ Giữa Các Bảng

### 7.1. Users → Orders (One-to-Many)

- Một người dùng có thể có nhiều đơn hàng
- Khi xóa mềm user, các đơn hàng vẫn giữ nguyên

### 7.2. Users → UserAddresses (One-to-Many)

- Một người dùng có thể có nhiều địa chỉ
- Một địa chỉ chỉ thuộc về một người dùng

### 7.3. Users → Wishlist (One-to-Many)

- Một người dùng có thể có nhiều sản phẩm trong wishlist
- Mỗi cặp (user_id, product_id) chỉ xuất hiện 1 lần

### 7.4. Users → ProductReviews (One-to-Many)

- Một người dùng có thể đánh giá nhiều sản phẩm
- Mỗi cặp (user_id, product_id) chỉ đánh giá 1 lần

### 7.5. Orders → OrderItems (One-to-Many)

- Một đơn hàng có nhiều chi tiết sản phẩm
- Khi xóa order, cascade xóa các order_items

### 7.6. Orders → OrderStatusHistory (One-to-Many)

- Một đơn hàng có nhiều lịch sử thay đổi trạng thái
- Mỗi thay đổi được ghi lại với timestamp và người thay đổi

### 7.7. Products → ProductImages (One-to-Many)

- Một sản phẩm có nhiều hình ảnh
- Một hình ảnh chỉ thuộc về một sản phẩm

### 7.8. Products → ProductReviews (One-to-Many)

- Một sản phẩm có thể có nhiều đánh giá
- Mỗi đánh giá chỉ thuộc về một sản phẩm và một người dùng

### 7.9. Products ↔ ProductTags (Many-to-Many)

- Một sản phẩm có thể có nhiều tags
- Một tag có thể được gán cho nhiều sản phẩm
- Sử dụng bảng trung gian `product_tag_map`

### 7.10. Categories → Categories (Self-Referencing)

- Một danh mục có thể có danh mục cha (parent)
- Một danh mục có thể có nhiều danh mục con (children)
- Hỗ trợ danh mục đa cấp

### 7.11. Categories → Products (One-to-Many)

- Một loại sản phẩm có nhiều sản phẩm
- Khi xóa mềm category, các sản phẩm vẫn giữ nguyên

## 8. Database Schema Management với Hibernate Auto DDL

**Dự án này sử dụng Hibernate Auto DDL** để tự động tạo schema từ JPA Entities.

### 8.1. Cách Hoạt Động

Hibernate sẽ tự động tạo và cập nhật database schema dựa trên các JPA Entities được định nghĩa trong code.

**Cấu hình `application.yml`:**

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update # Tự động tạo/sửa schema từ Entities
    show-sql: true # Hiển thị SQL để debug (development)
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### 8.2. Các Giá Trị `ddl-auto`

- `create`: Xóa và tạo lại schema mỗi lần start (chỉ dùng cho test, sẽ mất dữ liệu)
- `create-drop`: Tạo khi start, xóa khi shutdown (chỉ dùng cho test)
- `update`: **Tự động tạo/sửa schema dựa trên Entities** (Development - Khuyến nghị)
- `validate`: Chỉ kiểm tra schema có khớp với Entities không (Production)
- `none`: Không làm gì cả

**Khuyến nghị:**

- **Development:** `ddl-auto: update`
- **Production:** `ddl-auto: validate` hoặc `none`

### 8.3. Quy Trình

1. **Định nghĩa JPA Entities** với đầy đủ annotations:

   - `@Entity`, `@Table`
   - `@Id`, `@GeneratedValue`
   - `@Column`, `@ManyToOne`, `@OneToMany`, `@ManyToMany`, etc.
   - Bean Validation annotations (`@NotNull`, `@Min`, etc.)
   - `@SQLDelete`, `@Where` cho Soft Delete
   - `@EntityListeners(AuditingEntityListener.class)` cho Auditing

2. **Hibernate tự động tạo schema** khi ứng dụng start:

   - Tạo các bảng chưa tồn tại
   - Thêm các cột mới nếu Entity có thay đổi
   - Tạo indexes dựa trên `@Index` annotations
   - Tạo foreign keys dựa trên relationships
   - Tạo unique constraints dựa trên `@UniqueConstraint`

3. **Khi thay đổi Entity:**
   - Hibernate tự động update schema
   - ⚠️ **Cẩn thận:** Có thể mất dữ liệu khi thay đổi cấu trúc lớn

### 8.4. Ưu Điểm

- ✅ **Đơn giản:** Không cần viết SQL migration scripts
- ✅ **Tự động sync:** Schema luôn khớp với Entities
- ✅ **Nhanh chóng:** Phù hợp cho development và bài tập lớn
- ✅ **Tập trung:** Chỉ cần quan tâm đến Entities, không cần SQL

### 8.5. Lưu Ý Quan Trọng

- **Chỉ cần định nghĩa Entities:** Với `ddl-auto: update`, bạn chỉ cần định nghĩa các JPA Entities đúng là đủ
- **Không cần SQL scripts:** Hibernate tự động generate SQL từ Entities
- **Thứ tự tạo bảng:** Hibernate tự động xử lý dependencies giữa các bảng
- **Indexes:** Định nghĩa trong `@Table(indexes = {...})` hoặc `@Index`
- **Constraints:** Định nghĩa qua annotations (`@NotNull`, `@Unique`, `@UniqueConstraint`, etc.)
- **Soft Delete:** Sử dụng `@SQLDelete` và `@Where` để tự động filter deleted records
- **Auditing:** Sử dụng `@EntityListeners(AuditingEntityListener.class)` và `@EnableJpaAuditing`

## 9. Dữ Liệu Mẫu (Sample Data)

### 9.1. Categories (với Hierarchy)

```
- Sinh nhật (parent_id = NULL)
  - Thiệp sinh nhật nam (parent_id = 1)
  - Thiệp sinh nhật nữ (parent_id = 1)
  - Thiệp sinh nhật trẻ em (parent_id = 1)
- Tết Nguyên Đán (parent_id = NULL)
  - Thiệp Tết truyền thống (parent_id = 2)
  - Thiệp Tết hiện đại (parent_id = 2)
- Giáng sinh (parent_id = NULL)
- Ngày lễ tình nhân (parent_id = NULL)
- Ngày của mẹ (parent_id = NULL)
- Ngày của cha (parent_id = NULL)
- Tốt nghiệp (parent_id = NULL)
- Kỷ niệm (parent_id = NULL)
```

### 9.2. Users

- Admin mặc định: admin@greetingcard.com / admin123
- Customer mẫu: customer@example.com / customer123

### 9.3. Products

- Mỗi loại có ít nhất 3-5 sản phẩm mẫu
- Giá từ 10,000 VNĐ đến 100,000 VNĐ
- Số lượng tồn kho từ 0 đến 100
- Mỗi sản phẩm có ít nhất 2-3 hình ảnh

### 9.4. Payment Methods

- COD (Cash on Delivery)
- Bank Transfer
- Credit Card
- E-Wallet

### 9.5. Coupons

- WELCOME10: Giảm 10% cho đơn hàng đầu tiên
- SUMMER20: Giảm 20% cho đơn hàng >= 200,000 VNĐ
- FIXED50K: Giảm 50,000 VNĐ cho đơn hàng >= 500,000 VNĐ

## 10. Lưu Ý Kỹ Thuật với Spring Data JPA

1. **Timestamps:** Sử dụng `@CreationTimestamp` và `@UpdateTimestamp` từ Hibernate hoặc `@CreatedDate` và `@LastModifiedDate` từ Spring Data JPA
2. **Decimal Precision:** Sử dụng `BigDecimal` với `@Column(precision = 10, scale = 2)` cho giá tiền
3. **Password Hashing:** Password phải được hash bằng BCryptPasswordEncoder trước khi lưu vào Entity
4. **Fetch Types:**
   - Sử dụng `LAZY` cho các relationships để tránh N+1 problem
   - Sử dụng `EAGER` chỉ khi thực sự cần thiết
5. **Cascade Types:**
   - `CascadeType.ALL` cho parent-child relationships (Order → OrderItems)
   - `orphanRemoval = true` để tự động xóa child khi xóa khỏi collection
6. **Validation:** Sử dụng Bean Validation (`@NotNull`, `@Min`, `@DecimalMin`, etc.) trên Entity fields
7. **Indexes:** Định nghĩa indexes trong `@Table` annotation với `@Index` hoặc `indexes = {...}`
8. **Enums:** Sử dụng `@Enumerated(EnumType.STRING)` để lưu enum dưới dạng string trong database
9. **Soft Delete:** Sử dụng `@SQLDelete` và `@Where` annotations để tự động filter deleted records
10. **Audit Trail:** Sử dụng JPA Auditing với `@EntityListeners(AuditingEntityListener.class)` và `@EnableJpaAuditing`
11. **Many-to-Many:** Sử dụng `@ManyToMany` với `@JoinTable` để định nghĩa bảng trung gian
12. **Self-Referencing:** Sử dụng `@ManyToOne` và `@OneToMany` với cùng Entity để tạo hierarchy
13. **Unique Constraints:** Sử dụng `@UniqueConstraint` trong `@Table` hoặc `@Column(unique = true)`
14. **Slug Generation:** Tự động generate slug từ name để SEO-friendly URLs
15. **Order Number Generation:** Tự động generate order_number theo pattern (ví dụ: ORD-YYYYMMDD-XXX)
