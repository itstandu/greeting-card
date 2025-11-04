package iuh.fit.se.repository;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
  Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

  boolean existsByCartIdAndProductId(Long cartId, Long productId);

  void deleteByCartIdAndProductId(Long cartId, Long productId);

  // Get all product IDs in user's cart (for batch checking)
  @Query("SELECT ci.product.id FROM CartItem ci WHERE ci.cart.user.id = :userId")
  Set<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
