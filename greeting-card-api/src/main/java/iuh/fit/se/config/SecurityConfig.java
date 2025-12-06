package iuh.fit.se.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import iuh.fit.se.security.CustomUserDetailsService;
import iuh.fit.se.security.JwtAccessDeniedHandler;
import iuh.fit.se.security.JwtAuthenticationEntryPoint;
import iuh.fit.se.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

// Security Configuration
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final CustomUserDetailsService userDetailsService;
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
  private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

  @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}")
  private String corsAllowedOrigins;

  @Value("${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
  private String corsAllowedMethods;

  @Value("${CORS_ALLOWED_HEADERS:*}")
  private String corsAllowedHeaders;

  @Value("${CORS_ALLOW_CREDENTIALS:true}")
  private boolean corsAllowCredentials;

  @Value("${CORS_MAX_AGE:3600}")
  private long corsMaxAge;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
      throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    // Public endpoints - no authentication required
                    .requestMatchers("/", "/health", "/actuator/**", "/error")
                    .permitAll()
                    .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/verify-email",
                        "/api/auth/resend-verification",
                        "/api/auth/refresh")
                    .permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/seed/all")
                    .permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**")
                    .permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/products/**")
                    .hasRole("ADMIN")
                    .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/products/**")
                    .hasRole("ADMIN")
                    .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/products/**")
                    .hasRole("ADMIN")
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**")
                    .permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/categories/**")
                    .hasRole("ADMIN")
                    .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/categories/**")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE, "/api/categories/**")
                    .hasRole("ADMIN")
                    .requestMatchers("/api/coupons/**")
                    .permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/contacts")
                    .permitAll()
                    // Upload endpoints - require authentication
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/upload/**")
                    .hasAnyRole("ADMIN", "CUSTOMER")
                    .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/upload/**")
                    .hasAnyRole("ADMIN", "CUSTOMER")
                    // Authenticated user endpoints
                    .requestMatchers("/api/auth/logout", "/api/auth/logout-all", "/api/auth/me")
                    .authenticated()
                    .requestMatchers("/api/users/**")
                    .hasAnyRole("ADMIN", "CUSTOMER")
                    // Payment endpoints - require authentication
                    .requestMatchers("/api/payments/**")
                    .hasAnyRole("ADMIN", "CUSTOMER")
                    // Notification endpoints - require authentication
                    .requestMatchers("/api/notifications/**")
                    .hasAnyRole("ADMIN", "CUSTOMER")
                    // Admin endpoints - require ADMIN role
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                    // Any other endpoints require authentication
                    .anyRequest()
                    .authenticated())
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(jwtAuthenticationEntryPoint)
                    .accessDeniedHandler(jwtAccessDeniedHandler));

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Parse allowed origins from comma-separated string
    List<String> allowedOrigins =
        Arrays.stream(corsAllowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList();
    configuration.setAllowedOrigins(allowedOrigins);

    // Parse allowed methods from comma-separated string
    List<String> allowedMethods =
        Arrays.stream(corsAllowedMethods.split(","))
            .map(String::trim)
            .filter(method -> !method.isEmpty())
            .toList();
    configuration.setAllowedMethods(allowedMethods);

    // Parse allowed headers
    if ("*".equals(corsAllowedHeaders)) {
      configuration.setAllowedHeaders(Arrays.asList("*"));
    } else {
      List<String> allowedHeaders =
          Arrays.stream(corsAllowedHeaders.split(","))
              .map(String::trim)
              .filter(header -> !header.isEmpty())
              .toList();
      configuration.setAllowedHeaders(allowedHeaders);
    }

    configuration.setAllowCredentials(corsAllowCredentials);
    configuration.setMaxAge(corsMaxAge);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
