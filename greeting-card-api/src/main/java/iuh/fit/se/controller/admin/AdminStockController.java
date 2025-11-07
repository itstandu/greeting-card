package iuh.fit.se.controller.admin;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import iuh.fit.se.dto.request.CreateStockTransactionRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.PaginationResponse;
import iuh.fit.se.dto.response.StockTransactionResponse;
import iuh.fit.se.entity.enumeration.StockTransactionType;
import iuh.fit.se.service.StockService;
import iuh.fit.se.service.UserService;
import iuh.fit.se.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/stock-transactions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStockController {
  private final StockService stockService;
  private final UserService userService;

  @PostMapping
  public ResponseEntity<ApiResponse<StockTransactionResponse>> createStockTransaction(
      @Valid @RequestBody CreateStockTransactionRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    Long adminUserId = userService.getUserIdByEmail(userDetails.getUsername());
    StockTransactionResponse transaction =
        stockService.createStockTransaction(request, adminUserId);
    return ResponseEntity.ok(ApiResponse.success("Tạo giao dịch kho thành công", transaction));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<java.util.List<StockTransactionResponse>>> getStockTransactions(
      @RequestParam(required = false) Long productId,
      @RequestParam(required = false) StockTransactionType type,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page - 1, size, sort);

    var transactionPage = stockService.getStockTransactions(productId, type, keyword, pageable);

    PaginationResponse pagination = PaginationUtil.createPaginationResponse(transactionPage);

    return ResponseEntity.ok(
        ApiResponse.successWithPagination(transactionPage.getContent(), pagination));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<StockTransactionResponse>> getStockTransaction(
      @PathVariable Long id) {
    StockTransactionResponse transaction = stockService.getStockTransaction(id);
    return ResponseEntity.ok(ApiResponse.success(transaction));
  }

  @GetMapping("/products/{productId}")
  public ResponseEntity<ApiResponse<java.util.List<StockTransactionResponse>>>
      getProductStockHistory(
          @PathVariable Long productId,
          @RequestParam(defaultValue = "1") int page,
          @RequestParam(defaultValue = "20") int size) {
    Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
    var transactionPage = stockService.getProductStockHistory(productId, pageable);
    PaginationResponse pagination = PaginationUtil.createPaginationResponse(transactionPage);
    return ResponseEntity.ok(
        ApiResponse.successWithPagination(transactionPage.getContent(), pagination));
  }
}
