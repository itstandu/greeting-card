package iuh.fit.se.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.LoginRequest;
import iuh.fit.se.dto.request.RegisterRequest;
import iuh.fit.se.dto.request.ResendVerificationRequest;
import iuh.fit.se.dto.response.LoginResponse;
import iuh.fit.se.dto.response.TokenResponse;
import iuh.fit.se.dto.response.UserResponse;
import iuh.fit.se.entity.RefreshToken;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.enumeration.UserRole;
import iuh.fit.se.exception.AuthenticationException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.exception.ValidationException;
import iuh.fit.se.mapper.UserMapper;
import iuh.fit.se.repository.RefreshTokenRepository;
import iuh.fit.se.repository.UserRepository;
import iuh.fit.se.util.CookieUtil;
import iuh.fit.se.util.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final EmailVerificationService emailVerificationService;
  private final CookieUtil cookieUtil;
  private final TokenRedisService tokenRedisService;
  private final UserMapper userMapper;

  @Transactional
  public UserResponse register(RegisterRequest request) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
      throw new ValidationException("Email đã được sử dụng", ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    User user = new User();
    user.setEmail(normalizedEmail);
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setFullName(request.getFullName().trim());
    user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
    user.setRole(UserRole.CUSTOMER);
    user.setEmailVerified(false);

    String verificationToken = UUID.randomUUID().toString();
    user.setEmailVerificationToken(verificationToken);
    user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(24));

    user = userRepository.save(user);
    emailVerificationService.sendVerificationEmail(user, verificationToken);

    return userMapper.toResponse(user);
  }

  @Transactional
  public LoginResponse login(LoginRequest request, HttpServletResponse response) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(
                () ->
                    new AuthenticationException(
                        "Email hoặc mật khẩu không đúng", ErrorCode.BAD_CREDENTIALS));

    if (!user.getEmailVerified()) {
      throw new AuthenticationException(
          "Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.",
          ErrorCode.EMAIL_NOT_VERIFIED);
    }

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new AuthenticationException(
          "Email hoặc mật khẩu không đúng", ErrorCode.BAD_CREDENTIALS);
    }

    String accessToken =
        jwtTokenProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());

    String refreshTokenString = jwtTokenProvider.createRefreshToken(user.getId());

    Date refreshTokenExpiration = jwtTokenProvider.getExpirationDateFromToken(refreshTokenString);
    LocalDateTime refreshTokenExpiresAt =
        LocalDateTime.ofInstant(refreshTokenExpiration.toInstant(), ZoneId.systemDefault());

    RefreshToken refreshToken = new RefreshToken();
    refreshToken.setUser(user);
    refreshToken.setToken(refreshTokenString);
    refreshToken.setExpiresAt(refreshTokenExpiresAt);
    refreshTokenRepository.save(refreshToken);

    cookieUtil.createRefreshTokenCookie(
        response,
        refreshTokenString,
        (int) (jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000));

    return LoginResponse.builder()
        .user(userMapper.toResponse(user))
        .message("Đăng nhập thành công")
        .accessToken(accessToken)
        .expiresIn(jwtTokenProvider.getAccessTokenValidityInMilliseconds())
        .build();
  }

  @Transactional
  public void verifyEmail(String token) {
    if (token == null || token.trim().isEmpty()) {
      throw new ValidationException("Token xác thực không được để trống");
    }

    User user =
        userRepository
            .findByEmailVerificationToken(token)
            .orElseThrow(
                () ->
                    new ValidationException(
                        "Token xác thực không hợp lệ", ErrorCode.INVALID_VERIFICATION_TOKEN));

    if (user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
      throw new ValidationException(
          "Token xác thực đã hết hạn", ErrorCode.VERIFICATION_TOKEN_EXPIRED);
    }

    user.setEmailVerified(true);
    user.setEmailVerificationToken(null);
    user.setEmailVerificationExpiresAt(null);
    userRepository.save(user);
  }

  @Transactional
  public void resendVerificationEmail(ResendVerificationRequest request) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy tài khoản với email này"));

    if (user.getEmailVerified()) {
      throw new ValidationException("Email đã được xác thực");
    }

    String verificationToken = UUID.randomUUID().toString();
    user.setEmailVerificationToken(verificationToken);
    user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(24));
    userRepository.save(user);

    emailVerificationService.sendVerificationEmail(user, verificationToken);
  }

  @Transactional
  public TokenResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
    String refreshTokenString = cookieUtil.getRefreshTokenFromCookie(request);

    if (refreshTokenString == null) {
      throw new AuthenticationException(
          "Refresh token không tồn tại", ErrorCode.REFRESH_TOKEN_NOT_FOUND);
    }

    if (!jwtTokenProvider.validateToken(refreshTokenString)) {
      throw new AuthenticationException(
          "Refresh token không hợp lệ", ErrorCode.INVALID_REFRESH_TOKEN);
    }

    RefreshToken refreshToken =
        refreshTokenRepository
            .findByToken(refreshTokenString)
            .orElseThrow(
                () ->
                    new AuthenticationException(
                        "Refresh token không tồn tại", ErrorCode.REFRESH_TOKEN_NOT_FOUND));

    if (refreshToken.isExpired()) {
      refreshTokenRepository.delete(refreshToken);
      throw new AuthenticationException(
          "Refresh token đã hết hạn", ErrorCode.REFRESH_TOKEN_EXPIRED);
    }

    User user = refreshToken.getUser();

    // Blacklist old access token if valid
    String oldAccessToken = extractAccessToken(request);
    if (oldAccessToken != null && jwtTokenProvider.validateToken(oldAccessToken)) {
      Date accessTokenExpiration = jwtTokenProvider.getExpirationDateFromToken(oldAccessToken);
      tokenRedisService.blacklistAccessToken(oldAccessToken, accessTokenExpiration.toInstant());
    }

    String newAccessToken =
        jwtTokenProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());

    // Rotate refresh token
    String newRefreshTokenString = jwtTokenProvider.createRefreshToken(user.getId());
    Date newRefreshTokenExpiration =
        jwtTokenProvider.getExpirationDateFromToken(newRefreshTokenString);
    LocalDateTime newRefreshTokenExpiresAt =
        LocalDateTime.ofInstant(newRefreshTokenExpiration.toInstant(), ZoneId.systemDefault());

    refreshToken.setToken(newRefreshTokenString);
    refreshToken.setExpiresAt(newRefreshTokenExpiresAt);
    refreshTokenRepository.save(refreshToken);

    cookieUtil.createRefreshTokenCookie(
        response,
        newRefreshTokenString,
        (int) (jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000));

    return TokenResponse.builder()
        .accessToken(newAccessToken)
        .tokenType("Bearer")
        .expiresIn(jwtTokenProvider.getAccessTokenValidityInMilliseconds())
        .build();
  }

  @Transactional
  public void logout(HttpServletRequest request, HttpServletResponse response) {
    // Blacklist access token
    String accessToken = extractAccessToken(request);
    if (accessToken != null && jwtTokenProvider.validateToken(accessToken)) {
      Date expiration = jwtTokenProvider.getExpirationDateFromToken(accessToken);
      tokenRedisService.blacklistAccessToken(accessToken, expiration.toInstant());
    }

    String refreshTokenString = cookieUtil.getRefreshTokenFromCookie(request);
    if (refreshTokenString != null) {
      refreshTokenRepository
          .findByToken(refreshTokenString)
          .ifPresent(refreshTokenRepository::delete);
    }

    cookieUtil.deleteRefreshTokenCookie(response);
  }

  @Transactional
  public void logoutAll(Long userId, HttpServletResponse response) {
    if (!userRepository.existsById(userId)) {
      throw new iuh.fit.se.exception.ResourceNotFoundException(
          "Không tìm thấy người dùng với ID: " + userId);
    }

    refreshTokenRepository.deleteByUserId(userId);
    cookieUtil.deleteRefreshTokenCookie(response);
  }

  private String extractAccessToken(HttpServletRequest request) {
    String authorizationHeader = request.getHeader("Authorization");
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
      return authorizationHeader.substring(7);
    }
    return null;
  }
}
