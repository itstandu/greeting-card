package iuh.fit.se.service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// Service quản lý tokens trong Redis
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRedisService {

  private final RedisTemplate<String, Object> redisTemplate;

  @Value("${jwt.redis.access-token-blacklist-prefix:blacklist:access_token:}")
  private String accessTokenBlacklistPrefix;

  // ==================== Access Token Blacklist ====================

  // Thêm access token vào blacklist
  public void blacklistAccessToken(String token, Instant expiresAt) {
    String key = accessTokenBlacklistPrefix + token;
    long ttlSeconds = Duration.between(Instant.now(), expiresAt).getSeconds();
    if (ttlSeconds > 0) {
      redisTemplate.opsForValue().set(key, "blacklisted", ttlSeconds, TimeUnit.SECONDS);
      log.debug("Blacklisted access token with TTL {} seconds", ttlSeconds);
    }
  }

  // Kiểm tra access token có trong blacklist không
  public boolean isAccessTokenBlacklisted(String token) {
    String key = accessTokenBlacklistPrefix + token;
    return Boolean.TRUE.equals(redisTemplate.hasKey(key));
  }

  // Xóa access token khỏi blacklist (nếu cần)
  public void removeAccessTokenFromBlacklist(String token) {
    String key = accessTokenBlacklistPrefix + token;
    redisTemplate.delete(key);
  }

  // Xóa tất cả tokens đã hết hạn (cleanup job)
  public void cleanupExpiredTokens() {
    // Redis tự động xóa keys đã hết hạn, nhưng có thể thêm logic cleanup thủ công nếu cần
    log.debug("Cleanup expired tokens - Redis handles TTL automatically");
  }
}
