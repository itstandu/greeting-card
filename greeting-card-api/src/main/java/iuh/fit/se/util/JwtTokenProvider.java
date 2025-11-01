package iuh.fit.se.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// JWT Token Provider - Tạo và validate JWT tokens
@Component
public class JwtTokenProvider {
  @Value("${jwt.secret:your-secret-key-change-this-in-production-min-256-bits}")
  private String secretKey;

  @Value("${jwt.access-token-validity:900000}") // 15 minutes default
  private long accessTokenValidityInMilliseconds;

  @Value("${jwt.refresh-token-validity:604800000}") // 7 days default
  private long refreshTokenValidityInMilliseconds;

  private SecretKey getSigningKey() {
    byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  // Tạo Access Token từ UserDetails
  public String createAccessToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("roles", userDetails.getAuthorities());
    return createToken(claims, userDetails.getUsername(), accessTokenValidityInMilliseconds);
  }

  // Tạo Access Token từ userId và email
  public String createAccessToken(Long userId, String email, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userId);
    claims.put("email", email);
    claims.put("role", role);
    return createToken(claims, email, accessTokenValidityInMilliseconds);
  }

  // Tạo Refresh Token
  public String createRefreshToken(Long userId) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userId);
    claims.put("type", "refresh");
    return createToken(claims, userId.toString(), refreshTokenValidityInMilliseconds);
  }

  // Tạo token với claims và expiration
  private String createToken(Map<String, Object> claims, String subject, long validity) {
    Date now = new Date();
    Date validityDate = new Date(now.getTime() + validity);

    return Jwts.builder()
        .claims(claims)
        .subject(subject)
        .issuedAt(now)
        .expiration(validityDate)
        .signWith(getSigningKey())
        .compact();
  }

  // Lấy username từ token
  public String getUsernameFromToken(String token) {
    return getClaimFromToken(token, Claims::getSubject);
  }

  // Lấy userId từ token
  public Long getUserIdFromToken(String token) {
    Claims claims = getAllClaimsFromToken(token);
    Object userId = claims.get("userId");
    if (userId instanceof Integer) {
      return ((Integer) userId).longValue();
    }
    return (Long) userId;
  }

  // Lấy expiration date từ token
  public Date getExpirationDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getExpiration);
  }

  // Lấy claim từ token
  public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = getAllClaimsFromToken(token);
    return claimsResolver.apply(claims);
  }

  // Lấy tất cả claims từ token
  private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }

  // Kiểm tra token đã hết hạn chưa
  private Boolean isTokenExpired(String token) {
    final Date expiration = getExpirationDateFromToken(token);
    return expiration.before(new Date());
  }

  // Validate token
  public Boolean validateToken(String token, UserDetails userDetails) {
    final String username = getUsernameFromToken(token);
    return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
  }

  // Validate token (không cần UserDetails)
  public Boolean validateToken(String token) {
    try {
      return !isTokenExpired(token);
    } catch (Exception e) {
      return false;
    }
  }

  // Lấy expiration time cho refresh token (milliseconds)
  public long getRefreshTokenValidityInMilliseconds() {
    return refreshTokenValidityInMilliseconds;
  }

  // Lấy expiration time cho access token (milliseconds)
  public long getAccessTokenValidityInMilliseconds() {
    return accessTokenValidityInMilliseconds;
  }
}
