package iuh.fit.se.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
  private Long id;
  private UserInfo user;
  private ProductInfo product;
  private Integer rating;
  private String comment;
  private Boolean isVerifiedPurchase;
  private Boolean isApproved;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class UserInfo {
    private Long id;
    private String fullName;
  }

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class ProductInfo {
    private Long id;
    private String name;
    private String slug;
  }
}
