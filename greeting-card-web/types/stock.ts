export type StockTransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type StockTransaction = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  type: StockTransactionType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
};

export type CreateStockTransactionRequest = {
  productId: number;
  type: StockTransactionType;
  quantity: number;
  notes?: string;
};

export type StockTransactionFilters = {
  page?: number;
  size?: number;
  productId?: number;
  type?: StockTransactionType;
  keyword?: string;
};
