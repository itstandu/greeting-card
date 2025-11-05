package iuh.fit.se.entity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity đại diện cho địa chỉ giao hàng của người dùng Một user có thể có nhiều địa chỉ, nhưng chỉ
@Entity
@Table(
    name = "user_addresses",
    indexes = {
      @Index(name = "idx_user_addresses_user_id", columnList = "user_id"),
      @Index(name = "idx_user_addresses_is_default", columnList = "is_default")
    })
@SQLDelete(sql = "UPDATE user_addresses SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAddress extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "recipient_name", nullable = false, length = 255)
  private String recipientName;

  @Column(nullable = false, length = 20)
  private String phone;

  @Column(name = "address_line1", nullable = false, length = 255)
  private String addressLine1;

  @Column(name = "address_line2", length = 255)
  private String addressLine2;

  @Column(nullable = false, length = 100)
  private String city;

  @Column(length = 100)
  private String district;

  @Column(length = 100)
  private String ward;

  @Column(name = "postal_code", length = 20)
  private String postalCode;

  @Column(name = "is_default", nullable = false)
  private Boolean isDefault = false;
}
