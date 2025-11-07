# Vai Trò Người Dùng và Phân Quyền

## 1. Tổng Quan

Hệ thống hỗ trợ 3 loại người dùng với các quyền hạn khác nhau:

1. **Guest** - Người dùng không có tài khoản
2. **Customer** - Người dùng có tài khoản
3. **Admin** - Người quản trị hệ thống

## 2. Guest (Người Dùng Không Có Tài Khoản)

### 2.1. Chức Năng Có Thể Thực Hiện

#### Xem Danh Sách Sản Phẩm
- Xem danh sách tất cả thiệp chúc mừng có trong hệ thống
- Danh sách được lấy từ database
- Có thể lọc theo loại sản phẩm, tìm kiếm theo tên

#### Xem Chi Tiết Sản Phẩm
- Xem thông tin chi tiết của từng thiệp chúc mừng
- Bao gồm: tên, mô tả, giá, hình ảnh (nhiều hình ảnh), loại sản phẩm, số lượng tồn kho, tags
- Xem đánh giá và xếp hạng của sản phẩm (reviews)
- Xem điểm đánh giá trung bình và số lượng đánh giá

#### Chọn Mua Sản Phẩm
- Thêm sản phẩm vào giỏ hàng từ:
  - Trang danh sách sản phẩm
  - Trang chi tiết sản phẩm
- Sản phẩm được lưu trong Session (chưa lưu vào database)

#### Xem Giỏ Hàng
- Xem danh sách các sản phẩm đã chọn mua
- Thông tin giỏ hàng lưu trong Session
- Hiển thị: tên sản phẩm, số lượng, giá, tổng tiền

#### Chỉnh Sửa Giỏ Hàng
- Cập nhật số lượng sản phẩm trong giỏ hàng
- Nếu số lượng = 0 → xóa sản phẩm khỏi giỏ hàng
- Tính toán lại tổng tiền tự động

#### Xem Mã Giảm Giá
- Xem danh sách các mã giảm giá có sẵn
- Xem thông tin chi tiết về mã giảm giá (loại giảm giá, giá trị, điều kiện)

#### Đăng Ký Tài Khoản
- Đăng ký tài khoản mới với các thông tin:
  - Email (không trùng với tài khoản khác)
  - Mật khẩu (được mã hóa bằng BCrypt)
  - Họ và tên
  - Số điện thoại
  - Địa chỉ
- Sau khi đăng ký thành công:
  - Lưu thông tin vào database (password được hash bằng BCrypt)
  - Tài khoản ở trạng thái chưa xác thực email (`emailVerified = false`)
  - Gửi email chứa link xác thực email
  - Thông báo đăng ký thành công và yêu cầu xác thực email
- **Lưu ý:** Người dùng phải xác thực email trước khi có thể đăng nhập

### 2.2. API Endpoints Cho Guest

```
GET    /api/products                    # Xem danh sách sản phẩm
GET    /api/products/{id}               # Xem chi tiết sản phẩm
GET    /api/products/{id}/reviews       # Xem đánh giá sản phẩm
POST   /api/cart/add                    # Thêm sản phẩm vào giỏ hàng
GET    /api/cart                         # Xem giỏ hàng
PUT    /api/cart/items/{id}             # Cập nhật số lượng
DELETE /api/cart/items/{id}              # Xóa sản phẩm khỏi giỏ hàng
GET    /api/coupons                     # Xem danh sách mã giảm giá
POST   /api/coupons/validate            # Validate mã giảm giá
POST   /api/auth/register               # Đăng ký tài khoản
GET    /api/auth/verify-email           # Xác thực email (từ link trong email)
POST   /api/auth/resend-verification    # Gửi lại email xác thực
```

## 3. Customer (Người Dùng Có Tài Khoản)

### 3.1. Chức Năng Kế Thừa Từ Guest

Customer có thể thực hiện tất cả các chức năng của Guest:
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Chọn mua sản phẩm
- Xem giỏ hàng
- Chỉnh sửa giỏ hàng

### 3.2. Chức Năng Bổ Sung

#### Đăng Nhập
- Đăng nhập vào hệ thống với email và mật khẩu
- **Điều kiện:** Email phải đã được xác thực (`emailVerified = true`)
- Nếu email chưa xác thực, trả về lỗi yêu cầu xác thực email
- Sau khi đăng nhập thành công:
  - Hệ thống tạo JWT accessToken (ngắn hạn, ví dụ: 15 phút)
  - Hệ thống tạo JWT refreshToken (dài hạn, ví dụ: 7 ngày)
  - Cả 2 tokens được lưu trong HTTP-only cookies (bảo mật hơn)
  - Trả về thông tin người dùng (không bao gồm tokens trong response body)

#### Xác Thực Email
- Sau khi đăng ký, người dùng nhận email chứa link xác thực
- Click vào link để xác thực email
- Sau khi xác thực thành công, `emailVerified = true`
- Có thể yêu cầu gửi lại email xác thực nếu cần

#### Refresh Token
- Khi accessToken hết hạn, sử dụng refreshToken để lấy accessToken mới
- RefreshToken được gửi tự động từ HTTP-only cookie
- Nếu refreshToken hợp lệ, hệ thống tạo accessToken mới
- Nếu refreshToken hết hạn hoặc không hợp lệ, yêu cầu đăng nhập lại

#### Xử Lý Thanh Toán
- **Điều kiện:**
  - Giỏ hàng đã có sản phẩm
  - Người dùng đã đăng nhập thành công
- **Quy trình:**
  1. Chọn địa chỉ giao hàng (hoặc thêm địa chỉ mới)
  2. Chọn phương thức thanh toán
  3. Nhập mã giảm giá (nếu có)
  4. Xác nhận thông tin đơn hàng
  5. Lưu đơn hàng vào database với `order_number` tự động
  6. Lưu chi tiết đơn hàng (sản phẩm, số lượng, giá)
  7. Áp dụng mã giảm giá và tính toán `discount_amount`, `final_amount`
  8. Cập nhật số lượng tồn kho sản phẩm
  9. Tạo record đầu tiên trong `order_status_history` với status PENDING
  10. Gửi email xác nhận đơn hàng với thông tin chi tiết
  11. Tạo thông báo cho khách hàng
  12. Xóa giỏ hàng trong Session (set về null)

#### Xem Lịch Sử Đơn Hàng
- Xem danh sách các đơn hàng đã đặt
- Xem chi tiết từng đơn hàng (bao gồm địa chỉ giao hàng, phương thức thanh toán, mã giảm giá đã sử dụng)
- Xem lịch sử thay đổi trạng thái đơn hàng (`order_status_history`)
- Theo dõi trạng thái đơn hàng và trạng thái thanh toán

#### Quản Lý Thông Tin Cá Nhân
- Đánh giá và xếp hạng sản phẩm đã mua (rating 1-5 sao)
- Viết nhận xét chi tiết về sản phẩm
- Mỗi sản phẩm chỉ được đánh giá 1 lần
- Đánh giá sẽ được đánh dấu `isVerifiedPurchase = true` nếu đã mua sản phẩm
- Đánh giá cần được admin duyệt (`isApproved = true`) trước khi hiển thị công khai
- Có thể cập nhật hoặc xóa đánh giá của mình

#### Quản Lý Thông Tin Cá Nhân
- Xem thông tin tài khoản
- Cập nhật thông tin cá nhân (trừ email)
- Đổi mật khẩu

#### Đánh Giá Sản Phẩm
- Đánh giá và xếp hạng sản phẩm đã mua (rating 1-5 sao)
- Viết nhận xét chi tiết về sản phẩm
- Mỗi sản phẩm chỉ được đánh giá 1 lần
- Đánh giá sẽ được đánh dấu `isVerifiedPurchase = true` nếu đã mua sản phẩm
- Đánh giá cần được admin duyệt (`isApproved = true`) trước khi hiển thị công khai
- Có thể cập nhật hoặc xóa đánh giá của mình

#### Quản Lý Wishlist

#### Quản Lý Địa Chỉ Giao Hàng
- Thêm nhiều địa chỉ giao hàng
- Xem danh sách tất cả địa chỉ
- Cập nhật thông tin địa chỉ
- Xóa địa chỉ (không thể xóa địa chỉ mặc định nếu còn địa chỉ khác)
- Đặt địa chỉ mặc định (chỉ có 1 địa chỉ mặc định tại một thời điểm)

#### Sử Dụng Mã Giảm Giá
- Xem danh sách mã giảm giá có sẵn
- Validate mã giảm giá trước khi áp dụng
- Áp dụng mã giảm giá khi thanh toán
- Xem số tiền được giảm và tổng tiền sau giảm giá

#### Xem Thông Báo
- Xem danh sách thông báo từ hệ thống
- Lọc thông báo theo loại (ORDER, PRODUCT, SYSTEM)
- Lọc thông báo theo trạng thái đọc (đã đọc/chưa đọc)
- Đánh dấu thông báo đã đọc
- Đánh dấu tất cả thông báo đã đọc
- Xem số lượng thông báo chưa đọc
- Xem thông tin tài khoản
- Cập nhật thông tin cá nhân (trừ email)
- Đổi mật khẩu

### 3.3. API Endpoints Cho Customer

```
# Tất cả endpoints của Guest +
POST   /api/auth/login                  # Đăng nhập (yêu cầu email đã xác thực)
POST   /api/auth/logout                 # Đăng xuất
POST   /api/auth/refresh                # Refresh accessToken từ refreshToken
POST   /api/orders                      # Tạo đơn hàng (thanh toán)
GET    /api/orders                      # Xem lịch sử đơn hàng
GET    /api/orders/{id}                 # Xem chi tiết đơn hàng
GET    /api/orders/{id}/status-history  # Xem lịch sử trạng thái đơn hàng
GET    /api/profile                     # Xem thông tin cá nhân
PUT    /api/profile                     # Cập nhật thông tin cá nhân
PUT    /api/profile/password            # Đổi mật khẩu
POST   /api/products/{id}/reviews      # Tạo đánh giá sản phẩm
PUT    /api/products/{id}/reviews/{reviewId}  # Cập nhật đánh giá
DELETE /api/products/{id}/reviews/{reviewId} # Xóa đánh giá
GET    /api/wishlist                    # Xem danh sách wishlist
POST   /api/wishlist                    # Thêm vào wishlist
DELETE /api/wishlist/{productId}        # Xóa khỏi wishlist
GET    /api/addresses                   # Xem danh sách địa chỉ
POST   /api/addresses                   # Thêm địa chỉ mới
PUT    /api/addresses/{id}              # Cập nhật địa chỉ
DELETE /api/addresses/{id}              # Xóa địa chỉ
PUT    /api/addresses/{id}/set-default  # Đặt địa chỉ mặc định
GET    /api/notifications               # Xem danh sách thông báo
PUT    /api/notifications/{id}/read     # Đánh dấu đã đọc
PUT    /api/notifications/read-all      # Đánh dấu tất cả đã đọc
GET    /api/notifications/unread-count  # Đếm thông báo chưa đọc
```

## 4. Admin (Người Quản Trị Hệ Thống)

### 4.1. Chức Năng Kế Thừa Từ Customer

Admin có thể thực hiện tất cả các chức năng của Customer:
- Tất cả chức năng của Guest
- Đăng nhập, thanh toán, xem lịch sử đơn hàng
- Quản lý thông tin cá nhân

### 4.2. Chức Năng Quản Trị (Back-End)

#### Tìm Kiếm Thông Tin
- Tìm kiếm sản phẩm/loại sản phẩm
- Tìm kiếm tài khoản người dùng
- Tìm kiếm đơn đặt hàng

#### Quản Lý Sản Phẩm và Loại Sản Phẩm

**Xem Danh Sách:**
- Xem danh sách tất cả sản phẩm
- Xem danh sách tất cả loại sản phẩm
- Có thể lọc, sắp xếp, phân trang

**Xem Chi Tiết:**
- Xem chi tiết từng sản phẩm
- Xem chi tiết từng loại sản phẩm

**Thêm Mới:**
- Thêm mới sản phẩm với đầy đủ thông tin
- Thêm mới loại sản phẩm

**Cập Nhật:**
- Cập nhật thông tin sản phẩm
- Cập nhật thông tin loại sản phẩm

**Xóa:**
- Xóa sản phẩm (chỉ khi sản phẩm chưa có trong đơn hàng nào)
- Xóa loại sản phẩm (chỉ khi loại sản phẩm chưa có sản phẩm nào)

#### Quản Lý Tài Khoản Người Dùng

**Xem Danh Sách:**
- Xem danh sách tất cả tài khoản người dùng đã đăng ký
- Có thể lọc, tìm kiếm

**Xem Chi Tiết:**
- Xem chi tiết từng tài khoản người dùng
- **Lưu ý:** Không được xem password của người dùng

**Cập Nhật:**
- Cập nhật thông tin tài khoản người dùng
- Không được thay đổi password của người dùng

**Xóa:**
- Xóa tài khoản người dùng
- **Điều kiện:** Chỉ xóa được nếu người dùng chưa thực hiện đặt hàng online lần nào

#### Quản Lý Đơn Hàng Trực Tuyến

**Xem Danh Sách:**
- Xem danh sách tất cả đơn hàng
- Sắp xếp theo ngày mua (mới nhất trước)

**Xem Chi Tiết:**
- Xem chi tiết đơn hàng bao gồm:
  - Thông tin khách hàng
  - Danh sách sản phẩm trong đơn hàng
  - Số lượng, giá từng sản phẩm
  - Tổng tiền
  - Ngày đặt hàng
  - Trạng thái đơn hàng

**Cập Nhật:**
- Cập nhật số lượng của mặt hàng trong đơn hàng
- Cập nhật trạng thái đơn hàng (tự động tạo record trong `order_status_history`)
- Xem lịch sử thay đổi trạng thái đơn hàng

#### Quản Lý Đánh Giá Sản Phẩm

**Xem Danh Sách:**
- Xem tất cả đánh giá của khách hàng về sản phẩm
- Lọc theo trạng thái duyệt (đã duyệt/chưa duyệt)
- Lọc theo sản phẩm

**Duyệt/Từ Chối:**
- Duyệt đánh giá để hiển thị công khai (`isApproved = true`)
- Từ chối đánh giá với lý do (đánh giá sẽ không hiển thị)

#### Quản Lý Mã Giảm Giá

**Xem Danh Sách:**
- Xem tất cả mã giảm giá trong hệ thống
- Lọc theo trạng thái hoạt động

**Tạo Mới:**
- Tạo mã giảm giá mới với các thông tin:
  - Mã giảm giá (code) - phải unique
  - Loại giảm giá (PERCENTAGE hoặc FIXED_AMOUNT)
  - Giá trị giảm giá
  - Giá trị đơn hàng tối thiểu
  - Giảm giá tối đa (cho PERCENTAGE)
  - Thời gian hiệu lực (validFrom, validUntil)
  - Số lần sử dụng tối đa (usageLimit)
  - Trạng thái hoạt động (isActive)

**Cập Nhật:**
- Cập nhật thông tin mã giảm giá
- Kích hoạt/vô hiệu hóa mã giảm giá

**Xóa:**
- Xóa mềm mã giảm giá (soft delete với `deleted_at`)

#### Quản Lý Phương Thức Thanh Toán

**Xem Danh Sách:**
- Xem tất cả phương thức thanh toán

**Tạo Mới:**
- Thêm phương thức thanh toán mới (COD, Bank Transfer, Credit Card, E-Wallet, etc.)

**Cập Nhật:**
- Cập nhật thông tin phương thức thanh toán
- Kích hoạt/vô hiệu hóa phương thức thanh toán
- Sắp xếp thứ tự hiển thị (`display_order`)

**Xóa:**
- Xóa phương thức thanh toán

### 4.3. API Endpoints Cho Admin

```
# Tất cả endpoints của Customer +

# Quản lý sản phẩm
GET    /api/admin/products              # Xem danh sách sản phẩm
GET    /api/admin/products/{id}         # Xem chi tiết sản phẩm
POST   /api/admin/products              # Thêm sản phẩm mới
PUT    /api/admin/products/{id}         # Cập nhật sản phẩm
DELETE /api/admin/products/{id}         # Xóa sản phẩm

# Quản lý loại sản phẩm
GET    /api/admin/categories             # Xem danh sách loại sản phẩm
GET    /api/admin/categories/{id}       # Xem chi tiết loại sản phẩm
POST   /api/admin/categories            # Thêm loại sản phẩm mới
PUT    /api/admin/categories/{id}       # Cập nhật loại sản phẩm
DELETE /api/admin/categories/{id}       # Xóa loại sản phẩm

# Quản lý người dùng
GET    /api/admin/users                 # Xem danh sách người dùng
GET    /api/admin/users/{id}            # Xem chi tiết người dùng
PUT    /api/admin/users/{id}            # Cập nhật thông tin người dùng
DELETE /api/admin/users/{id}            # Xóa người dùng

# Quản lý đơn hàng
GET    /api/admin/orders                # Xem danh sách đơn hàng
GET    /api/admin/orders/{id}           # Xem chi tiết đơn hàng
PUT    /api/admin/orders/{id}           # Cập nhật đơn hàng
PUT    /api/admin/orders/{id}/items/{itemId}  # Cập nhật số lượng sản phẩm trong đơn hàng

# Quản lý đánh giá
GET    /api/admin/reviews                # Xem danh sách đánh giá
PUT    /api/admin/reviews/{id}/approve  # Duyệt đánh giá
PUT    /api/admin/reviews/{id}/reject   # Từ chối đánh giá

# Quản lý mã giảm giá
GET    /api/admin/coupons                # Xem danh sách coupons
POST   /api/admin/coupons                # Tạo coupon mới
PUT    /api/admin/coupons/{id}           # Cập nhật coupon
DELETE /api/admin/coupons/{id}           # Xóa coupon

# Quản lý phương thức thanh toán
GET    /api/admin/payment-methods        # Xem danh sách payment methods
POST   /api/admin/payment-methods        # Tạo payment method mới
PUT    /api/admin/payment-methods/{id}   # Cập nhật payment method
DELETE /api/admin/payment-methods/{id}    # Xóa payment method

# Tìm kiếm
GET    /api/admin/search/products       # Tìm kiếm sản phẩm
GET    /api/admin/search/users         # Tìm kiếm người dùng
GET    /api/admin/search/orders        # Tìm kiếm đơn hàng
```

## 5. Bảng Tóm Tắt Phân Quyền

| Chức Năng | Guest | Customer | Admin |
|-----------|-------|----------|-------|
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Xem chi tiết sản phẩm | ✅ | ✅ | ✅ |
| Xem đánh giá sản phẩm | ✅ | ✅ | ✅ |
| Xem mã giảm giá | ✅ | ✅ | ✅ |
| Thêm vào giỏ hàng | ✅ | ✅ | ✅ |
| Xem/chỉnh sửa giỏ hàng | ✅ | ✅ | ✅ |
| Đăng ký tài khoản | ✅ | ❌ | ❌ |
| Đăng nhập | ❌ | ✅ | ✅ |
| Thanh toán/Đặt hàng | ❌ | ✅ | ✅ |
| Xem lịch sử đơn hàng | ❌ | ✅ (của mình) | ✅ (tất cả) |
| Xem lịch sử trạng thái đơn hàng | ❌ | ✅ (của mình) | ✅ (tất cả) |
| Đánh giá sản phẩm | ❌ | ✅ | ✅ |
| Quản lý wishlist | ❌ | ✅ | ✅ |
| Quản lý địa chỉ giao hàng | ❌ | ✅ | ✅ |
| Sử dụng mã giảm giá | ❌ | ✅ | ✅ |
| Xem thông báo | ❌ | ✅ | ✅ |
| Quản lý sản phẩm | ❌ | ❌ | ✅ |
| Quản lý loại sản phẩm | ❌ | ❌ | ✅ |
| Quản lý người dùng | ❌ | ❌ | ✅ |
| Quản lý đơn hàng | ❌ | ❌ | ✅ |
| Quản lý đánh giá (duyệt/từ chối) | ❌ | ❌ | ✅ |
| Quản lý mã giảm giá | ❌ | ❌ | ✅ |
| Quản lý phương thức thanh toán | ❌ | ❌ | ✅ |
| Tìm kiếm (admin) | ❌ | ❌ | ✅ |

## 6. Lưu Ý Bảo Mật

1. **Password:** Không bao giờ trả về password trong API response, kể cả Admin
2. **Authorization:** Tất cả endpoints (trừ public) đều yêu cầu xác thực
3. **Role-based Access Control:** Kiểm tra role trước khi cho phép truy cập các chức năng admin
4. **Session Management:** Giỏ hàng chỉ lưu trong session, không lưu vào database cho đến khi thanh toán
5. **Validation:** Kiểm tra dữ liệu đầu vào ở cả Client và Server
6. **Soft Delete:** Xóa mềm được sử dụng cho các bảng quan trọng (users, products, categories, orders, coupons) để giữ lại lịch sử
7. **JPA Auditing:** Tracking `created_by` và `updated_by` để biết ai tạo/sửa dữ liệu
8. **Review Approval:** Đánh giá sản phẩm cần được admin duyệt trước khi hiển thị công khai
9. **Coupon Validation:** Validate mã giảm giá trước khi áp dụng (kiểm tra thời hạn, số lần sử dụng, giá trị đơn hàng tối thiểu)
10. **Order Status History:** Mọi thay đổi trạng thái đơn hàng đều được ghi lại với timestamp và người thay đổi

