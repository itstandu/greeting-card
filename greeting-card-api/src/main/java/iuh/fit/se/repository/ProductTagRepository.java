package iuh.fit.se.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import iuh.fit.se.entity.ProductTag;

@Repository
public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {}
