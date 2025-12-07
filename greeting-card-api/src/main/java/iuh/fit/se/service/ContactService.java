package iuh.fit.se.service;

import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateContactRequest;
import iuh.fit.se.dto.request.UpdateContactStatusRequest;
import iuh.fit.se.dto.response.ContactResponse;
import iuh.fit.se.entity.ContactMessage;
import iuh.fit.se.entity.enumeration.ContactStatus;
import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {
  private final ContactMessageRepository contactMessageRepository;

  @Transactional
  public ContactResponse createContact(CreateContactRequest request) {
    ContactMessage contact = new ContactMessage();
    contact.setFullName(request.getFullName());
    contact.setEmail(request.getEmail());
    contact.setPhone(request.getPhone());
    contact.setSubject(request.getSubject());
    contact.setCategory(request.getCategory());
    contact.setMessage(request.getMessage());
    contact.setStatus(ContactStatus.NEW);

    contact = contactMessageRepository.save(contact);
    log.info("Created contact message {} from {}", contact.getId(), contact.getEmail());
    return toResponse(contact);
  }

  @Transactional(readOnly = true)
  public Page<ContactResponse> getContacts(
      ContactStatus status,
      String category,
      String search,
      int page,
      int size,
      String sortBy,
      String sortDir) {
    // For native queries, use unsorted Pageable to avoid Spring Data JPA
    // trying to add ORDER BY with Java field names
    // Sorting is handled in the SQL query itself
    // Convert enum to string for native query compatibility
    String statusStr = status != null ? status.name() : null;
    Pageable pageable = PageRequest.of(page - 1, size);

    Page<ContactMessage> contacts =
        contactMessageRepository.findAllWithFilters(statusStr, category, search, pageable);

    return contacts.map(this::toResponse);
  }

  @Transactional(readOnly = true)
  public ContactResponse getContact(Long id) {
    Objects.requireNonNull(id, "Contact id must not be null");
    ContactMessage contact =
        contactMessageRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException(
                        "Không tìm thấy liên hệ", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND));
    return toResponse(contact);
  }

  @Transactional
  public ContactResponse updateStatus(Long id, UpdateContactStatusRequest request) {
    Objects.requireNonNull(id, "Contact id must not be null");
    ContactMessage contact =
        contactMessageRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException(
                        "Không tìm thấy liên hệ", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND));

    contact.setStatus(request.getStatus());
    contact = contactMessageRepository.save(contact);
    log.info("Updated contact {} status to {}", id, request.getStatus());
    return toResponse(contact);
  }

  @Transactional
  public void deleteContact(Long id) {
    Objects.requireNonNull(id, "Contact id must not be null");
    ContactMessage contact =
        contactMessageRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new AppException(
                        "Không tìm thấy liên hệ", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND));
    Objects.requireNonNull(contact, "Contact must not be null");
    contactMessageRepository.delete(contact);
    log.info("Deleted contact {}", id);
  }

  private ContactResponse toResponse(ContactMessage contact) {
    return ContactResponse.builder()
        .id(contact.getId())
        .fullName(contact.getFullName())
        .email(contact.getEmail())
        .phone(contact.getPhone())
        .subject(contact.getSubject())
        .category(contact.getCategory())
        .message(contact.getMessage())
        .status(contact.getStatus())
        .createdAt(contact.getCreatedAt())
        .updatedAt(contact.getUpdatedAt())
        .build();
  }
}
