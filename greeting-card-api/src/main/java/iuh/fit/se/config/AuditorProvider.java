package iuh.fit.se.config;

import java.util.Optional;

import org.hibernate.Session;
import org.springframework.data.domain.AuditorAware;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import iuh.fit.se.entity.User;
import iuh.fit.se.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

// Auditor Provider để tự động set createdBy và updatedBy cho JPA Auditing
@Component
@RequiredArgsConstructor
public class AuditorProvider implements AuditorAware<User> {
  private final UserRepository userRepository;

  @PersistenceContext private EntityManager entityManager;

  @Override
  @NonNull
  @SuppressWarnings("null")
  public Optional<User> getCurrentAuditor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      return Optional.empty();
    }

    String email = authentication.getName();

    // Temporarily disable auto-flush to prevent infinite recursion
    // when AuditingEntityListener calls this method during flush
    Session session = entityManager.unwrap(Session.class);
    org.hibernate.FlushMode originalFlushMode = session.getHibernateFlushMode();
    try {
      session.setHibernateFlushMode(org.hibernate.FlushMode.COMMIT);
      return userRepository.findByEmail(email);
    } finally {
      session.setHibernateFlushMode(originalFlushMode);
    }
  }
}
