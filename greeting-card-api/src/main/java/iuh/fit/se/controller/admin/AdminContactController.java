package iuh.fit.se.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.UpdateContactStatusRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.ContactResponse;
import iuh.fit.se.entity.enumeration.ContactStatus;
import iuh.fit.se.service.ContactService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/contacts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactController {
  private final ContactService contactService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<ContactResponse>>> getContacts(
      @RequestParam(required = false) ContactStatus status,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {
    Page<ContactResponse> contacts =
        contactService.getContacts(status, category, search, page, size, sortBy, sortDir);
    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            contacts.getContent(), PaginationUtil.createPaginationResponse(contacts)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ContactResponse>> getContact(@PathVariable Long id) {
    ContactResponse contact = contactService.getContact(id);
    return ResponseEntity.ok(ApiResponse.success(contact));
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<ApiResponse<ContactResponse>> updateStatus(
      @PathVariable Long id, @Valid @RequestBody UpdateContactStatusRequest request) {
    ContactResponse contact = contactService.updateStatus(id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", contact));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
    contactService.deleteContact(id);
    return ResponseEntity.ok(ApiResponse.success("Đã xóa liên hệ", null));
  }
}
