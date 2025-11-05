package iuh.fit.se.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Payment;
import iuh.fit.se.entity.enumeration.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findByTransactionId(String transactionId);

  List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

  List<Payment> findByStatus(PaymentStatus status);

  @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId AND p.status = :status")
  List<Payment> findByOrderIdAndStatus(
      @Param("orderId") Long orderId, @Param("status") PaymentStatus status);

  @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId ORDER BY p.createdAt DESC")
  List<Payment> findByUserId(@Param("userId") Long userId);
}
