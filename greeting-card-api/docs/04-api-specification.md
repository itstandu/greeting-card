# API Specification

## 1. Tổng Quan

API được thiết kế theo chuẩn RESTful với các quy ước:

- **Base URL:** `http://localhost:8080/api`
- **Content-Type:** `application/json`
- **Authentication:** JWT với accessToken và refreshToken (lưu trong HTTP-only cookies)
- **Response Format:** JSON
- **Password Encoding:** BCrypt

## 2. Cấu Trúc Response

### 2.1. Response Thành Công

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 2.2. Response Lỗi

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### 2.3. Response Phân Trang

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 3. Authentication & Authorization

### 3.1. Đăng Ký

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "CUSTOMER",
    "emailVerified": false
  },
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản."
}
```

**Validation:**

- Email: required, valid email format, unique
- Password: required, min 6 characters (sẽ được hash bằng BCrypt)
- FullName: required, min 2 characters
- Phone: optional, valid phone format
- Address: optional

**Quy trình:**
1. Password được hash bằng BCrypt trước khi lưu vào database
2. Tạo email verification token (JWT hoặc UUID)
3. Gửi email chứa link xác thực: `/api/auth/verify-email?token={verificationToken}`
4. Tài khoản ở trạng thái `emailVerified = false` cho đến khi xác thực

### 3.2. Đăng Nhập

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER",
      "emailVerified": true
    }
  },
  "message": "Đăng nhập thành công"
}
```

**Cookies được set (HTTP-only, Secure):**
- `accessToken`: JWT token ngắn hạn (ví dụ: 15 phút)
- `refreshToken`: JWT token dài hạn (ví dụ: 7 ngày)

**Lưu ý:**
- Tokens KHÔNG được trả về trong response body, chỉ trong cookies
- Cookies được set với flags: `HttpOnly`, `Secure`, `SameSite=Strict`
- Yêu cầu email đã được xác thực (`emailVerified = true`)

**Error (403 Forbidden) - Email chưa xác thực:**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản."
  }
}
```

### 3.3. Xác Thực Email

**Endpoint:** `GET /api/auth/verify-email`

**Query Parameters:**
- `token` (required): Email verification token từ link trong email

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ."
}
```

**Error (400 Bad Request) - Token không hợp lệ hoặc hết hạn:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_VERIFICATION_TOKEN",
    "message": "Token xác thực không hợp lệ hoặc đã hết hạn."
  }
}
```

### 3.4. Gửi Lại Email Xác Thực

**Endpoint:** `POST /api/auth/resend-verification`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư."
}
```

### 3.5. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Cookies:**
- `refreshToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Access token đã được làm mới"
}
```

**Cookies được set:**
- `accessToken`: JWT token mới (ngắn hạn)

**Error (401 Unauthorized) - RefreshToken không hợp lệ:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
  }
}
```

### 3.6. Đăng Xuất

**Endpoint:** `POST /api/auth/logout`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie
- `refreshToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**Cookies được xóa:**
- `accessToken`: Set về empty và expires
- `refreshToken`: Set về empty và expires

## 4. Products API

### 4.1. Lấy Danh Sách Sản Phẩm

**Endpoint:** `GET /api/products`

**Query Parameters:**

- `page` (optional): Số trang (default: 1)
- `size` (optional): Số lượng mỗi trang (default: 20)
- `categoryId` (optional): Lọc theo loại sản phẩm
- `search` (optional): Tìm kiếm theo tên
- `sort` (optional): Sắp xếp (price_asc, price_desc, name_asc, name_desc)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Thiệp chúc mừng sinh nhật",
      "description": "Thiệp đẹp cho ngày sinh nhật",
      "price": 25000,
      "stock": 50,
      "imageUrl": "https://example.com/image1.jpg",
      "category": {
        "id": 1,
        "name": "Sinh nhật"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 4.2. Lấy Chi Tiết Sản Phẩm

**Endpoint:** `GET /api/products/{id}`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Thiệp chúc mừng sinh nhật",
    "slug": "thiep-chuc-mung-sinh-nhat",
    "description": "Thiệp đẹp cho ngày sinh nhật",
    "price": 25000,
    "stock": 50,
    "sku": "PROD-001",
    "images": [
      {
        "id": 1,
        "imageUrl": "https://example.com/image1.jpg",
        "altText": "Thiệp sinh nhật mặt trước",
        "isPrimary": true,
        "displayOrder": 0
      },
      {
        "id": 2,
        "imageUrl": "https://example.com/image2.jpg",
        "altText": "Thiệp sinh nhật mặt sau",
        "isPrimary": false,
        "displayOrder": 1
      }
    ],
    "category": {
      "id": 1,
      "name": "Sinh nhật",
      "slug": "sinh-nhat"
    },
    "tags": [
      {
        "id": 1,
        "name": "Sinh nhật",
        "slug": "sinh-nhat"
      },
      {
        "id": 2,
        "name": "Đẹp",
        "slug": "dep"
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 10,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  }
}
```

## 5. Categories API

### 5.1. Lấy Danh Sách Loại Sản Phẩm

**Endpoint:** `GET /api/categories`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sinh nhật",
      "description": "Thiệp chúc mừng sinh nhật"
    }
  ]
}
```

### 5.2. Lấy Chi Tiết Loại Sản Phẩm

**Endpoint:** `GET /api/categories/{id}`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sinh nhật",
    "description": "Thiệp chúc mừng sinh nhật",
    "productCount": 15
  }
}
```

## 6. Cart API (Session-based)

### 6.1. Thêm Sản Phẩm Vào Giỏ Hàng

**Endpoint:** `POST /api/cart/add`

**Request Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 1,
        "productName": "Thiệp chúc mừng sinh nhật",
        "price": 25000,
        "quantity": 2,
        "subtotal": 50000
      }
    ],
    "total": 50000
  }
}
```

### 6.2. Xem Giỏ Hàng

**Endpoint:** `GET /api/cart`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 1,
        "productName": "Thiệp chúc mừng sinh nhật",
        "price": 25000,
        "quantity": 2,
        "subtotal": 50000
      }
    ],
    "total": 50000
  }
}
```

### 6.3. Cập Nhật Số Lượng

**Endpoint:** `PUT /api/cart/items/{productId}`

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 1,
        "productName": "Thiệp chúc mừng sinh nhật",
        "price": 25000,
        "quantity": 3,
        "subtotal": 75000
      }
    ],
    "total": 75000
  }
}
```

**Lưu ý:** Nếu quantity = 0, sản phẩm sẽ bị xóa khỏi giỏ hàng.

### 6.4. Xóa Sản Phẩm Khỏi Giỏ Hàng

**Endpoint:** `DELETE /api/cart/items/{productId}`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi giỏ hàng"
}
```

## 7. Orders API

### 7.1. Tạo Đơn Hàng (Thanh Toán)

**Endpoint:** `POST /api/orders`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "shippingAddressId": 1,
  "paymentMethodId": 1,
  "couponCode": "WELCOME10",
  "notes": "Giao hàng vào buổi sáng"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-20240101-001",
    "orderDate": "2024-01-01T10:00:00",
    "totalAmount": 200000,
    "discountAmount": 20000,
    "finalAmount": 180000,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "items": [
      {
        "productId": 1,
        "productName": "Thiệp chúc mừng sinh nhật",
        "quantity": 3,
        "price": 25000,
        "subtotal": 75000
      }
    ]
  },
  "message": "Đặt hàng thành công. Email xác nhận đã được gửi."
}
```

**Lưu ý:** Sau khi tạo đơn hàng thành công, giỏ hàng trong session sẽ bị xóa.

### 7.2. Lấy Lịch Sử Đơn Hàng (Customer)

**Endpoint:** `GET /api/orders`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**

- `page` (optional): Số trang
- `size` (optional): Số lượng mỗi trang

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderDate": "2024-01-01T10:00:00",
      "totalAmount": 75000,
      "status": "CONFIRMED"
    }
  ],
  "pagination": { ... }
}
```

### 7.3. Lấy Chi Tiết Đơn Hàng

**Endpoint:** `GET /api/orders/{id}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-20240101-001",
    "orderDate": "2024-01-01T10:00:00",
    "totalAmount": 75000,
    "discountAmount": 0,
    "finalAmount": 75000,
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "shippingAddress": {
      "id": 1,
      "recipientName": "Nguyễn Văn A",
      "phone": "0123456789",
      "addressLine1": "123 Đường ABC",
      "city": "TP.HCM",
      "district": "Quận 1"
    },
    "paymentMethod": {
      "id": 1,
      "name": "Thanh toán khi nhận hàng",
      "code": "COD"
    },
    "items": [
      {
        "productId": 1,
        "productName": "Thiệp chúc mừng sinh nhật",
        "quantity": 3,
        "price": 25000,
        "subtotal": 75000
      }
    ]
  }
}
```

### 7.4. Lấy Lịch Sử Trạng Thái Đơn Hàng

**Endpoint:** `GET /api/orders/{id}/status-history`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "notes": "Đơn hàng mới được tạo",
      "changedBy": {
        "id": 1,
        "fullName": "Nguyễn Văn A"
      },
      "createdAt": "2024-01-01T10:00:00"
    },
    {
      "id": 2,
      "status": "CONFIRMED",
      "notes": "Đã xác nhận đơn hàng",
      "changedBy": {
        "id": 2,
        "fullName": "Admin"
      },
      "createdAt": "2024-01-01T11:00:00"
    }
  ]
}
```

## 8. Profile API (Customer)

### 8.1. Xem Thông Tin Cá Nhân

**Endpoint:** `GET /api/profile`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  }
}
```

### 8.2. Cập Nhật Thông Tin Cá Nhân

**Endpoint:** `PUT /api/profile`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "456 Đường XYZ, Quận 2, TP.HCM"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn B",
    "phone": "0987654321",
    "address": "456 Đường XYZ, Quận 2, TP.HCM"
  },
  "message": "Cập nhật thông tin thành công"
}
```

### 8.3. Đổi Mật Khẩu

**Endpoint:** `PUT /api/profile/password`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

## 9. Product Reviews API

### 9.1. Lấy Danh Sách Đánh Giá Sản Phẩm

**Endpoint:** `GET /api/products/{productId}/reviews`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `size` (optional): Số lượng mỗi trang (default: 10)
- `rating` (optional): Lọc theo rating (1-5)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "fullName": "Nguyễn Văn A"
      },
      "rating": 5,
      "comment": "Thiệp rất đẹp, chất lượng tốt!",
      "isVerifiedPurchase": true,
      "createdAt": "2024-01-15T10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 9.2. Tạo Đánh Giá Sản Phẩm

**Endpoint:** `POST /api/products/{productId}/reviews`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Thiệp rất đẹp, chất lượng tốt!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "Thiệp rất đẹp, chất lượng tốt!",
    "isVerifiedPurchase": true,
    "isApproved": false,
    "createdAt": "2024-01-15T10:00:00"
  },
  "message": "Đánh giá đã được gửi. Vui lòng chờ admin duyệt."
}
```

**Validation:**
- Rating: required, integer từ 1 đến 5
- Comment: optional, max 1000 characters

**Lưu ý:** Mỗi user chỉ có thể đánh giá 1 lần cho mỗi sản phẩm.

### 9.3. Cập Nhật Đánh Giá

**Endpoint:** `PUT /api/products/{productId}/reviews/{reviewId}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:** Tương tự như POST

**Lưu ý:** Chỉ user tạo đánh giá mới có thể cập nhật.

### 9.4. Xóa Đánh Giá

**Endpoint:** `DELETE /api/products/{productId}/reviews/{reviewId}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Lưu ý:** Chỉ user tạo đánh giá mới có thể xóa.

## 10. Wishlist API

### 10.1. Lấy Danh Sách Wishlist

**Endpoint:** `GET /api/wishlist`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `size` (optional): Số lượng mỗi trang (default: 20)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Thiệp chúc mừng sinh nhật",
        "price": 25000,
        "imageUrl": "https://example.com/image1.jpg"
      },
      "createdAt": "2024-01-10T10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 10.2. Thêm Vào Wishlist

**Endpoint:** `POST /api/wishlist`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "productId": 1
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Đã thêm sản phẩm vào wishlist"
}
```

**Error (400 Bad Request) - Sản phẩm đã có trong wishlist:**

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_ALREADY_IN_WISHLIST",
    "message": "Sản phẩm đã có trong wishlist"
  }
}
```

### 10.3. Xóa Khỏi Wishlist

**Endpoint:** `DELETE /api/wishlist/{productId}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi wishlist"
}
```

## 11. User Addresses API

### 11.1. Lấy Danh Sách Địa Chỉ

**Endpoint:** `GET /api/addresses`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recipientName": "Nguyễn Văn A",
      "phone": "0123456789",
      "addressLine1": "123 Đường ABC",
      "addressLine2": "Phường 1",
      "city": "TP.HCM",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "postalCode": "700000",
      "isDefault": true,
      "createdAt": "2024-01-01T10:00:00"
    }
  ]
}
```

### 11.2. Thêm Địa Chỉ Mới

**Endpoint:** `POST /api/addresses`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "recipientName": "Nguyễn Văn A",
  "phone": "0123456789",
  "addressLine1": "123 Đường ABC",
  "addressLine2": "Phường 1",
  "city": "TP.HCM",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "postalCode": "700000",
  "isDefault": false
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "recipientName": "Nguyễn Văn A",
    "phone": "0123456789",
    "addressLine1": "123 Đường ABC",
    "city": "TP.HCM",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "isDefault": false
  },
  "message": "Đã thêm địa chỉ mới"
}
```

**Lưu ý:** Nếu `isDefault = true`, các địa chỉ khác sẽ tự động set `isDefault = false`.

### 11.3. Cập Nhật Địa Chỉ

**Endpoint:** `PUT /api/addresses/{id}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:** Tương tự như POST

### 11.4. Xóa Địa Chỉ

**Endpoint:** `DELETE /api/addresses/{id}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã xóa địa chỉ"
}
```

**Lưu ý:** Không thể xóa địa chỉ mặc định nếu còn địa chỉ khác.

### 11.5. Đặt Địa Chỉ Mặc Định

**Endpoint:** `PUT /api/addresses/{id}/set-default`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã đặt làm địa chỉ mặc định"
}
```

## 12. Coupons API

### 12.1. Lấy Danh Sách Coupons Có Sẵn

**Endpoint:** `GET /api/coupons`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "WELCOME10",
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "minPurchase": 100000,
      "maxDiscount": 50000,
      "validFrom": "2024-01-01T00:00:00",
      "validUntil": "2024-12-31T23:59:59",
      "isActive": true
    }
  ]
}
```

### 12.2. Validate Coupon

**Endpoint:** `POST /api/coupons/validate`

**Request Body:**

```json
{
  "code": "WELCOME10",
  "totalAmount": 200000
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "code": "WELCOME10",
    "discountAmount": 20000,
    "finalAmount": 180000,
    "message": "Mã giảm giá hợp lệ"
  }
}
```

**Error (400 Bad Request) - Coupon không hợp lệ:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_COUPON",
    "message": "Mã giảm giá không hợp lệ hoặc đã hết hạn"
  }
}
```

## 13. Notifications API

### 13.1. Lấy Danh Sách Thông Báo

**Endpoint:** `GET /api/notifications`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `size` (optional): Số lượng mỗi trang (default: 20)
- `isRead` (optional): Lọc theo trạng thái đọc (true/false)
- `type` (optional): Lọc theo loại (ORDER, PRODUCT, SYSTEM)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "ORDER",
      "title": "Đơn hàng đã được xác nhận",
      "message": "Đơn hàng #ORD-20240101-001 của bạn đã được xác nhận",
      "linkUrl": "/orders/1",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

### 13.2. Đánh Dấu Đã Đọc

**Endpoint:** `PUT /api/notifications/{id}/read`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã đánh dấu đã đọc"
}
```

### 13.3. Đánh Dấu Tất Cả Đã Đọc

**Endpoint:** `PUT /api/notifications/read-all`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả thông báo đã đọc"
}
```

### 13.4. Đếm Thông Báo Chưa Đọc

**Endpoint:** `GET /api/notifications/unread-count`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

## 14. Orders API (Updated)

### 14.1. Tạo Đơn Hàng (Thanh Toán)

Đã được cập nhật ở section 7.1 với các trường mới: `shippingAddressId`, `paymentMethodId`, `couponCode`.

### 14.2. Lấy Lịch Sử Trạng Thái Đơn Hàng

Đã được thêm ở section 7.4.

## 15. Admin API

#### Lấy Danh Sách Sản Phẩm (Admin)

**Endpoint:** `GET /api/admin/products`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:** Tương tự như `/api/products` + thêm các filter admin

#### Thêm Sản Phẩm Mới

**Endpoint:** `POST /api/admin/products`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "categoryId": 1,
  "name": "Thiệp chúc mừng sinh nhật",
  "description": "Thiệp đẹp cho ngày sinh nhật",
  "price": 25000,
  "stock": 50,
  "imageUrl": "https://example.com/image1.jpg"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "categoryId": 1,
    "name": "Thiệp chúc mừng sinh nhật",
    "description": "Thiệp đẹp cho ngày sinh nhật",
    "price": 25000,
    "stock": 50,
    "imageUrl": "https://example.com/image1.jpg"
  }
}
```

#### Cập Nhật Sản Phẩm

**Endpoint:** `PUT /api/admin/products/{id}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:** Tương tự như POST

#### Xóa Sản Phẩm

**Endpoint:** `DELETE /api/admin/products/{id}`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công"
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_HAS_ORDERS",
    "message": "Không thể xóa sản phẩm đã có trong đơn hàng"
  }
}
```

### 9.2. Quản Lý Loại Sản Phẩm

Tương tự như quản lý sản phẩm:

- `GET /api/admin/categories`
- `GET /api/admin/categories/{id}`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`

### 9.3. Quản Lý Người Dùng

#### Lấy Danh Sách Người Dùng

**Endpoint:** `GET /api/admin/users`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**

- `page`, `size`: Phân trang
- `search`: Tìm kiếm theo email, tên
- `role`: Lọc theo role

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0123456789",
      "role": "CUSTOMER",
      "createdAt": "2024-01-01T10:00:00"
    }
  ],
  "pagination": { ... }
}
```

**Lưu ý:** Không trả về password trong response.

#### Xem Chi Tiết Người Dùng

**Endpoint:** `GET /api/admin/users/{id}`

#### Cập Nhật Người Dùng

**Endpoint:** `PUT /api/admin/users/{id}`

**Request Body:**

```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "456 Đường XYZ",
  "role": "CUSTOMER"
}
```

#### Xóa Người Dùng

**Endpoint:** `DELETE /api/admin/users/{id}`

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "USER_HAS_ORDERS",
    "message": "Không thể xóa người dùng đã có đơn hàng"
  }
}
```

### 9.4. Quản Lý Đơn Hàng

#### Lấy Danh Sách Đơn Hàng

**Endpoint:** `GET /api/admin/orders`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**

- `page`, `size`: Phân trang
- `status`: Lọc theo trạng thái
- `sort`: Sắp xếp (orderDate_desc mặc định)

#### Xem Chi Tiết Đơn Hàng

**Endpoint:** `GET /api/admin/orders/{id}`

#### Cập Nhật Đơn Hàng

**Endpoint:** `PUT /api/admin/orders/{id}`

**Request Body:**

```json
{
  "status": "CONFIRMED",
  "notes": "Đã xác nhận đơn hàng"
}
```

**Lưu ý:** Khi cập nhật trạng thái, hệ thống tự động tạo record trong `order_status_history`.

#### Cập Nhật Số Lượng Sản Phẩm Trong Đơn Hàng

**Endpoint:** `PUT /api/admin/orders/{orderId}/items/{itemId}`

**Request Body:**

```json
{
  "quantity": 5
}
```

### 9.5. Tìm Kiếm

#### Tìm Kiếm Sản Phẩm

**Endpoint:** `GET /api/admin/search/products`

**Query Parameters:**

- `q`: Từ khóa tìm kiếm
- `categoryId`: Lọc theo loại

#### Tìm Kiếm Người Dùng

**Endpoint:** `GET /api/admin/search/users`

**Query Parameters:**

- `q`: Từ khóa tìm kiếm (email, tên)

#### Tìm Kiếm Đơn Hàng

**Endpoint:** `GET /api/admin/search/orders`

**Query Parameters:**

- `q`: Từ khóa tìm kiếm (mã đơn hàng, email khách hàng)

#### Tìm Kiếm Đơn Hàng

**Endpoint:** `GET /api/admin/search/orders`

**Query Parameters:**

- `q`: Từ khóa tìm kiếm (mã đơn hàng, email khách hàng)

### 15.6. Quản Lý Coupons

#### Lấy Danh Sách Coupons

**Endpoint:** `GET /api/admin/coupons`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**
- `page`, `size`: Phân trang
- `isActive`: Lọc theo trạng thái

#### Tạo Coupon Mới

**Endpoint:** `POST /api/admin/coupons`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "code": "SUMMER20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minPurchase": 200000,
  "maxDiscount": 100000,
  "validFrom": "2024-06-01T00:00:00",
  "validUntil": "2024-08-31T23:59:59",
  "usageLimit": 100,
  "isActive": true
}
```

#### Cập Nhật Coupon

**Endpoint:** `PUT /api/admin/coupons/{id}`

**Request Body:** Tương tự như POST

#### Xóa Coupon (Soft Delete)

**Endpoint:** `DELETE /api/admin/coupons/{id}`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã xóa coupon"
}
```

### 15.7. Quản Lý Product Reviews

#### Lấy Danh Sách Reviews (Tất Cả)

**Endpoint:** `GET /api/admin/reviews`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Query Parameters:**
- `page`, `size`: Phân trang
- `isApproved`: Lọc theo trạng thái duyệt
- `productId`: Lọc theo sản phẩm

#### Duyệt Review

**Endpoint:** `PUT /api/admin/reviews/{id}/approve`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã duyệt đánh giá"
}
```

#### Từ Chối Review

**Endpoint:** `PUT /api/admin/reviews/{id}/reject`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

**Request Body:**

```json
{
  "reason": "Nội dung không phù hợp"
}
```

### 15.8. Quản Lý Payment Methods

#### Lấy Danh Sách Payment Methods

**Endpoint:** `GET /api/admin/payment-methods`

**Cookies:**
- `accessToken`: Tự động gửi từ HTTP-only cookie

#### Tạo Payment Method Mới

**Endpoint:** `POST /api/admin/payment-methods`

**Request Body:**

```json
{
  "name": "Thanh toán khi nhận hàng",
  "code": "COD",
  "description": "Thanh toán bằng tiền mặt khi nhận hàng",
  "isActive": true,
  "displayOrder": 1
}
```

#### Cập Nhật Payment Method

**Endpoint:** `PUT /api/admin/payment-methods/{id}`

#### Xóa Payment Method

**Endpoint:** `DELETE /api/admin/payment-methods/{id}`

## 16. Error Codes

| Code                        | HTTP Status | Mô Tả                                    |
| --------------------------- | ----------- | ---------------------------------------- |
| VALIDATION_ERROR            | 400         | Lỗi validation dữ liệu đầu vào          |
| UNAUTHORIZED                | 401         | Chưa đăng nhập                            |
| FORBIDDEN                   | 403         | Không có quyền truy cập                   |
| NOT_FOUND                   | 404         | Không tìm thấy resource                   |
| EMAIL_EXISTS                | 400         | Email đã tồn tại                          |
| EMAIL_NOT_VERIFIED          | 403         | Email chưa được xác thực                  |
| INVALID_CREDENTIALS         | 401         | Email hoặc mật khẩu không đúng            |
| INVALID_VERIFICATION_TOKEN  | 400         | Token xác thực email không hợp lệ hoặc đã hết hạn |
| INVALID_REFRESH_TOKEN       | 401         | Refresh token không hợp lệ hoặc đã hết hạn |
| REFRESH_TOKEN_EXPIRED       | 401         | Refresh token đã hết hạn, yêu cầu đăng nhập lại |
| PRODUCT_NOT_FOUND           | 404         | Không tìm thấy sản phẩm                   |
| PRODUCT_HAS_ORDERS          | 400         | Sản phẩm đã có trong đơn hàng             |
| CATEGORY_HAS_PRODUCTS       | 400         | Loại sản phẩm đã có sản phẩm             |
| USER_HAS_ORDERS             | 400         | Người dùng đã có đơn hàng                 |
| INSUFFICIENT_STOCK          | 400         | Số lượng tồn kho không đủ                 |
| CART_EMPTY                  | 400         | Giỏ hàng trống                            |
| PRODUCT_ALREADY_IN_WISHLIST | 400         | Sản phẩm đã có trong wishlist             |
| REVIEW_ALREADY_EXISTS       | 400         | Bạn đã đánh giá sản phẩm này rồi          |
| INVALID_COUPON              | 400         | Mã giảm giá không hợp lệ hoặc đã hết hạn |
| COUPON_EXPIRED              | 400         | Mã giảm giá đã hết hạn                    |
| COUPON_USAGE_LIMIT_REACHED  | 400         | Mã giảm giá đã hết lượt sử dụng            |
| ADDRESS_NOT_FOUND           | 404         | Không tìm thấy địa chỉ                     |
| CANNOT_DELETE_DEFAULT_ADDRESS | 400      | Không thể xóa địa chỉ mặc định            |
| NOTIFICATION_NOT_FOUND      | 404         | Không tìm thấy thông báo                   |

## 17. Rate Limiting & Security

- API có thể áp dụng rate limiting để tránh abuse
- Tất cả endpoints (trừ public) yêu cầu authentication
- Admin endpoints yêu cầu role ADMIN
- Password phải được hash trước khi lưu
- Input validation ở cả client và server
- Soft Delete được sử dụng cho các bảng quan trọng
- JPA Auditing tracking `created_by` và `updated_by`
