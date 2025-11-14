export type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  activeProducts: number;
  lowStockProducts: number;
  averageOrderValue: number;
};

export type RevenueSummary = {
  period: string;
  revenue: number;
  orderCount: number;
};

export type BestSellingProduct = {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  totalSold: number;
  totalRevenue: number;
};

export type LowStockProduct = {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  currentStock: number;
  categoryName: string;
};

export type OrderStatusDistribution = {
  status: string;
  count: number;
  label: string;
};

export type CategorySales = {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  revenue: number;
  orderCount: number;
  productCount: number;
};

export type CustomerGrowth = {
  period: string;
  newUsers: number;
  totalUsers: number;
};
