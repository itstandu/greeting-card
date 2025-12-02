package iuh.fit.se.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
  private Long id;
  private List<WishlistItemResponse> items;
  private Integer totalItems;

  public WishlistResponse(Long id, List<WishlistItemResponse> items) {
    this.id = id;
    this.items = items;
    this.totalItems = items.size();
  }
}
