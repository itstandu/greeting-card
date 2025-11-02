package iuh.fit.se.controller;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.UploadResponse;
import iuh.fit.se.service.CloudinaryService;
import iuh.fit.se.util.CloudinaryFolder;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

  // Controller xử lý upload và xóa file trên Cloudinary.
  private final CloudinaryService cloudinaryService;

  // Upload một file vào folder cụ thể.
  @PostMapping("/single")
  public ResponseEntity<ApiResponse<UploadResponse>> uploadSingleFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam("folder") String folder,
      @RequestParam(required = false) String publicId) {

    CloudinaryFolder cloudinaryFolder = parseFolder(folder);
    String url = cloudinaryService.uploadFile(file, cloudinaryFolder, publicId);

    UploadResponse response = UploadResponse.builder().url(url).folder(folder).build();

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Upload file thành công", response));
  }

  // Upload nhiều file cùng lúc vào cùng một folder.
  @PostMapping("/multiple")
  public ResponseEntity<ApiResponse<UploadResponse>> uploadMultipleFiles(
      @RequestParam("files") MultipartFile[] files, @RequestParam("folder") String folder) {

    CloudinaryFolder cloudinaryFolder = parseFolder(folder);
    String[] urls = cloudinaryService.uploadFiles(files, cloudinaryFolder);

    UploadResponse response =
        UploadResponse.builder()
            .urls(Arrays.asList(urls))
            .folder(folder)
            .count(urls.length)
            .build();

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Upload " + urls.length + " file thành công", response));
  }

  // Upload file cho sản phẩm.
  @PostMapping("/products")
  public ResponseEntity<ApiResponse<UploadResponse>> uploadProductImage(
      @RequestParam("file") MultipartFile file, @RequestParam(required = false) Long productId) {
    String subfolder = productId != null ? productId.toString() : null;
    String url =
        cloudinaryService.uploadFileToSubfolder(file, CloudinaryFolder.PRODUCTS, subfolder);
    UploadResponse response =
        UploadResponse.builder().url(url).folder(CloudinaryFolder.PRODUCTS.getFolderName()).build();
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Upload hình ảnh sản phẩm thành công", response));
  }

  // Upload nhiều file cho sản phẩm.
  @PostMapping("/products/multiple")
  public ResponseEntity<ApiResponse<UploadResponse>> uploadProductImages(
      @RequestParam("files") MultipartFile[] files) {
    String[] urls = cloudinaryService.uploadFiles(files, CloudinaryFolder.PRODUCTS);
    UploadResponse response =
        UploadResponse.builder()
            .urls(Arrays.asList(urls))
            .folder(CloudinaryFolder.PRODUCTS.getFolderName())
            .count(urls.length)
            .build();
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            ApiResponse.success(
                "Upload " + urls.length + " hình ảnh sản phẩm thành công", response));
  }

  // Upload file cho danh mục.
  @PostMapping("/categories")
  public ResponseEntity<ApiResponse<UploadResponse>> uploadCategoryImage(
      @RequestParam("file") MultipartFile file) {
    String url = cloudinaryService.uploadFile(file, CloudinaryFolder.CATEGORIES);
    UploadResponse response =
        UploadResponse.builder()
            .url(url)
            .folder(CloudinaryFolder.CATEGORIES.getFolderName())
            .build();
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Upload hình ảnh danh mục thành công", response));
  }

  // Upload file cho người dùng.
  @PostMapping("/users")
  public ResponseEntity<ApiResponse<UploadResponse>> uploadUserAvatar(
      @RequestParam("file") MultipartFile file) {
    String url = cloudinaryService.uploadFile(file, CloudinaryFolder.USERS);
    UploadResponse response =
        UploadResponse.builder().url(url).folder(CloudinaryFolder.USERS.getFolderName()).build();
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Upload avatar thành công", response));
  }

  // Xóa file dựa vào URL hoặc public ID.
  @DeleteMapping
  public ResponseEntity<ApiResponse<Void>> deleteFile(
      @RequestParam("urlOrPublicId") String urlOrPublicId) {
    cloudinaryService.deleteFile(urlOrPublicId);
    return ResponseEntity.ok(ApiResponse.success("Xóa file thành công", null));
  }

  // Xóa nhiều file cùng lúc.
  @DeleteMapping("/multiple")
  public ResponseEntity<ApiResponse<Void>> deleteFiles(
      @RequestParam("urlsOrPublicIds") String urlsOrPublicIds) {
    String[] urls = urlsOrPublicIds.split(",");
    cloudinaryService.deleteFiles(urls);
    return ResponseEntity.ok(ApiResponse.success("Xóa " + urls.length + " file thành công", null));
  }

  // Parse folder string thành CloudinaryFolder enum.
  private CloudinaryFolder parseFolder(String folder) {
    if (folder == null || folder.trim().isEmpty()) {
      throw new IllegalArgumentException("Folder không được để trống");
    }

    try {
      return CloudinaryFolder.valueOf(folder.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException(
          "Folder không hợp lệ: "
              + folder
              + ". Các folder hợp lệ: "
              + Arrays.stream(CloudinaryFolder.values())
                  .map(CloudinaryFolder::getFolderName)
                  .collect(Collectors.joining(", ")));
    }
  }
}
