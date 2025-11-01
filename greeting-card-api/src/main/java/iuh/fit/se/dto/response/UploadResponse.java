package iuh.fit.se.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
  // URL của file đã upload (cho upload đơn lẻ)
  private String url;

  // Danh sách URL của các file đã upload (cho upload nhiều file)
  private List<String> urls;

  // Folder mà file được upload vào
  private String folder;

  // Số lượng file đã upload (cho upload nhiều file)
  private Integer count;
}
