package iuh.fit.se.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;

import iuh.fit.se.exception.AppException;
import iuh.fit.se.exception.ErrorCode;
import iuh.fit.se.util.CloudinaryFolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

  private final Cloudinary cloudinary;

  @Value("${cloudinary.folder-base:greeting-card}")
  private String folderBase;

  @SuppressWarnings("unchecked")
  public String uploadFile(MultipartFile file, CloudinaryFolder folder, String publicId) {
    try {
      validateFile(file);

      String folderPath = buildFolderPath(folder);
      Map<String, Object> uploadParams = new HashMap<>();
      uploadParams.put("folder", folderPath);
      uploadParams.put("resource_type", "auto");

      if (publicId != null && !publicId.trim().isEmpty()) {
        uploadParams.put("public_id", folderPath + "/" + publicId);
      }

      Map<String, Object> uploadResult =
          cloudinary.uploader().upload(file.getBytes(), uploadParams);

      String url = (String) uploadResult.get("secure_url");
      log.info(
          "File uploaded successfully to Cloudinary: {} -> {}", file.getOriginalFilename(), url);
      return url;

    } catch (IOException e) {
      log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
      throw new AppException(
          "Lỗi khi upload file lên Cloudinary: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  public String uploadFile(MultipartFile file, CloudinaryFolder folder) {
    return uploadFile(file, folder, null);
  }

  @SuppressWarnings("unchecked")
  public String uploadFileToSubfolder(
      MultipartFile file, CloudinaryFolder folder, String subfolder) {
    try {
      validateFile(file);

      String folderPath = buildFolderPath(folder);
      if (subfolder != null && !subfolder.trim().isEmpty()) {
        folderPath = folderPath + "/" + subfolder.trim();
      }

      Map<String, Object> uploadParams = new HashMap<>();
      uploadParams.put("folder", folderPath);
      uploadParams.put("resource_type", "auto");

      Map<String, Object> uploadResult =
          cloudinary.uploader().upload(file.getBytes(), uploadParams);

      String url = (String) uploadResult.get("secure_url");
      log.info(
          "File uploaded successfully to Cloudinary: {} -> {}", file.getOriginalFilename(), url);
      return url;

    } catch (IOException e) {
      log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
      throw new AppException(
          "Lỗi khi upload file lên Cloudinary: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  public String[] uploadFiles(MultipartFile[] files, CloudinaryFolder folder) {
    String[] urls = new String[files.length];
    for (int i = 0; i < files.length; i++) {
      urls[i] = uploadFile(files[i], folder);
    }
    return urls;
  }

  @SuppressWarnings("unchecked")
  public void deleteFile(String urlOrPublicId) {
    try {
      String publicId = extractPublicIdFromUrl(urlOrPublicId);
      Map<String, Object> deleteParams = new HashMap<>();
      deleteParams.put("resource_type", "image");

      Map<String, Object> result = cloudinary.uploader().destroy(publicId, deleteParams);
      String resultStatus = (String) result.get("result");

      if (!"ok".equals(resultStatus)) {
        log.warn("File deletion result: {}", resultStatus);
      } else {
        log.info("File deleted successfully from Cloudinary: {}", publicId);
      }
    } catch (IOException e) {
      log.error("Error deleting file from Cloudinary: {}", e.getMessage(), e);
      throw new AppException(
          "Lỗi khi xóa file trên Cloudinary: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  public void deleteFiles(String[] urlsOrPublicIds) {
    for (String urlOrPublicId : urlsOrPublicIds) {
      deleteFile(urlOrPublicId);
    }
  }

  @SuppressWarnings("unchecked")
  public void deleteFileByPublicId(String publicId, String resourceType) {
    try {
      Map<String, Object> deleteParams = new HashMap<>();
      deleteParams.put("resource_type", resourceType != null ? resourceType : "image");

      Map<String, Object> result = cloudinary.uploader().destroy(publicId, deleteParams);
      String resultStatus = (String) result.get("result");

      if (!"ok".equals(resultStatus)) {
        log.warn("File deletion result: {}", resultStatus);
      } else {
        log.info("File deleted successfully from Cloudinary: {}", publicId);
      }
    } catch (IOException e) {
      log.error("Error deleting file from Cloudinary: {}", e.getMessage(), e);
      throw new AppException(
          "Lỗi khi xóa file trên Cloudinary: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  public void deleteFolder(CloudinaryFolder folder) {
    try {
      String folderPath = buildFolderPath(folder);
      Map<String, Object> deleteParams = new HashMap<>();
      deleteParams.put("all", true);
      cloudinary.api().deleteResourcesByPrefix(folderPath, deleteParams);
      log.info("Folder deleted successfully from Cloudinary: {}", folderPath);
    } catch (Exception e) {
      log.error("Error deleting folder from Cloudinary: {}", e.getMessage(), e);
      throw new AppException(
          "Lỗi khi xóa folder trên Cloudinary: " + e.getMessage(), ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  public String buildFolderPath(CloudinaryFolder folder) {
    return folderBase + "/" + folder.getFolderName();
  }

  private void validateFile(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new AppException("File không được để trống", ErrorCode.VALIDATION_ERROR);
    }

    long maxSize = 10 * 1024 * 1024;
    if (file.getSize() > maxSize) {
      throw new AppException(
          "Kích thước file không được vượt quá 10MB", ErrorCode.VALIDATION_ERROR);
    }

    String contentType = file.getContentType();
    if (contentType == null
        || (!contentType.startsWith("image/")
            && !contentType.equals("application/pdf")
            && !contentType.startsWith("video/"))) {
      throw new AppException(
          "Định dạng file không được hỗ trợ. Chỉ chấp nhận: image, video, PDF",
          ErrorCode.VALIDATION_ERROR);
    }
  }

  private String extractPublicIdFromUrl(String url) {
    if (url == null || url.trim().isEmpty()) {
      throw new AppException("URL không hợp lệ", ErrorCode.VALIDATION_ERROR);
    }

    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return url;
      }

      String[] parts = url.split("/upload/");
      if (parts.length < 2) {
        throw new AppException("URL Cloudinary không hợp lệ", ErrorCode.VALIDATION_ERROR);
      }

      String pathAfterUpload = parts[1];
      // Bỏ qua version nếu có (v1234567890/)
      if (pathAfterUpload.matches("^v\\d+/.*")) {
        pathAfterUpload = pathAfterUpload.substring(pathAfterUpload.indexOf("/") + 1);
      }

      // Loại bỏ extension
      int lastDotIndex = pathAfterUpload.lastIndexOf(".");
      if (lastDotIndex > 0) {
        pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
      }

      return pathAfterUpload;
    } catch (AppException e) {
      throw e;
    } catch (Exception e) {
      log.error("Error extracting public ID from URL: {}", url, e);
      throw new AppException(
          "Không thể trích xuất public ID từ URL: " + e.getMessage(), ErrorCode.VALIDATION_ERROR);
    }
  }
}
