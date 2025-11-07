# JWT Authentication Flow

## 1. Tổng Quan

Hệ thống sử dụng JWT (JSON Web Token) với cơ chế 2 tokens:
- **AccessToken:** Ngắn hạn (15 phút) - Dùng để xác thực API requests
- **RefreshToken:** Dài hạn (7 ngày) - Dùng để refresh accessToken

Cả 2 tokens được lưu trong **HTTP-only cookies** để tăng cường bảo mật.

## 2. Authentication Flow

### 2.1. Đăng Ký (Registration)

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Client  │                    │   API    │                    │  Email  │
└────┬────┘                    └────┬─────┘                    └────┬─────┘
     │                              │                              │
     │ POST /api/auth/register      │                              │
     │ {email, password, ...}      │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ 1. Hash password (BCrypt)    │
     │                              │ 2. Save user                 │
     │                              │ 3. Generate verification token│
     │                              │                              │
     │                              │ Send verification email       │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │ 201 Created                  │                              │
     │ {success, data, message}     │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │                              │ User receives email          │
     │                              │<─────────────────────────────│
```

**Quy trình:**
1. Client gửi thông tin đăng ký
2. Server hash password bằng BCrypt
3. Lưu user với `emailVerified = false`
4. Tạo email verification token (JWT hoặc UUID)
5. Gửi email chứa link xác thực
6. Trả về response thành công

### 2.2. Xác Thực Email (Email Verification)

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Client  │                    │   API    │                    │  Email  │
└────┬────┘                    └────┬─────┘                    └────┬─────┘
     │                              │                              │
     │ Click link in email          │                              │
     │ GET /api/auth/verify-email?   │                              │
     │     token={verificationToken} │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │ 1. Validate token           │
     │                              │ 2. Check expiration          │
     │                              │ 3. Set emailVerified = true  │
     │                              │                              │
     │ 200 OK                       │                              │
     │ {success, message}           │                              │
     │<─────────────────────────────│                              │
```

**Quy trình:**
1. User click link trong email
2. Server validate token
3. Kiểm tra token chưa hết hạn
4. Set `emailVerified = true`
5. Xóa verification token

### 2.3. Đăng Nhập (Login)

```
┌─────────┐                    ┌──────────┐
│ Client  │                    │   API    │
└────┬────┘                    └────┬─────┘
     │                              │
     │ POST /api/auth/login          │
     │ {email, password}            │
     ├─────────────────────────────>│
     │                              │
     │                              │ 1. Find user by email
     │                              │ 2. Verify password (BCrypt)
     │                              │ 3. Check emailVerified = true
     │                              │ 4. Create accessToken (15 min)
     │                              │ 5. Create refreshToken (7 days)
     │                              │ 6. Save refreshToken to database
     │                              │ 7. Set HTTP-only cookies
     │                              │
     │ 200 OK                       │
     │ Set-Cookie: accessToken=...  │
     │ Set-Cookie: refreshToken=... │
     │ {success, data: {user}}      │
     │<─────────────────────────────│
```

**Quy trình:**
1. Client gửi email và password
2. Server verify password bằng BCrypt
3. Kiểm tra `emailVerified = true`
4. Tạo accessToken (15 phút) và refreshToken (7 ngày)
5. Set cookies với flags: HttpOnly, Secure, SameSite=Strict
6. Trả về thông tin user (KHÔNG trả về tokens trong body)

### 2.4. API Request với AccessToken

```
┌─────────┐                    ┌──────────┐
│ Client  │                    │   API    │
└────┬────┘                    └────┬─────┘
     │                              │
     │ GET /api/profile              │
     │ Cookie: accessToken=...      │
     ├─────────────────────────────>│
     │                              │
     │                              │ 1. Extract token from cookie
     │                              │ 2. Validate token
     │                              │ 3. Extract user info
     │                              │ 4. Authorize request
     │                              │
     │ 200 OK                       │
     │ {success, data: {...}}       │
     │<─────────────────────────────│
```

**Quy trình:**
1. Client tự động gửi accessToken từ cookie
2. Server extract token từ cookie
3. Validate token (signature, expiration)
4. Extract user info từ token
5. Authorize request dựa trên role
6. Trả về response

### 2.5. Refresh Token Flow

```
┌─────────┐                    ┌──────────┐
│ Client  │                    │   API    │
└────┬────┘                    └────┬─────┘
     │                              │
     │ GET /api/profile              │
     │ Cookie: accessToken=...      │
     ├─────────────────────────────>│
     │                              │
     │                              │ AccessToken expired
     │                              │
     │ 401 Unauthorized             │
     │<─────────────────────────────│
     │                              │
     │ POST /api/auth/refresh        │
     │ Cookie: refreshToken=...    │
     ├─────────────────────────────>│
     │                              │
     │                              │ 1. Find refreshToken in database
     │                              │ 2. Validate token exists
     │                              │ 3. Check token not expired
     │                              │ 4. Extract userId from token
     │                              │ 5. Create new accessToken
     │                              │ 6. Set new cookie
     │                              │
     │ 200 OK                       │
     │ Set-Cookie: accessToken=...  │
     │ {success, message}           │
     │<─────────────────────────────│
     │                              │
     │ Retry original request       │
     │ GET /api/profile              │
     │ Cookie: accessToken=...      │
     ├─────────────────────────────>│
     │                              │
     │ 200 OK                       │
     │<─────────────────────────────│
```

**Quy trình:**
1. Client gửi request với accessToken đã hết hạn
2. Server trả về 401 Unauthorized
3. Client tự động gọi `/api/auth/refresh` với refreshToken
4. Server validate refreshToken và tạo accessToken mới
5. Set cookie mới
6. Client retry request ban đầu với accessToken mới

### 2.6. Đăng Xuất (Logout)

```
┌─────────┐                    ┌──────────┐
│ Client  │                    │   API    │
└────┬────┘                    └────┬─────┘
     │                              │
     │ POST /api/auth/logout         │
     │ Cookie: accessToken=...      │
     │ Cookie: refreshToken=...    │
     ├─────────────────────────────>│
     │                              │
     │                              │ 1. Validate accessToken
     │                              │ 2. Delete refreshToken from database
     │                              │ 3. Delete cookies
     │                              │
     │ 200 OK                       │
     │ Set-Cookie: accessToken=;    │
     │            Max-Age=0         │
     │ Set-Cookie: refreshToken=;   │
     │            Max-Age=0         │
     │ {success, message}           │
     │<─────────────────────────────│
```

**Quy trình:**
1. Client gửi logout request
2. Server validate token
3. Xóa cả 2 cookies (set Max-Age=0)
4. Trả về response thành công

## 3. Security Best Practices

### 3.1. HTTP-Only Cookies

**Lợi ích:**
- Ngăn chặn XSS attacks (JavaScript không thể đọc cookie)
- Tokens không bị expose trong localStorage/sessionStorage
- Tự động gửi kèm mỗi request

**Cấu hình:**
```java
Cookie cookie = new Cookie("accessToken", token);
cookie.setHttpOnly(true);  // Ngăn JavaScript access
cookie.setSecure(true);    // Chỉ gửi qua HTTPS
cookie.setPath("/");
cookie.setMaxAge(15 * 60); // 15 phút
cookie.setAttribute("SameSite", "Strict"); // CSRF protection
```

### 3.2. Token Expiration

**AccessToken:**
- Thời gian ngắn (15 phút)
- Giảm thiểu damage nếu bị lộ
- Yêu cầu refresh thường xuyên

**RefreshToken:**
- Thời gian dài hơn (7 ngày)
- Được lưu trong database để có thể revoke
- Có thể rotate để tăng bảo mật
- Một user có thể có nhiều refresh tokens (đăng nhập từ nhiều thiết bị)

### 3.3. Password Security

**BCrypt:**
- Strength = 12 (recommended)
- Salt tự động
- Slow hashing để chống brute-force

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

### 3.4. Email Verification

**Token:**
- JWT hoặc UUID
- Expiration: 24 giờ
- One-time use (xóa sau khi verify)

**Security:**
- Token không thể đoán được
- Expiration ngắn
- Link chỉ dùng 1 lần

## 4. Error Handling

### 4.1. Authentication Errors

| Error Code | HTTP Status | Mô Tả |
|------------|-------------|-------|
| INVALID_CREDENTIALS | 401 | Email hoặc password sai |
| EMAIL_NOT_VERIFIED | 403 | Email chưa được xác thực |
| TOKEN_EXPIRED | 401 | AccessToken đã hết hạn |
| INVALID_REFRESH_TOKEN | 401 | RefreshToken không hợp lệ |
| REFRESH_TOKEN_EXPIRED | 401 | RefreshToken đã hết hạn |

### 4.2. Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản."
  }
}
```

## 5. Frontend Integration

### 5.1. Automatic Token Refresh

Frontend nên tự động handle token refresh:

```javascript
// Interceptor để tự động refresh token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // AccessToken expired, try refresh
      try {
        await axios.post('/api/auth/refresh');
        // Retry original request
        return axios.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 5.2. Cookie Handling

- Cookies được tự động gửi với mỗi request
- Không cần manually set Authorization header
- Browser tự động quản lý cookies

## 6. Database Schema

### 6.1. User Table

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- BCrypt hash
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    -- ... other fields
);
```

### 6.2. Refresh Token Storage

**Bảng refresh_tokens:**

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE UNIQUE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

**Lợi ích:**
- Có thể revoke refresh tokens khi cần
- Theo dõi các thiết bị đang đăng nhập
- Có thể logout tất cả thiết bị
- Cleanup expired tokens dễ dàng

## 7. Testing

### 7.1. Unit Tests

```java
@Test
void testPasswordEncoding() {
    PasswordEncoder encoder = new BCryptPasswordEncoder(12);
    String rawPassword = "password123";
    String encoded = encoder.encode(rawPassword);

    assertTrue(encoder.matches(rawPassword, encoded));
}

@Test
void testJwtTokenCreation() {
    UserDetails userDetails = UserPrincipal.create(user);
    String token = jwtTokenProvider.createAccessToken(userDetails);

    assertNotNull(token);
    assertTrue(jwtTokenProvider.validateToken(token));
}
```

### 7.2. Integration Tests

```java
@Test
void testLoginFlow() throws Exception {
    // Register
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(registerRequestJson))
        .andExpect(status().isCreated());

    // Verify email
    mockMvc.perform(get("/api/auth/verify-email")
        .param("token", verificationToken))
        .andExpect(status().isOk());

    // Login
    MvcResult result = mockMvc.perform(post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(loginRequestJson))
        .andExpect(status().isOk())
        .andExpect(cookie().exists("accessToken"))
        .andExpect(cookie().exists("refreshToken"))
        .andReturn();
}
```

