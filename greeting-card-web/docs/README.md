# Tài Liệu Dự Án - Greeting Card Web

## Tổng Quan

Đây là thư mục chứa tất cả các tài liệu chi tiết về dự án **Website giới thiệu, bán thiệp trực tuyến** - Frontend Web Application.

## Danh Sách Tài Liệu

### 1. [Tổng Quan Dự Án](./01-project-overview.md)

- Giới thiệu dự án
- Mục tiêu và ràng buộc
- Kiến trúc tổng quan
- Cấu trúc dự án
- Tiêu chí đánh giá (CLO)

### 2. [Vai Trò Người Dùng và Phân Quyền](./02-user-roles.md)

- Chi tiết các vai trò: Guest, Customer, Admin
- Chức năng của từng vai trò trên frontend
- Route protection và component access
- Bảng tóm tắt phân quyền
- Lưu ý bảo mật

### 3. [Kiến Trúc Frontend](./03-frontend-architecture.md)

- Kiến trúc tổng quan (Next.js App Router)
- Cấu trúc thư mục và tổ chức code
- Component architecture
- State management (Redux Toolkit)
- Routing và navigation
- UI/UX patterns

### 4. [Tích Hợp API](./04-api-integration.md)

- Tổng quan về API client
- Cấu trúc service layer
- Error handling
- Request/Response interceptors
- Token management
- Refresh token mechanism

### 5. [Kiến Trúc Kỹ Thuật](./05-technical-architecture.md)

- Kiến trúc phân lớp (Frontend Architecture)
- Các thành phần chính
- **Next.js 16** chi tiết (App Router)
- React Ecosystem components
- Design Patterns
- State Management
- Form Handling
- Error Handling
- Testing Strategy

### 6. [Hướng Dẫn Triển Khai](./06-implementation-guide.md)

- Yêu cầu hệ thống
- Cài đặt môi trường
- Cấu trúc thư mục
- **Các bước triển khai chi tiết với Next.js:**
  - Tạo Pages với App Router
  - Tạo Components với TypeScript
  - Tạo Services cho API calls
  - Cấu hình State Management (Redux)
  - Cấu hình Authentication
  - Form Validation với React Hook Form + Zod
- Validation Rules
- Testing
- Checklist triển khai
- Troubleshooting

### 7. [Next.js Best Practices](./07-nextjs-best-practices.md)

- App Router Patterns
- Component Design
- Server Components vs Client Components
- Data Fetching Strategies
- Performance Optimization
- SEO Best Practices
- Code Organization
- Error Handling
- Testing với Next.js
- Common Pitfalls và Solutions
- Checklist Code Review

### 8. [Authentication Flow](./08-authentication-flow.md)

- Tổng quan Authentication với JWT
- Authentication Flow chi tiết:
  - Đăng ký và xác thực email
  - Đăng nhập với JWT
  - Refresh token mechanism
  - Đăng xuất
- Token storage (localStorage + cookies)
- Protected Routes
- Route Guards
- Security best practices
- Frontend integration patterns
- Testing strategies

## Công Nghệ Sử Dụng

- **Framework:** Next.js 16.0.7 (App Router)
- **UI Library:** React 19.2.1
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit 2.11.0
- **Form Handling:** React Hook Form 7.68.0 + Zod 4.1.13
- **HTTP Client:** Axios 1.13.2
- **UI Components:** Radix UI + shadcn/ui
- **Icons:** Lucide React
- **Date Handling:** date-fns 4.1.0
- **Charts:** Recharts 3.5.1
- **Notifications:** Sonner 2.0.7

## Cấu Trúc Dự Án

```
greeting-card-web/
├── docs/                          # Tài liệu dự án
│   ├── 01-project-overview.md
│   ├── 02-user-roles.md
│   ├── 03-frontend-architecture.md
│   ├── 04-api-integration.md
│   ├── 05-technical-architecture.md
│   ├── 06-implementation-guide.md
│   ├── 07-nextjs-best-practices.md
│   ├── 08-authentication-flow.md
│   └── README.md                  # File này
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── auth/                      # Authentication pages
│   ├── admin/                     # Admin pages
│   ├── products/                  # Product pages
│   ├── cart/                      # Cart page
│   ├── checkout/                  # Checkout pages
│   └── ...
├── components/                    # React Components
│   ├── ui/                        # shadcn/ui components
│   ├── auth/                      # Auth components
│   ├── admin/                     # Admin components
│   ├── product/                   # Product components
│   └── ...
├── services/                      # API Service Layer
│   ├── client.ts                  # Axios instance
│   ├── auth.service.ts
│   ├── product.service.ts
│   └── ...
├── lib/                           # Utilities & Config
│   ├── store/                     # Redux store
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
└── public/                        # Static assets
```

## Quy Trình Đọc Tài Liệu

Để hiểu rõ dự án, nên đọc theo thứ tự:

1. **Bắt đầu:** [01-project-overview.md](./01-project-overview.md) - Hiểu tổng quan về dự án
2. **Yêu cầu:** [02-user-roles.md](./02-user-roles.md) - Hiểu các vai trò và chức năng
3. **Kiến trúc:** [03-frontend-architecture.md](./03-frontend-architecture.md) - Hiểu cấu trúc frontend
4. **API:** [04-api-integration.md](./04-api-integration.md) - Hiểu cách tích hợp API
5. **Kiến trúc kỹ thuật:** [05-technical-architecture.md](./05-technical-architecture.md) - Hiểu kiến trúc kỹ thuật
6. **Triển khai:** [06-implementation-guide.md](./06-implementation-guide.md) - Hướng dẫn code
7. **Best Practices:** [07-nextjs-best-practices.md](./07-nextjs-best-practices.md) - Best practices cho Next.js
8. **Authentication:** [08-authentication-flow.md](./08-authentication-flow.md) - Chi tiết về authentication flow

## Lưu Ý Quan Trọng

- Dự án sử dụng **Next.js 16 App Router** cho routing và rendering
- Tất cả components sử dụng **TypeScript** với strict mode
- State management sử dụng **Redux Toolkit** cho global state
- Form validation sử dụng **React Hook Form** + **Zod**
- API client sử dụng **Axios** với interceptors cho token management
- **Authentication:** JWT với accessToken (lưu trong localStorage) và refreshToken (HTTP-only cookie)
- **Token Refresh:** Tự động refresh accessToken khi hết hạn
- **Protected Routes:** Sử dụng route guards và middleware
- **UI Components:** Sử dụng Radix UI + shadcn/ui cho accessibility và customization
- **Styling:** Tailwind CSS với utility-first approach
- **Performance:** Server Components, code splitting, lazy loading
- **SEO:** Metadata API, sitemap, robots.txt

## Liên Hệ

Nếu có thắc mắc về tài liệu, vui lòng liên hệ team phát triển.
