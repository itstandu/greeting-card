package iuh.fit.se.repository;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.WishlistItem;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
  Optional<WishlistItem> findByWishlistIdAndProductId(Long wishlistId, Long productId);

  boolean existsByWishlistIdAndProductId(Long wishlistId, Long productId);

  // Get all product IDs in user's wishlist (for batch checking)
  @Query("SELECT wi.product.id FROM WishlistItem wi WHERE wi.wishlist.user.id = :userId")
  Set<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
