package iuh.fit.se.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Utility class để quản lý HTTP-only cookies cho JWT tokens
@Component
public class CookieUtil {
  @Value("${jwt.cookie-domain:}")
  private String cookieDomain;

  @Value("${jwt.cookie-secure:true}")
  private boolean cookieSecure;

  @Value("${jwt.cookie-same-site:Strict}")
  private String cookieSameSite;

  // Tạo cookie cho refresh token
  public void createRefreshTokenCookie(HttpServletResponse response, String token, int maxAge) {
    Cookie cookie = new Cookie("refreshToken", token);
    cookie.setHttpOnly(true);
    cookie.setSecure(cookieSecure);
    cookie.setPath("/");
    cookie.setMaxAge(maxAge);
    if (cookieDomain != null && !cookieDomain.isEmpty()) {
      cookie.setDomain(cookieDomain);
    }
    response.addCookie(cookie);
  }

  // Xóa refresh token cookie
  public void deleteRefreshTokenCookie(HttpServletResponse response) {
    Cookie cookie = new Cookie("refreshToken", null);
    cookie.setHttpOnly(true);
    cookie.setSecure(cookieSecure);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    if (cookieDomain != null && !cookieDomain.isEmpty()) {
      cookie.setDomain(cookieDomain);
    }
    response.addCookie(cookie);
  }

  // Lấy refresh token từ cookie
  public String getRefreshTokenFromCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("refreshToken".equals(cookie.getName())) {
          return cookie.getValue();
        }
      }
    }
    return null;
  }
}
