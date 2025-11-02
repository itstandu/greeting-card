package iuh.fit.se.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreateProductRequest;
import iuh.fit.se.dto.request.UpdateProductRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.ProductResponse;
import iuh.fit.se.service.ProductService;
import iuh.fit.se.service.UserService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
  private final ProductService productService;
  private final UserService userService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) Boolean isActive,
      @RequestParam(required = false) Boolean isFeatured,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    Long userId = getUserIdFromAuth(userDetails);

    Page<ProductResponse> productPage =
        productService.getProducts(categoryId, isActive, isFeatured, keyword, pageable, userId);

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(
            productPage.getContent(), PaginationUtil.createPaginationResponse(productPage)));
  }

  @GetMapping("/{slug}")
  public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable String slug) {
    Long userId = getUserIdFromAuth(userDetails);
    return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug, userId)));
  }

  @GetMapping("/id/{id}")
  public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = getUserIdFromAuth(userDetails);
    return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id, userId)));
  }

  /** Helper method to get userId from authentication (returns null if not authenticated). */
  private Long getUserIdFromAuth(UserDetails userDetails) {
    if (userDetails == null) {
      return null;
    }
    try {
      return userService.getUserIdByEmail(userDetails.getUsername());
    } catch (Exception e) {
      return null;
    }
  }

  @PostMapping
  public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
      @Valid @RequestBody CreateProductRequest request) {
    ProductResponse product = productService.createProduct(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Tạo sản phẩm thành công", product));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
      @PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
    ProductResponse product = productService.updateProduct(id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", product));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
    productService.deleteProduct(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
  }
}
