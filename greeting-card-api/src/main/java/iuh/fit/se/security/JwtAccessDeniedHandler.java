package iuh.fit.se.security;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Access Denied Handler - Xử lý khi không có quyền truy cập
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
  @Override
  public void handle(
      HttpServletRequest request,
      HttpServletResponse response,
      AccessDeniedException accessDeniedException)
      throws IOException {
    response.setContentType("application/json;charset=UTF-8");
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    response
        .getWriter()
        .write(
            "{\"success\":false,\"message\":\"Không có quyền truy cập\",\"errorCode\":\"ACCESS_DENIED\",\"timestamp\":"
                + System.currentTimeMillis()
                + "}");
  }
}
