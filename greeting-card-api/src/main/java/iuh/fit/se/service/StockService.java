package iuh.fit.se.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateStockTransactionRequest;
import iuh.fit.se.dto.response.StockTransactionResponse;
import iuh.fit.se.entity.Product;
import iuh.fit.se.entity.StockTransaction;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.enumeration.StockTransactionType;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.mapper.StockTransactionMapper;
import iuh.fit.se.repository.ProductRepository;
import iuh.fit.se.repository.StockTransactionRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
  private final StockTransactionRepository stockTransactionRepository;
  private final ProductRepository productRepository;
  private final UserRepository userRepository;
  private final StockTransactionMapper stockTransactionMapper;

  @Transactional
  public StockTransactionResponse createStockTransaction(
      CreateStockTransactionRequest request, Long adminUserId) {
    // Lấy sản phẩm
    Product product =
        productRepository
            .findById(request.getProductId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm với ID: " + request.getProductId()));

    // Lấy admin user
    User admin =
        userRepository
            .findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

    // Validate quantity
    if (request.getQuantity() == null || request.getQuantity() == 0) {
      throw new IllegalArgumentException("Số lượng không được để trống hoặc bằng 0");
    }

    if (request.getType() != StockTransactionType.ADJUSTMENT && request.getQuantity() < 0) {
      throw new IllegalArgumentException(
          "Số lượng phải lớn hơn 0 cho loại giao dịch: " + request.getType());
    }

    // Lấy tồn kho hiện tại
    Integer stockBefore = product.getStock();
    Integer quantity = request.getQuantity();

    // Tính toán tồn kho sau
    Integer stockAfter;
    switch (request.getType()) {
      case IN:
        // Nhập kho: tăng tồn kho
        if (quantity <= 0) {
          throw new IllegalArgumentException("Số lượng nhập kho phải lớn hơn 0");
        }
        stockAfter = stockBefore + quantity;
        break;
      case OUT:
        // Xuất kho: giảm tồn kho
        if (quantity <= 0) {
          throw new IllegalArgumentException("Số lượng xuất kho phải lớn hơn 0");
        }
        if (stockBefore < quantity) {
          throw new IllegalArgumentException(
              String.format(
                  "Không đủ tồn kho. Tồn kho hiện tại: %d, yêu cầu xuất: %d",
                  stockBefore, quantity));
        }
        stockAfter = stockBefore - quantity;
        break;
      case ADJUSTMENT:
        // Điều chỉnh: quantity là số thay đổi (có thể âm hoặc dương)
        // Ví dụ: quantity = 10 -> tăng 10, quantity = -5 -> giảm 5
        stockAfter = stockBefore + quantity;
        if (stockAfter < 0) {
          throw new IllegalArgumentException("Tồn kho sau điều chỉnh không thể âm: " + stockAfter);
        }
        break;
      default:
        throw new IllegalArgumentException("Loại giao dịch không hợp lệ: " + request.getType());
    }

    // Tạo giao dịch
    StockTransaction transaction = new StockTransaction();
    transaction.setProduct(product);
    transaction.setType(request.getType());
    // Lưu quantity: dương cho IN, âm cho OUT, có thể âm/dương cho ADJUSTMENT
    transaction.setQuantity(request.getType() == StockTransactionType.OUT ? -quantity : quantity);
    transaction.setStockBefore(stockBefore);
    transaction.setStockAfter(stockAfter);
    transaction.setNotes(request.getNotes());
    transaction.setCreatedBy(admin);

    transaction = stockTransactionRepository.save(transaction);

    // Cập nhật tồn kho sản phẩm
    product.setStock(stockAfter);
    productRepository.save(product);

    log.info(
        "Stock transaction created: {} - Product: {} - Type: {} - Quantity: {} - Stock: {} -> {}",
        transaction.getId(),
        product.getName(),
        request.getType(),
        quantity,
        stockBefore,
        stockAfter);

    return stockTransactionMapper.toResponse(transaction);
  }

  @Transactional(readOnly = true)
  public Page<StockTransactionResponse> getStockTransactions(
      Long productId, StockTransactionType type, String keyword, Pageable pageable) {
    // Tính toán pagination
    int page = pageable.getPageNumber();
    int size = pageable.getPageSize();
    long offset = (long) page * size;

    // Convert enum to string for native query
    String typeStr = type != null ? type.name() : null;

    // Đếm tổng số records
    long total = stockTransactionRepository.countStockTransactions(productId, typeStr, keyword);

    // Query với native query
    List<StockTransaction> transactions =
        stockTransactionRepository.searchStockTransactionsNative(
            productId, typeStr, keyword, size, offset);

    // Load relationships cho native query results
    if (!transactions.isEmpty()) {
      List<Long> transactionIds = transactions.stream().map(StockTransaction::getId).toList();
      List<StockTransaction> transactionsWithRelations =
          stockTransactionRepository.findAllById(transactionIds);

      // Map lại để đảm bảo order giữ nguyên
      java.util.Map<Long, StockTransaction> transactionMap =
          transactionsWithRelations.stream()
              .collect(java.util.stream.Collectors.toMap(StockTransaction::getId, t -> t));

      // Replace content với entities có relationships
      transactions.forEach(
          transaction -> {
            StockTransaction fullTransaction = transactionMap.get(transaction.getId());
            if (fullTransaction != null) {
              transaction.setProduct(fullTransaction.getProduct());
              transaction.setCreatedBy(fullTransaction.getCreatedBy());
            }
          });
    }

    // Tạo Page object
    Page<StockTransaction> transactionPage =
        new PageImpl<>(transactions, PageRequest.of(page, size), total);

    return transactionPage.map(stockTransactionMapper::toResponse);
  }

  @Transactional(readOnly = true)
  public StockTransactionResponse getStockTransaction(Long id) {
    StockTransaction transaction =
        stockTransactionRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + id));
    return stockTransactionMapper.toResponse(transaction);
  }

  @Transactional(readOnly = true)
  public Page<StockTransactionResponse> getProductStockHistory(Long productId, Pageable pageable) {
    Page<StockTransaction> transactions =
        stockTransactionRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    return transactions.map(stockTransactionMapper::toResponse);
  }
}
