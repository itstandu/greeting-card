package iuh.fit.se.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
  Optional<Cart> findByUserId(Long userId);

  @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user.id = :userId")
  Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);

  boolean existsByUserId(Long userId);

  @Query("SELECT c FROM Cart c JOIN FETCH c.user LEFT JOIN FETCH c.items")
  Page<Cart> findAllWithUserAndItems(Pageable pageable);

  @Query(
      "SELECT c FROM Cart c JOIN FETCH c.user u LEFT JOIN FETCH c.items WHERE "
          + "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
          + "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<Cart> searchCarts(@Param("keyword") String keyword, Pageable pageable);

  @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.id = :cartId")
  Optional<Cart> findByIdWithItems(@Param("cartId") Long cartId);
}
