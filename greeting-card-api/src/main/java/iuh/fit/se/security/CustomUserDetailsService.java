package iuh.fit.se.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.entity.User;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;

// UserDetailsService implementation để Spring Security load user
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
  private final UserRepository userRepository;

  @Override
  @Transactional(readOnly = true)
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user =
        userRepository
            .findByEmailAndEmailVerifiedTrue(email)
            .orElseThrow(
                () ->
                    new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

    return new org.springframework.security.core.userdetails.User(
        user.getEmail(), user.getPassword(), getAuthorities(user));
  }

  private Collection<? extends GrantedAuthority> getAuthorities(User user) {
    return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
  }
}
