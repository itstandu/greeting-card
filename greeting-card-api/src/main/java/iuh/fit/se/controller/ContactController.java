package iuh.fit.se.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreateContactRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.ContactResponse;
import iuh.fit.se.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {
  private final ContactService contactService;

  @PostMapping
  public ResponseEntity<ApiResponse<ContactResponse>> createContact(
      @Valid @RequestBody CreateContactRequest request) {
    ContactResponse contact = contactService.createContact(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Gửi liên hệ thành công", contact));
  }
}

