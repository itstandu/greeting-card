package iuh.fit.se.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateCategoryRequest;
import iuh.fit.se.dto.request.UpdateCategoryRequest;
import iuh.fit.se.dto.response.CategoryResponse;
import iuh.fit.se.dto.response.PaginationResponse;
import iuh.fit.se.entity.Category;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.exception.ValidationException;
import iuh.fit.se.mapper.CategoryMapper;
import iuh.fit.se.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {
  private final CategoryRepository categoryRepository;
  private final CategoryMapper categoryMapper;
  private final CloudinaryService cloudinaryService;

  @Transactional(readOnly = true)
  public List<CategoryResponse> getAllCategories() {
    List<Category> categories = categoryRepository.findAll();
    return categories.stream().map(categoryMapper::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public Page<CategoryResponse> getCategories(
      Long parentId, Boolean isActive, Boolean isFeatured, String keyword, Pageable pageable) {
    // Create Pageable without Sort to avoid Spring Data JPA adding ORDER BY with Java property
    // names
    // The native query already has ORDER BY with database column names
    Pageable pageableWithoutSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    Page<Category> categoryPage =
        categoryRepository.searchCategories(
            parentId, isActive, isFeatured, keyword, pageableWithoutSort);

    return categoryPage.map(categoryMapper::toResponse);
  }

  @Transactional(readOnly = true)
  public CategoryResponse getCategoryById(Long id) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
    return categoryMapper.toResponse(category);
  }

  @Transactional(readOnly = true)
  public CategoryResponse getCategoryBySlug(String slug) {
    Category category =
        categoryRepository
            .findBySlug(slug)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy danh mục với slug: " + slug));
    return categoryMapper.toResponse(category);
  }

  @Transactional
  public CategoryResponse createCategory(CreateCategoryRequest request) {
    // Validate parent if provided
    Category parent = null;
    if (request.getParentId() != null) {
      parent =
          categoryRepository
              .findById(request.getParentId())
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          "Không tìm thấy danh mục cha với ID: " + request.getParentId()));
    }

    // Check if slug already exists
    String slug = generateUniqueSlug(request.getName());
    if (categoryRepository.existsBySlug(slug)) {
      throw new ValidationException("Slug đã tồn tại: " + slug);
    }

    Category category = new Category();
    category.setName(request.getName());
    category.setSlug(slug);
    category.setDescription(request.getDescription());
    category.setParent(parent);
    category.setImageUrl(request.getImageUrl());
    category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
    category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    category.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);

    category = categoryRepository.save(category);
    return categoryMapper.toResponse(category);
  }

  @Transactional
  public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

    // Validate parent if provided
    if (request.getParentId() != null) {
      if (request.getParentId().equals(id)) {
        throw new ValidationException("Danh mục không thể là cha của chính nó");
      }
      Category parent =
          categoryRepository
              .findById(request.getParentId())
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          "Không tìm thấy danh mục cha với ID: " + request.getParentId()));
      category.setParent(parent);
    }

    category.setName(request.getName());
    // Slug usually shouldn't change for SEO, but if name changes significantly, regenerate
    // For now, keep slug stable unless explicitly needed

    if (request.getDescription() != null) {
      category.setDescription(request.getDescription());
    }
    if (request.getImageUrl() != null) {
      // Delete old image from Cloudinary if it exists and is a Cloudinary URL
      String oldImageUrl = category.getImageUrl();
      if (oldImageUrl != null
          && !oldImageUrl.trim().isEmpty()
          && oldImageUrl.contains("cloudinary.com")
          && !oldImageUrl.equals(request.getImageUrl())) {
        try {
          cloudinaryService.deleteFile(oldImageUrl);
        } catch (Exception e) {
          log.warn("Failed to delete old image from Cloudinary: {}", oldImageUrl, e);
        }
      }
      category.setImageUrl(request.getImageUrl());
    }
    if (request.getDisplayOrder() != null) {
      category.setDisplayOrder(request.getDisplayOrder());
    }
    if (request.getIsActive() != null) {
      category.setIsActive(request.getIsActive());
    }
    if (request.getIsFeatured() != null) {
      category.setIsFeatured(request.getIsFeatured());
    }

    category = categoryRepository.save(category);
    return categoryMapper.toResponse(category);
  }

  @Transactional
  public void deleteCategory(Long id) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

    // Check if category has children
    if (!category.getChildren().isEmpty()) {
      throw new ValidationException("Không thể xóa danh mục có danh mục con");
    }

    // Check if category has products
    if (!category.getProducts().isEmpty()) {
      throw new ValidationException("Không thể xóa danh mục có sản phẩm");
    }

    // Delete image from Cloudinary before deleting category
    String imageUrl = category.getImageUrl();
    if (imageUrl != null && !imageUrl.trim().isEmpty() && imageUrl.contains("cloudinary.com")) {
      try {
        cloudinaryService.deleteFile(imageUrl);
      } catch (Exception e) {
        log.warn("Failed to delete image from Cloudinary: {}", imageUrl, e);
      }
    }

    categoryRepository.delete(category);
  }

  private String generateUniqueSlug(String name) {
    String baseSlug = toSlug(name);
    String slug = baseSlug;
    int counter = 1;
    while (categoryRepository.existsBySlug(slug)) {
      slug = baseSlug + "-" + counter;
      counter++;
    }
    return slug;
  }

  private String toSlug(String input) {
    if (input == null) return "";
    return input.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
  }

  public PaginationResponse createPaginationResponse(Page<?> page) {
    return PaginationResponse.builder()
        .page(page.getNumber() + 1) // Client usually expects 1-based
        .size(page.getSize())
        .total(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .build();
  }
}
