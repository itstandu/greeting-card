package iuh.fit.se.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.RefreshToken;

// Repository cho RefreshToken entity
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  // Tìm refresh token theo token string
  Optional<RefreshToken> findByToken(String token);

  // Tìm refresh token theo user ID
  Optional<RefreshToken> findByUserId(Long userId);

  // Xóa tất cả refresh tokens của một user
  @Modifying
  @Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
  void deleteByUserId(Long userId);

  // Xóa tất cả refresh tokens đã hết hạn
  @Modifying
  @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
  void deleteExpiredTokens(LocalDateTime now);

  // Đếm số refresh tokens của một user
  long countByUserId(Long userId);
}
