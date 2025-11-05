package iuh.fit.se.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.PaymentMethod;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
  Optional<PaymentMethod> findByCode(String code);

  List<PaymentMethod> findByIsActiveTrueOrderByDisplayOrderAsc();

  List<PaymentMethod> findAllByOrderByDisplayOrderAsc();

  boolean existsByCode(String code);

  boolean existsByCodeAndIdNot(String code, Long id);

  @Query(
      "SELECT pm FROM PaymentMethod pm WHERE "
          + "(:search IS NULL OR pm.name LIKE %:search% OR pm.code LIKE %:search%) AND "
          + "(:isActive IS NULL OR pm.isActive = :isActive)")
  Page<PaymentMethod> findAllWithFilters(
      @Param("search") String search, @Param("isActive") Boolean isActive, Pageable pageable);

  @Query("SELECT MAX(pm.displayOrder) FROM PaymentMethod pm")
  Integer findMaxDisplayOrder();
}
