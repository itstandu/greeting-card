package iuh.fit.se.util;

import org.springframework.data.domain.Page;

import iuh.fit.se.dto.response.PaginationResponse;

public class PaginationUtil {
  public static PaginationResponse createPaginationResponse(Page<?> page) {
    return PaginationResponse.builder()
        .page(page.getNumber() + 1)
        .size(page.getSize())
        .total(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .build();
  }
}
