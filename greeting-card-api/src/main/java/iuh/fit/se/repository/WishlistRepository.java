package iuh.fit.se.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.Wishlist;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
  Optional<Wishlist> findByUserId(Long userId);

  @Query("SELECT w FROM Wishlist w LEFT JOIN FETCH w.items WHERE w.user.id = :userId")
  Optional<Wishlist> findByUserIdWithItems(@Param("userId") Long userId);

  boolean existsByUserId(Long userId);

  @Query("SELECT w FROM Wishlist w JOIN FETCH w.user LEFT JOIN FETCH w.items")
  Page<Wishlist> findAllWithUserAndItems(Pageable pageable);

  @Query(
      "SELECT w FROM Wishlist w JOIN FETCH w.user u LEFT JOIN FETCH w.items WHERE "
          + "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
          + "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<Wishlist> searchWishlists(@Param("keyword") String keyword, Pageable pageable);

  @Query("SELECT w FROM Wishlist w LEFT JOIN FETCH w.items WHERE w.id = :wishlistId")
  Optional<Wishlist> findByIdWithItems(@Param("wishlistId") Long wishlistId);
}
