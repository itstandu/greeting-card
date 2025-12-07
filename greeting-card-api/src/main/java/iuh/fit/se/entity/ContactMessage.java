package iuh.fit.se.entity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import iuh.fit.se.entity.enumeration.ContactStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity lưu thông tin liên hệ từ trang Contact
@Entity
@Table(
    name = "contact_messages",
    indexes = {
      @Index(name = "idx_contact_messages_status", columnList = "status"),
      @Index(name = "idx_contact_messages_category", columnList = "category"),
      @Index(name = "idx_contact_messages_created_at", columnList = "created_at")
    })
@SQLDelete(sql = "UPDATE contact_messages SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage extends BaseEntity {
  @Column(name = "full_name", nullable = false, length = 255)
  private String fullName;

  @Column(nullable = false, length = 255)
  private String email;

  @Column(length = 30)
  private String phone;

  @Column(nullable = false, length = 255)
  private String subject;

  @Column(nullable = false, length = 50)
  private String category;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private ContactStatus status = ContactStatus.NEW;
}
