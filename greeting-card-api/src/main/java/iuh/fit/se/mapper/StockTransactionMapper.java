package iuh.fit.se.mapper;

import org.springframework.stereotype.Component;

import iuh.fit.se.dto.response.StockTransactionResponse;
import iuh.fit.se.entity.StockTransaction;

@Component
public class StockTransactionMapper {
  public StockTransactionResponse toResponse(StockTransaction transaction) {
    if (transaction == null) {
      return null;
    }

    return StockTransactionResponse.builder()
        .id(transaction.getId())
        .productId(transaction.getProduct().getId())
        .productName(transaction.getProduct().getName())
        .productSku(transaction.getProduct().getSku())
        .type(transaction.getType())
        .quantity(Math.abs(transaction.getQuantity())) // Luôn hiển thị số dương
        .stockBefore(transaction.getStockBefore())
        .stockAfter(transaction.getStockAfter())
        .notes(transaction.getNotes())
        .createdBy(
            transaction.getCreatedBy() != null
                ? transaction.getCreatedBy().getFullName()
                : "System")
        .createdAt(transaction.getCreatedAt())
        .build();
  }
}
