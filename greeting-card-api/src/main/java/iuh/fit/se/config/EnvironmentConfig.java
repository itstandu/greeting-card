package iuh.fit.se.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import io.github.cdimascio.dotenv.Dotenv;

// EnvironmentPostProcessor để load biến môi trường từ file .env khi ứng dụng khởi động Load trước
public class EnvironmentConfig implements EnvironmentPostProcessor {

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    // Load các biến từ .env vào Environment để Spring Boot có thể đọc được
    Map<String, Object> envMap = new HashMap<>();
    dotenv
        .entries()
        .forEach(
            entry -> {
              String key = entry.getKey();
              String value = entry.getValue();
              envMap.put(key, value);
              // Cũng set vào System properties để đảm bảo tương thích
              if (System.getProperty(key) == null) {
                System.setProperty(key, value);
              }
            });

    // Thêm vào Environment với priority cao để override các giá trị mặc định
    if (!envMap.isEmpty()) {
      environment.getPropertySources().addFirst(new MapPropertySource("dotenv", envMap));
    }
  }
}
