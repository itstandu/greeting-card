package iuh.fit.se.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
    ResponseCookie.ResponseCookieBuilder cookieBuilder =
        ResponseCookie.from("refreshToken", token)
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .maxAge(maxAge);

    // Set domain nếu có
    if (cookieDomain != null && !cookieDomain.isEmpty()) {
      cookieBuilder.domain(cookieDomain);
    }

    // Set SameSite attribute
    if (cookieSameSite != null && !cookieSameSite.isEmpty()) {
      String sameSiteValue = normalizeSameSite(cookieSameSite);
      cookieBuilder.sameSite(sameSiteValue);
    }

    ResponseCookie cookie = cookieBuilder.build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
  }

  // Xóa refresh token cookie
  public void deleteRefreshTokenCookie(HttpServletResponse response) {
    ResponseCookie.ResponseCookieBuilder cookieBuilder =
        ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .maxAge(0);

    // Set domain nếu có
    if (cookieDomain != null && !cookieDomain.isEmpty()) {
      cookieBuilder.domain(cookieDomain);
    }

    // Set SameSite attribute
    if (cookieSameSite != null && !cookieSameSite.isEmpty()) {
      String sameSiteValue = normalizeSameSite(cookieSameSite);
      cookieBuilder.sameSite(sameSiteValue);
    }

    ResponseCookie cookie = cookieBuilder.build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
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

  // Normalize SameSite string to valid value
  private String normalizeSameSite(String sameSite) {
    if (sameSite == null || sameSite.isEmpty()) {
      return "Strict";
    }

    String normalized = sameSite.trim();
    return switch (normalized.toUpperCase()) {
      case "NONE" -> "None";
      case "LAX" -> "Lax";
      case "STRICT" -> "Strict";
      default -> "Strict";
    };
  }
}
