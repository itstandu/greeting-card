package iuh.fit.se;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EntityScan("iuh.fit.se.entity")
@EnableJpaRepositories("iuh.fit.se.repository")
@EnableAsync
public class GreetingCardApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(GreetingCardApiApplication.class, args);
  }
}
