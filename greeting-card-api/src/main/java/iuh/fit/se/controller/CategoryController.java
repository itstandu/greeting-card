package iuh.fit.se.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreateCategoryRequest;
import iuh.fit.se.dto.request.UpdateCategoryRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.CategoryResponse;
import iuh.fit.se.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
  private final CategoryService categoryService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
      @RequestParam(required = false) Long parentId,
      @RequestParam(required = false) Boolean isActive,
      @RequestParam(required = false) Boolean isFeatured,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size) {

    // If pagination params are explicitly provided, return paginated response
    // This allows admin pages to always get pagination, while simple requests without page/size get
    // all
    if (page != null
        || size != null
        || parentId != null
        || isActive != null
        || isFeatured != null
        || keyword != null) {
      // Use defaults if page/size not provided but other filters are
      int pageNum = page != null ? page : 1;
      int sizeNum = size != null ? size : 10;

      Sort sort = Sort.by("displayOrder").ascending().and(Sort.by("createdAt").descending());
      Pageable pageable = PageRequest.of(pageNum - 1, sizeNum, sort);

      Page<CategoryResponse> categoryPage =
          categoryService.getCategories(parentId, isActive, isFeatured, keyword, pageable);

      return ResponseEntity.ok(
          ApiResponse.successWithPagination(
              categoryPage.getContent(), categoryService.createPaginationResponse(categoryPage)));
    }

    // Otherwise return all categories (for simple dropdowns - no pagination params at all)
    return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
  }

  @GetMapping("/slug/{slug}")
  public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(
      @PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryBySlug(slug)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
      @Valid @RequestBody CreateCategoryRequest request) {
    CategoryResponse category = categoryService.createCategory(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Tạo danh mục thành công", category));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
      @PathVariable Long id, @Valid @RequestBody UpdateCategoryRequest request) {
    CategoryResponse category = categoryService.updateCategory(id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", category));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
  }
}
