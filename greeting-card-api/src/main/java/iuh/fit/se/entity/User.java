package iuh.fit.se.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import iuh.fit.se.entity.enumeration.UserRole;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho người dùng trong hệ thống
@Entity
@Table(
    name = "users",
    indexes = {
      @Index(name = "idx_users_email", columnList = "email"),
      @Index(name = "idx_users_deleted_at", columnList = "deleted_at"),
      @Index(name = "idx_users_role", columnList = "role")
    })
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
  @Column(nullable = false, unique = true, length = 255)
  @Email(message = "Email không hợp lệ")
  private String email;

  @Column(nullable = false)
  private String password; // Đã được hash bằng BCrypt

  @Column(name = "full_name", nullable = false, length = 255)
  private String fullName;

  @Column(length = 20)
  private String phone;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private UserRole role = UserRole.CUSTOMER;

  @Column(name = "email_verified", nullable = false)
  private Boolean emailVerified = false;

  @Column(name = "email_verification_token", length = 255)
  private String emailVerificationToken;

  @Column(name = "email_verification_expires_at")
  private LocalDateTime emailVerificationExpiresAt;

  @Column(name = "avatar_url", length = 500)
  private String avatarUrl;

  // Relationships
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private Cart cart;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 20)
  private List<Order> orders = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 10)
  private List<RefreshToken> refreshTokens = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 10)
  private List<UserAddress> addresses = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 10)
  private List<Wishlist> wishlistItems = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 20)
  private List<ProductReview> reviews = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  @BatchSize(size = 50)
  private List<Notification> notifications = new ArrayList<>();

  @OneToMany(mappedBy = "changedBy", cascade = CascadeType.ALL)
  @BatchSize(size = 50)
  private List<OrderStatusHistory> orderStatusHistories = new ArrayList<>();
}
