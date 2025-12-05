# Vai Trò Người Dùng và Phân Quyền

## 1. Tổng Quan

Hệ thống hỗ trợ 3 loại người dùng với các quyền hạn khác nhau trên frontend:

1. **Guest** - Người dùng không có tài khoản
2. **Customer** - Người dùng có tài khoản
3. **Admin** - Người quản trị hệ thống

## 2. Guest (Người Dùng Không Có Tài Khoản)

### 2.1. Chức Năng Có Thể Thực Hiện

#### Xem Danh Sách Sản Phẩm
- Truy cập trang `/products`
- Xem danh sách tất cả thiệp chúc mừng
- Lọc theo loại sản phẩm
- Tìm kiếm theo tên
- Phân trang

#### Xem Chi Tiết Sản Phẩm
- Truy cập trang `/product/[slug]`
- Xem thông tin chi tiết: tên, mô tả, giá, hình ảnh, loại sản phẩm, số lượng tồn kho
- Xem đánh giá và xếp hạng (chỉ đánh giá đã được duyệt)
- Xem điểm đánh giá trung bình và số lượng đánh giá

#### Chọn Mua Sản Phẩm
- Thêm sản phẩm vào giỏ hàng từ:
  - Trang danh sách sản phẩm
  - Trang chi tiết sản phẩm
- Sản phẩm được lưu trong **localStorage** (chưa sync với server)

#### Xem Giỏ Hàng
- Truy cập trang `/cart`
- Xem danh sách các sản phẩm đã chọn mua
- Hiển thị: tên sản phẩm, số lượng, giá, tổng tiền
- Giỏ hàng lưu trong localStorage

#### Chỉnh Sửa Giỏ Hàng
- Cập nhật số lượng sản phẩm trong giỏ hàng
- Nếu số lượng = 0 → xóa sản phẩm khỏi giỏ hàng
- Tính toán lại tổng tiền tự động
- Thay đổi được lưu trong localStorage

#### Xem Mã Giảm Giá
- Xem danh sách các mã giảm giá có sẵn
- Xem thông tin chi tiết về mã giảm giá (loại giảm giá, giá trị, điều kiện)
- Validate mã giảm giá (chỉ xem, chưa áp dụng)

#### Đăng Ký Tài Khoản
- Truy cập trang `/auth/register`
- Điền form đăng ký:
  - Email (không trùng với tài khoản khác)
  - Mật khẩu (tối thiểu 6 ký tự)
  - Họ và tên
  - Số điện thoại
  - Địa chỉ
- Sau khi đăng ký thành công:
  - Hiển thị thông báo thành công
  - Chuyển đến trang `/auth/verify-email`
  - Yêu cầu xác thực email
- **Lưu ý:** Người dùng phải xác thực email trước khi có thể đăng nhập

#### Xác Thực Email
- Truy cập trang `/auth/verify-email` với token từ email
- Hoặc truy cập `/auth/resend-verification` để gửi lại email xác thực

### 2.2. Routes Có Thể Truy Cập

```
/                           # Trang chủ
/products                   # Danh sách sản phẩm
/product/[slug]             # Chi tiết sản phẩm
/categories                  # Danh sách loại sản phẩm
/categories/[slug]          # Sản phẩm theo loại
/cart                       # Giỏ hàng
/auth/register              # Đăng ký
/auth/verify-email          # Xác thực email
/auth/resend-verification   # Gửi lại email xác thực
/about                      # Giới thiệu
/contact                    # Liên hệ
/help                       # Trợ giúp
/privacy                    # Chính sách bảo mật
/terms                      # Điều khoản
```

### 2.3. Protected Routes (Không Truy Cập Được)

- `/auth/login` - Redirect đến trang chủ nếu đã đăng nhập
- `/checkout` - Yêu cầu đăng nhập
- `/orders` - Yêu cầu đăng nhập
- `/profile` - Yêu cầu đăng nhập
- `/wishlist` - Yêu cầu đăng nhập
- `/admin/**` - Yêu cầu role ADMIN

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
- Truy cập trang `/auth/login`
- Điền email và mật khẩu
- **Điều kiện:** Email phải đã được xác thực
- Sau khi đăng nhập thành công:
  - Lưu accessToken vào localStorage
  - Lưu refreshToken vào HTTP-only cookie (tự động)
  - Sync giỏ hàng từ localStorage lên server
  - Chuyển đến trang chủ hoặc trang trước đó
  - Hiển thị thông tin người dùng trong header

#### Đăng Xuất
- Click nút "Đăng xuất" trong header
- Xóa accessToken khỏi localStorage
- Xóa refreshToken cookie
- Clear Redux state
- Chuyển đến trang chủ

#### Xử Lý Thanh Toán
- Truy cập trang `/checkout`
- **Điều kiện:**
  - Giỏ hàng đã có sản phẩm
  - Người dùng đã đăng nhập thành công
- **Quy trình:**
  1. Chọn địa chỉ giao hàng (hoặc thêm địa chỉ mới)
  2. Chọn phương thức thanh toán
  3. Nhập mã giảm giá (nếu có)
  4. Xem tổng tiền và số tiền được giảm
  5. Xác nhận thông tin đơn hàng
  6. Submit đơn hàng
  7. Chuyển đến trang `/checkout/payment` với thông tin đơn hàng
  8. Hiển thị thông báo thành công

#### Xem Lịch Sử Đơn Hàng
- Truy cập trang `/orders`
- Xem danh sách các đơn hàng đã đặt (chỉ của mình)
- Xem chi tiết từng đơn hàng:
  - Thông tin đơn hàng (order number, ngày đặt, trạng thái)
  - Danh sách sản phẩm
  - Địa chỉ giao hàng
  - Phương thức thanh toán
  - Mã giảm giá đã sử dụng
  - Tổng tiền, giảm giá, thành tiền
- Xem lịch sử thay đổi trạng thái đơn hàng

#### Quản Lý Thông Tin Cá Nhân
- Truy cập trang `/profile`
- Xem thông tin tài khoản
- Cập nhật thông tin cá nhân (trừ email)
- Đổi mật khẩu
- Xem số lượng đơn hàng, wishlist items

#### Đánh Giá Sản Phẩm
- Đánh giá và xếp hạng sản phẩm đã mua (rating 1-5 sao)
- Viết nhận xét chi tiết về sản phẩm
- Mỗi sản phẩm chỉ được đánh giá 1 lần
- Đánh giá sẽ được đánh dấu "Verified Purchase" nếu đã mua
- Đánh giá cần được admin duyệt trước khi hiển thị công khai
- Có thể cập nhật hoặc xóa đánh giá của mình

#### Quản Lý Wishlist
- Truy cập trang `/wishlist`
- Xem danh sách sản phẩm yêu thích
- Thêm sản phẩm vào wishlist (từ trang sản phẩm)
- Xóa sản phẩm khỏi wishlist
- Chuyển sản phẩm từ wishlist vào giỏ hàng

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
- Xem danh sách thông báo từ hệ thống (icon bell trong header)
- Lọc thông báo theo loại (ORDER, PRODUCT, SYSTEM)
- Lọc thông báo theo trạng thái đọc (đã đọc/chưa đọc)
- Đánh dấu thông báo đã đọc
- Đánh dấu tất cả thông báo đã đọc
- Xem số lượng thông báo chưa đọc (badge trên icon)

### 3.3. Routes Có Thể Truy Cập

```
# Tất cả routes của Guest +
/auth/login                 # Đăng nhập
/checkout                   # Thanh toán
/checkout/payment           # Trang thanh toán
/orders                     # Lịch sử đơn hàng
/profile                    # Thông tin cá nhân
/wishlist                   # Danh sách yêu thích
/notifications              # Thông báo
```

### 3.4. Protected Routes

- Tất cả routes của Customer đều yêu cầu authentication
- Sử dụng `ProtectedRoute` component hoặc middleware để kiểm tra
- Redirect đến `/auth/login` nếu chưa đăng nhập

## 4. Admin (Người Quản Trị Hệ Thống)

### 4.1. Chức Năng Kế Thừa Từ Customer

Admin có thể thực hiện tất cả các chức năng của Customer:
- Tất cả chức năng của Guest
- Đăng nhập, thanh toán, xem lịch sử đơn hàng
- Quản lý thông tin cá nhân
- Đánh giá sản phẩm, wishlist, địa chỉ

### 4.2. Chức Năng Quản Trị

#### Dashboard
- Truy cập trang `/admin`
- Xem tổng quan hệ thống:
  - Tổng số đơn hàng, doanh thu
  - Tổng số sản phẩm, loại sản phẩm
  - Tổng số người dùng
  - Biểu đồ thống kê
  - Đơn hàng mới nhất
  - Sản phẩm bán chạy

#### Quản Lý Sản Phẩm
- Truy cập trang `/admin/products`
- **Xem Danh Sách:**
  - Xem danh sách tất cả sản phẩm
  - Lọc, sắp xếp, phân trang
  - Tìm kiếm sản phẩm
- **Xem Chi Tiết:**
  - Xem chi tiết từng sản phẩm
- **Thêm Mới:**
  - Form thêm sản phẩm mới với đầy đủ thông tin
  - Upload nhiều hình ảnh
  - Chọn loại sản phẩm
  - Thêm tags
- **Cập Nhật:**
  - Cập nhật thông tin sản phẩm
  - Cập nhật hình ảnh
  - Cập nhật số lượng tồn kho
- **Xóa:**
  - Xóa sản phẩm (chỉ khi sản phẩm chưa có trong đơn hàng nào)

#### Quản Lý Loại Sản Phẩm
- Truy cập trang `/admin/categories`
- CRUD operations cho loại sản phẩm
- Quản lý hierarchy (parent-child categories)
- Upload hình ảnh cho loại sản phẩm

#### Quản Lý Tài Khoản Người Dùng
- Truy cập trang `/admin/users`
- Xem danh sách tất cả tài khoản người dùng
- Xem chi tiết từng tài khoản
- Cập nhật thông tin người dùng
- Xóa tài khoản (chỉ khi chưa có đơn hàng)

#### Quản Lý Đơn Hàng Trực Tuyến
- Truy cập trang `/admin/orders`
- Xem danh sách tất cả đơn hàng
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng
- Cập nhật số lượng sản phẩm trong đơn hàng
- Xem lịch sử thay đổi trạng thái đơn hàng

#### Quản Lý Đánh Giá Sản Phẩm
- Truy cập trang `/admin/reviews`
- Xem tất cả đánh giá của khách hàng
- Lọc theo trạng thái duyệt (đã duyệt/chưa duyệt)
- Lọc theo sản phẩm
- Duyệt đánh giá để hiển thị công khai
- Từ chối đánh giá với lý do

#### Quản Lý Mã Giảm Giá
- Truy cập trang `/admin/coupons`
- Xem danh sách tất cả mã giảm giá
- Tạo mã giảm giá mới
- Cập nhật thông tin mã giảm giá
- Kích hoạt/vô hiệu hóa mã giảm giá
- Xóa mã giảm giá

#### Quản Lý Phương Thức Thanh Toán
- Truy cập trang `/admin/payment-methods`
- Xem danh sách phương thức thanh toán
- Thêm phương thức thanh toán mới
- Cập nhật thông tin phương thức thanh toán
- Kích hoạt/vô hiệu hóa phương thức thanh toán
- Sắp xếp thứ tự hiển thị

#### Quản Lý Giỏ Hàng
- Truy cập trang `/admin/carts`
- Xem danh sách giỏ hàng của tất cả người dùng
- Xem chi tiết giỏ hàng

#### Quản Lý Wishlist
- Truy cập trang `/admin/wishlists`
- Xem danh sách wishlist của tất cả người dùng

#### Quản Lý Liên Hệ
- Truy cập trang `/admin/contacts`
- Xem danh sách liên hệ từ khách hàng
- Xem chi tiết liên hệ
- Đánh dấu đã xử lý

#### Quản Lý Thông Báo
- Truy cập trang `/admin/notifications`
- Xem danh sách tất cả thông báo
- Tạo thông báo mới
- Gửi thông báo cho người dùng cụ thể hoặc tất cả

#### Quản Lý Stock Transactions
- Truy cập trang `/admin/stock-transactions`
- Xem lịch sử thay đổi tồn kho
- Thêm/xóa tồn kho thủ công

### 4.3. Routes Có Thể Truy Cập

```
# Tất cả routes của Customer +
/admin                      # Dashboard
/admin/products             # Quản lý sản phẩm
/admin/categories           # Quản lý loại sản phẩm
/admin/users                # Quản lý người dùng
/admin/orders               # Quản lý đơn hàng
/admin/reviews              # Quản lý đánh giá
/admin/coupons              # Quản lý mã giảm giá
/admin/payment-methods      # Quản lý phương thức thanh toán
/admin/carts                # Quản lý giỏ hàng
/admin/wishlists            # Quản lý wishlist
/admin/contacts             # Quản lý liên hệ
/admin/notifications         # Quản lý thông báo
/admin/stock-transactions    # Quản lý tồn kho
```

### 4.4. Protected Routes

- Tất cả routes `/admin/**` đều yêu cầu:
  - Authentication (đã đăng nhập)
  - Authorization (role = ADMIN)
- Sử dụng `AdminRoute` component hoặc middleware để kiểm tra
- Redirect đến `/auth/login` nếu chưa đăng nhập
- Redirect đến `/` nếu không có quyền ADMIN

## 5. Bảng Tóm Tắt Phân Quyền

| Chức Năng | Guest | Customer | Admin |
|-----------|-------|----------|-------|
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Xem chi tiết sản phẩm | ✅ | ✅ | ✅ |
| Xem đánh giá sản phẩm | ✅ | ✅ | ✅ |
| Xem mã giảm giá | ✅ | ✅ | ✅ |
| Thêm vào giỏ hàng | ✅ (localStorage) | ✅ (sync server) | ✅ (sync server) |
| Xem/chỉnh sửa giỏ hàng | ✅ (localStorage) | ✅ (sync server) | ✅ (sync server) |
| Đăng ký tài khoản | ✅ | ❌ | ❌ |
| Đăng nhập | ❌ | ✅ | ✅ |
| Thanh toán/Đặt hàng | ❌ | ✅ | ✅ |
| Xem lịch sử đơn hàng | ❌ | ✅ (của mình) | ✅ (tất cả) |
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
| Dashboard quản trị | ❌ | ❌ | ✅ |

## 6. Route Protection Implementation

### 6.1. ProtectedRoute Component

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 6.2. AdminRoute Component

```typescript
// components/auth/AdminRoute.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
```

### 6.3. GuestRoute Component

```typescript
// components/auth/GuestRoute.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

## 7. Lưu Ý Bảo Mật

1. **Token Storage:**
   - accessToken lưu trong localStorage (có thể truy cập từ JavaScript)
   - refreshToken lưu trong HTTP-only cookie (không thể truy cập từ JavaScript)

2. **Route Protection:**
   - Luôn kiểm tra authentication và authorization ở cả client và server
   - Client-side protection chỉ để UX, không đảm bảo bảo mật
   - Server-side validation là bắt buộc

3. **Role-based Access Control:**
   - Kiểm tra role trước khi cho phép truy cập các chức năng admin
   - Sử dụng middleware hoặc route guards

4. **Cart Sync:**
   - Guest: lưu trong localStorage
   - Authenticated: sync với server sau khi login

5. **XSS Protection:**
   - React tự động escape HTML
   - Không sử dụng `dangerouslySetInnerHTML` trừ khi cần thiết

6. **CSRF Protection:**
   - Sử dụng SameSite cookies
   - Token-based authentication

7. **Input Validation:**
   - Validate ở cả client (React Hook Form + Zod) và server
   - Sanitize user input

8. **Error Handling:**
   - Không hiển thị thông tin nhạy cảm trong error messages
   - Log errors để debug nhưng không expose cho user

