package iuh.fit.se.util;

public enum CloudinaryFolder {
  // Folder cho hình ảnh sản phẩm
  PRODUCTS("products"),

  // Folder cho hình ảnh danh mục
  CATEGORIES("categories"),

  // Folder cho avatar người dùng
  USERS("users"),

  // Folder cho hình ảnh review
  REVIEWS("reviews"),

  // Folder cho các file khác
  GENERAL("general");

  private final String folderName;

  CloudinaryFolder(String folderName) {
    this.folderName = folderName;
  }

  public String getFolderName() {
    return folderName;
  }
}
