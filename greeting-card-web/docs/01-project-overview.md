# Tổng Quan Dự Án

## 1. Giới Thiệu

**Tên dự án:** Website giới thiệu, bán thiệp trực tuyến (Greeting Card E-Commerce Platform)

**Mô tả:** Dự án xây dựng hệ thống Frontend Web Application cho website bán thiệp chúc mừng trực tuyến, cho phép người dùng xem, chọn mua và đặt hàng thiệp chúc mừng qua mạng Internet.

**Công nghệ:** Next.js 16, React 19, TypeScript, Tailwind CSS, Redux Toolkit, RESTful API

## 2. Mục Tiêu Dự Án

### 2.1. Mục Tiêu Chức Năng

- Xây dựng giao diện người dùng đầy đủ cho website bán thiệp trực tuyến
- Quản lý hiển thị thông tin sản phẩm (thiệp chúc mừng), loại sản phẩm
- Quản lý người dùng và phân quyền (Guest, Customer, Admin)
- Xử lý giỏ hàng và đơn hàng
- Tích hợp với RESTful API backend
- Responsive design cho mobile và desktop

### 2.2. Mục Tiêu Kỹ Thuật

- Xây dựng Single Page Application (SPA) với Next.js App Router
- Sử dụng React Ecosystem (React, Next.js, Redux Toolkit)
- TypeScript cho type safety
- Modern UI/UX với Tailwind CSS và Radix UI
- Tối ưu performance và SEO
- Responsive design

## 3. Ràng Buộc Dự Án

### 3.1. Ràng Buộc Kỹ Thuật

- **Framework:** Next.js 16.0.7 (App Router)
- **UI Library:** React 19.2.1
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit 2.11.0
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Axios
- **API Style:** RESTful API (tích hợp với backend Spring Boot)

### 3.2. Ràng Buộc Chức Năng

- **Validation:** Kiểm tra dữ liệu phía Client (React Hook Form + Zod)
- **Authentication:** JWT với accessToken và refreshToken
- **Cart:** Giỏ hàng lưu trong localStorage (guest) và sync với server (authenticated)
- **Responsive:** Hỗ trợ mobile, tablet, desktop
- **SEO:** Metadata, sitemap, robots.txt

### 3.3. Ràng Buộc Bảo Mật

- Token không được hiển thị trong console hoặc UI
- Protected routes yêu cầu authentication
- Admin routes yêu cầu role ADMIN
- XSS protection với React's built-in escaping
- CSRF protection với SameSite cookies

## 4. Kiến Trúc Hệ Thống

### 4.1. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (Next.js Web App)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Pages (App Router)                        │  │
│  │  - Home, Products, Categories                     │  │
│  │  - Auth (Login, Register)                           │  │
│  │  - Cart, Checkout                                  │  │
│  │  - Admin Dashboard                                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Components (React)                         │  │
│  │  - UI Components (shadcn/ui)                      │  │
│  │  - Feature Components                              │  │
│  │  - Layout Components                               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         State Management (Redux Toolkit)          │  │
│  │  - Auth State                                      │  │
│  │  - Cart State                                      │  │
│  │  - UI State                                        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Services (API Layer)                       │  │
│  │  - Axios Client                                    │  │
│  │  - Auth Service                                    │  │
│  │  - Product Service                                 │  │
│  │  - Order Service                                   │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
                        │
┌───────────────────────▼─────────────────────────────────┐
│   RESTful API (Spring Boot Backend)                    │
│   ┌──────────────────────────────────────────────────┐ │
│   │ Controllers (REST)                                │ │
│   │ Services (Business Logic)                        │ │
│   │ Repositories (Data Access)                        │ │
│   └──────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ JDBC
                        │
┌───────────────────────▼─────────────────────────────────┐
│   PostgreSQL Database                                  │
└─────────────────────────────────────────────────────────┘
```

### 4.2. Các Thành Phần Chính

1. **Pages (App Router):** Routes và page components
2. **Components:** Reusable UI components
3. **Services:** API integration layer
4. **State Management:** Redux Toolkit store
5. **Hooks:** Custom React hooks
6. **Types:** TypeScript type definitions
7. **Utils:** Utility functions
8. **Styles:** Tailwind CSS configuration

## 5. Cấu Trúc Dự Án

```
greeting-card-web/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── auth/                      # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── resend-verification/
│   ├── admin/                     # Admin pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── orders/
│   │   └── ...
│   ├── products/                  # Product pages
│   ├── categories/                # Category pages
│   ├── cart/                      # Cart page
│   ├── checkout/                  # Checkout pages
│   ├── orders/                    # Order history
│   └── ...
├── components/                    # React Components
│   ├── ui/                        # shadcn/ui components
│   ├── auth/                      # Auth components
│   ├── admin/                     # Admin components
│   ├── product/                   # Product components
│   ├── cart/                      # Cart components
│   └── ...
├── services/                      # API Service Layer
│   ├── client.ts                  # Axios instance
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── ...
├── lib/                           # Utilities & Config
│   ├── store/                     # Redux store
│   │   ├── Provider.tsx
│   │   ├── hooks.ts
│   │   └── slices/
│   ├── utils/                     # Utility functions
│   └── constants/                 # Constants
├── hooks/                         # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   └── ...
├── types/                         # TypeScript Types
│   ├── api.ts
│   ├── auth.ts
│   ├── product.ts
│   └── ...
├── public/                        # Static assets
│   └── images/
├── next.config.ts                 # Next.js config
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
└── package.json
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

### CLO 4: Frontend Development

- Sử dụng React/Next.js để xây dựng UI
- Responsive design
- Component-based architecture

### CLO 5: Modern Web Technologies

- Trình bày các công nghệ trong phát triển ứng dụng Web
- Trình bày kiến trúc và cấu hình môi trường Next.js

### CLO 6: API Integration

- Tích hợp với RESTful Web Services
- Xử lý authentication và authorization
- Error handling và loading states

## 7. Tính Năng Chính

### 7.1. Public Features (Guest)

- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Tìm kiếm và lọc sản phẩm
- Thêm vào giỏ hàng (localStorage)
- Xem giỏ hàng
- Đăng ký tài khoản
- Xác thực email

### 7.2. Customer Features

- Tất cả features của Guest
- Đăng nhập/Đăng xuất
- Quản lý giỏ hàng (sync với server)
- Thanh toán và đặt hàng
- Xem lịch sử đơn hàng
- Quản lý địa chỉ giao hàng
- Quản lý wishlist
- Đánh giá sản phẩm
- Xem thông báo

### 7.3. Admin Features

- Tất cả features của Customer
- Dashboard quản trị
- Quản lý sản phẩm (CRUD)
- Quản lý loại sản phẩm (CRUD)
- Quản lý đơn hàng
- Quản lý người dùng
- Quản lý mã giảm giá
- Quản lý đánh giá
- Thống kê và báo cáo

## 8. Công Nghệ Stack

### 8.1. Core

- **Next.js 16.0.7:** React framework với App Router
- **React 19.2.1:** UI library
- **TypeScript 5:** Type safety

### 8.2. Styling

- **Tailwind CSS 4:** Utility-first CSS framework
- **Radix UI:** Accessible component primitives
- **shadcn/ui:** Pre-built component library

### 8.3. State Management

- **Redux Toolkit 2.11.0:** State management
- **React Redux 9.2.0:** React bindings

### 8.4. Forms & Validation

- **React Hook Form 7.68.0:** Form handling
- **Zod 4.1.13:** Schema validation
- **@hookform/resolvers 5.2.2:** Form validation resolvers

### 8.5. HTTP Client

- **Axios 1.13.2:** HTTP client với interceptors

### 8.6. UI Components

- **Lucide React:** Icon library
- **Sonner:** Toast notifications
- **Recharts:** Chart library
- **date-fns:** Date utilities

### 8.7. Development Tools

- **ESLint:** Code linting
- **Prettier:** Code formatting
- **TypeScript:** Type checking
- **Husky:** Git hooks
