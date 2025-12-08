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

  // Fetch wishlist with items and products (images loaded via @BatchSize on Product.images)
  @Query(
      "SELECT DISTINCT w FROM Wishlist w "
          + "LEFT JOIN FETCH w.items wi "
          + "LEFT JOIN FETCH wi.product "
          + "WHERE w.user.id = :userId")
  Optional<Wishlist> findByUserIdWithItems(@Param("userId") Long userId);

  boolean existsByUserId(Long userId);

  // Admin: Get all wishlists with user info (pagination optimized)
  @Query(
      value =
          "SELECT DISTINCT w FROM Wishlist w "
              + "JOIN FETCH w.user "
              + "JOIN FETCH w.items",
      countQuery = "SELECT COUNT(DISTINCT w) FROM Wishlist w JOIN w.items")
  Page<Wishlist> findAllWithUserAndItems(Pageable pageable);

  // Admin: Search wishlists by user email or name
  @Query(
      value =
          "SELECT DISTINCT w FROM Wishlist w "
              + "JOIN FETCH w.user u "
              + "JOIN FETCH w.items "
              + "WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))",
      countQuery =
          "SELECT COUNT(DISTINCT w) FROM Wishlist w JOIN w.user u JOIN w.items "
              + "WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
              + "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<Wishlist> searchWishlists(@Param("keyword") String keyword, Pageable pageable);

  // Fetch wishlist by ID with items and product (images loaded via @BatchSize)
  @Query(
      "SELECT DISTINCT w FROM Wishlist w "
          + "LEFT JOIN FETCH w.items wi "
          + "LEFT JOIN FETCH wi.product "
          + "WHERE w.id = :wishlistId")
  Optional<Wishlist> findByIdWithItems(@Param("wishlistId") Long wishlistId);
}
