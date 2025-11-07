package iuh.fit.se.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Home Controller - Public endpoints
@RestController
public class HomeController {

  @GetMapping("/")
  public ResponseEntity<Map<String, Object>> home() {
    Map<String, Object> response = new HashMap<>();
    response.put("message", "Welcome to Greeting Card API");
    response.put("version", "1.0.0");
    response.put("status", "running");
    return ResponseEntity.ok(response);
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String, String>> health() {
    Map<String, String> response = new HashMap<>();
    response.put("status", "UP");
    return ResponseEntity.ok(response);
  }
}
