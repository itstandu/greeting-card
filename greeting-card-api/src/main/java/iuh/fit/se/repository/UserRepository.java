package iuh.fit.se.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.User;

// Repository cho User entity
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  // Tìm user theo email (không tính soft deleted)
  Optional<User> findByEmail(String email);

  // Kiểm tra email đã tồn tại chưa (không tính soft deleted)
  boolean existsByEmail(String email);

  // Tìm user theo email verification token
  Optional<User> findByEmailVerificationToken(String token);

  // Tìm user theo email và emailVerified = true
  Optional<User> findByEmailAndEmailVerifiedTrue(String email);

  // Tìm kiếm người dùng với filter role và keyword (email, tên, phone)
  @Query(
      value =
          """
          SELECT u.* FROM users u
          WHERE u.deleted_at IS NULL
            AND (:role IS NULL OR CAST(u.role AS TEXT) = :role)
            AND (
              :keyword IS NULL
              OR LOWER(CAST(u.email AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
              OR LOWER(CAST(u.full_name AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
              OR CAST(u.phone AS TEXT) LIKE CONCAT('%', CAST(:keyword AS TEXT), '%')
            )
          ORDER BY u.created_at DESC
          """,
      countQuery =
          """
          SELECT COUNT(*) FROM users u
          WHERE u.deleted_at IS NULL
            AND (:role IS NULL OR CAST(u.role AS TEXT) = :role)
            AND (
              :keyword IS NULL
              OR LOWER(CAST(u.email AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
              OR LOWER(CAST(u.full_name AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
              OR CAST(u.phone AS TEXT) LIKE CONCAT('%', CAST(:keyword AS TEXT), '%')
            )
          """,
      nativeQuery = true)
  Page<User> searchUsers(
      @Param("role") String role, @Param("keyword") String keyword, Pageable pageable);

  // Dashboard: Get customer growth by day
  @Query(
      value =
          """
          SELECT TO_CHAR(DATE_TRUNC('day', u.created_at), 'YYYY-MM-DD') as period,
                 COUNT(u.id) as newUsers
          FROM users u
          WHERE u.deleted_at IS NULL
            AND u.created_at >= :startDate
          GROUP BY DATE_TRUNC('day', u.created_at)
          ORDER BY period
          """,
      nativeQuery = true)
  List<Object[]> getCustomerGrowthByPeriodDaily(@Param("startDate") java.time.LocalDate startDate);

  // Dashboard: Get customer growth by week
  @Query(
      value =
          """
          SELECT TO_CHAR(DATE_TRUNC('week', u.created_at), 'IYYY-IW') as period,
                 COUNT(u.id) as newUsers
          FROM users u
          WHERE u.deleted_at IS NULL
            AND u.created_at >= :startDate
          GROUP BY DATE_TRUNC('week', u.created_at)
          ORDER BY period
          """,
      nativeQuery = true)
  List<Object[]> getCustomerGrowthByPeriodWeekly(@Param("startDate") java.time.LocalDate startDate);

  // Dashboard: Get customer growth by month
  @Query(
      value =
          """
          SELECT TO_CHAR(DATE_TRUNC('month', u.created_at), 'YYYY-MM') as period,
                 COUNT(u.id) as newUsers
          FROM users u
          WHERE u.deleted_at IS NULL
            AND u.created_at >= :startDate
          GROUP BY DATE_TRUNC('month', u.created_at)
          ORDER BY period
          """,
      nativeQuery = true)
  List<Object[]> getCustomerGrowthByPeriodMonthly(
      @Param("startDate") java.time.LocalDate startDate);

  // Lấy danh sách tất cả admin users (không tính soft deleted)
  @Query(
      value = "SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.role = :role",
      nativeQuery = false)
  List<User> findByRole(@Param("role") iuh.fit.se.entity.enumeration.UserRole role);
}
