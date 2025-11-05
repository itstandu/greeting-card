package iuh.fit.se.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SyncWishlistRequest {
  @Valid @NotNull private List<ProductIdData> productIds;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ProductIdData {
    @NotNull private Long productId;
  }
}
