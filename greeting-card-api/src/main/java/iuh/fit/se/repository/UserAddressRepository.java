package iuh.fit.se.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.UserAddress;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
  List<UserAddress> findByUserId(Long userId);

  List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
}
