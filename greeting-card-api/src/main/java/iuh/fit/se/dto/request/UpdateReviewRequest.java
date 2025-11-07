package iuh.fit.se.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewRequest {
  @Min(value = 1, message = "Rating phải từ 1 đến 5")
  @Max(value = 5, message = "Rating phải từ 1 đến 5")
  private Integer rating;

  @Size(max = 1000, message = "Bình luận không được quá 1000 ký tự")
  private String comment;
}
