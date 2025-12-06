package iuh.fit.se.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Authentication Entry Point - Xử lý khi chưa authenticated
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

  @Autowired(required = false)
  private RequestMappingHandlerMapping requestMappingHandlerMapping;

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException)
      throws IOException {

    // Kiểm tra xem endpoint có tồn tại trong hệ thống không
    if (!isHandlerExists(request)) {
      // Nếu không tồn tại, trả về 404 Not Found
      response.setContentType("application/json;charset=UTF-8");
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      response
          .getWriter()
          .write(
              "{\"success\":false,\"message\":\"Không tìm thấy endpoint\",\"errorCode\":\"NOT_FOUND\",\"timestamp\":"
                  + System.currentTimeMillis()
                  + "}");
      return;
    }

    // Nếu endpoint tồn tại nhưng chưa authenticated, trả về 401 Unauthorized
    response.setContentType("application/json;charset=UTF-8");
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response
        .getWriter()
        .write(
            "{\"success\":false,\"message\":\"Chưa đăng nhập hoặc token không hợp lệ\",\"errorCode\":\"UNAUTHORIZED\",\"timestamp\":"
                + System.currentTimeMillis()
                + "}");
  }

  // Kiểm tra xem có handler nào xử lý request này không
  @SuppressWarnings("null")
  private boolean isHandlerExists(HttpServletRequest request) {
    if (requestMappingHandlerMapping == null) {
      // Nếu handler mapping chưa được khởi tạo, giả định endpoint tồn tại
      return true;
    }

    try {
      // Thử tìm handler cho request này
      HandlerExecutionChain handlerChain = requestMappingHandlerMapping.getHandler(request);
      return handlerChain != null && handlerChain.getHandler() != null;
    } catch (org.springframework.web.servlet.NoHandlerFoundException e) {
      // Nếu ném NoHandlerFoundException, endpoint không tồn tại
      return false;
    } catch (Exception e) {
      // Nếu có lỗi khác khi kiểm tra, giả định endpoint tồn tại để an toàn
      return true;
    }
  }
}
