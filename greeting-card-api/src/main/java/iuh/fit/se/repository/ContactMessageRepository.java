package iuh.fit.se.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.ContactMessage;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
  @Query(
      value =
          "SELECT * FROM contact_messages cm WHERE "
              + "(cm.deleted_at IS NULL) AND "
              + "(:statusStr IS NULL OR cm.status = :statusStr) AND "
              + "(:category IS NULL OR cm.category = :category) AND "
              + "(:search IS NULL OR "
              + "  cm.full_name ILIKE CONCAT('%', :search, '%') OR "
              + "  cm.email ILIKE CONCAT('%', :search, '%') OR "
              + "  cm.subject ILIKE CONCAT('%', :search, '%') OR "
              + "  cm.message ILIKE CONCAT('%', :search, '%')) "
              + "ORDER BY cm.created_at DESC",
      countQuery =
          "SELECT COUNT(*) FROM contact_messages cm WHERE "
              + "(cm.deleted_at IS NULL) AND "
              + "(:statusStr IS NULL OR cm.status = :statusStr) AND "
              + "(:category IS NULL OR cm.category = :category) AND "
              + "(:search IS NULL OR "
              + "  cm.full_name ILIKE CONCAT('%', :search, '%') OR "
              + "  cm.email ILIKE CONCAT('%', :search, '%') OR "
              + "  cm.subject ILIKE CONCAT('%', :search, '%') OR "
              + "  cm.message ILIKE CONCAT('%', :search, '%'))",
      nativeQuery = true)
  Page<ContactMessage> findAllWithFilters(
      @Param("statusStr") String statusStr,
      @Param("category") String category,
      @Param("search") String search,
      Pageable pageable);
}

