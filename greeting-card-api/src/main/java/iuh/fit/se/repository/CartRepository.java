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

  // Fetch cart with items and product (images loaded via @BatchSize on Product.images)
  @Query(
      "SELECT DISTINCT c FROM Cart c "
          + "LEFT JOIN FETCH c.items ci "
          + "LEFT JOIN FETCH ci.product "
          + "WHERE c.user.id = :userId")
  Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);

  boolean existsByUserId(Long userId);

  // Admin: Get all carts with user info (pagination optimized)
  @Query(
      value =
          "SELECT DISTINCT c FROM Cart c "
              + "JOIN FETCH c.user "
              + "JOIN FETCH c.items",
      countQuery = "SELECT COUNT(DISTINCT c) FROM Cart c JOIN c.items")
  Page<Cart> findAllWithUserAndItems(Pageable pageable);

  // Admin: Search carts by user email or name
  @Query(
      value =
          "SELECT DISTINCT c FROM Cart c "
              + "JOIN FETCH c.user u "
              + "JOIN FETCH c.items "
              + "WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))",
      countQuery =
          "SELECT COUNT(DISTINCT c) FROM Cart c JOIN c.user u JOIN c.items "
              + "WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<Cart> searchCarts(@Param("keyword") String keyword, Pageable pageable);

  // Fetch cart by ID with items and product (images loaded via @BatchSize)
  @Query(
      "SELECT DISTINCT c FROM Cart c "
          + "LEFT JOIN FETCH c.items ci "
          + "LEFT JOIN FETCH ci.product "
          + "WHERE c.id = :cartId")
  Optional<Cart> findByIdWithItems(@Param("cartId") Long cartId);
}
