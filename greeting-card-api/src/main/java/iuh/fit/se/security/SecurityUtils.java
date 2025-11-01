package iuh.fit.se.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import iuh.fit.se.entity.User;
import iuh.fit.se.exception.AuthenticationException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

  private static UserRepository userRepository;

  public SecurityUtils(UserRepository userRepo) {
    SecurityUtils.userRepository = userRepo;
  }

  public static Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      throw new AuthenticationException("Chưa đăng nhập", ErrorCode.UNAUTHORIZED);
    }

    String email = authentication.getName();

    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(
                () ->
                    new AuthenticationException(
                        "Không tìm thấy người dùng", ErrorCode.UNAUTHORIZED));

    return user.getId();
  }

  public static String getCurrentUserEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      throw new AuthenticationException("Chưa đăng nhập", ErrorCode.UNAUTHORIZED);
    }

    return authentication.getName();
  }

  public static boolean isAuthenticated() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication != null
        && authentication.isAuthenticated()
        && !"anonymousUser".equals(authentication.getPrincipal());
  }
}
