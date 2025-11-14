'use client';

import { useEffect, useState } from 'react';
import {
  BestSellingProductsTable,
  CategorySalesChart,
  CustomerGrowthChart,
  LatestOrdersTable,
  LowStockProductsTable,
  OrderStatusChart,
  RevenueChart,
  StatsCard,
} from '@/components/admin/dashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  getBestSellingProducts,
  getCategorySales,
  getCustomerGrowth,
  getDashboardStats,
  getLatestOrders,
  getLowStockProducts,
  getOrderStatusDistribution,
  getRevenueSummary,
} from '@/services';
import type {
  BestSellingProduct,
  CategorySales,
  CustomerGrowth,
  DashboardStats,
  LowStockProduct,
  OrderSimple,
  OrderStatusDistribution,
  RevenueSummary,
} from '@/types';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary[] | null>(null);
  const [latestOrders, setLatestOrders] = useState<OrderSimple[] | null>(null);
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[] | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[] | null>(null);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<
    OrderStatusDistribution[] | null
  >(null);
  const [categorySales, setCategorySales] = useState<CategorySales[] | null>(null);
  const [customerGrowth, setCustomerGrowth] = useState<CustomerGrowth[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          statsRes,
          revenueRes,
          ordersRes,
          productsRes,
          lowStockRes,
          statusDistRes,
          categorySalesRes,
          customerGrowthRes,
        ] = await Promise.all([
          getDashboardStats(),
          getRevenueSummary('daily', 30),
          getLatestOrders(10),
          getBestSellingProducts(5),
          getLowStockProducts(10, 10),
          getOrderStatusDistribution(),
          getCategorySales(),
          getCustomerGrowth('daily', 30),
        ]);

        setStats(statsRes.data);
        setRevenueSummary(revenueRes.data);
        setLatestOrders(ordersRes.data);
        setBestSellingProducts(productsRes.data);
        setLowStockProducts(lowStockRes.data);
        setOrderStatusDistribution(statusDistRes.data);
        setCategorySales(categorySalesRes.data);
        setCustomerGrowth(customerGrowthRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[300px]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng người dùng"
          value={stats?.totalUsers.toLocaleString('vi-VN') || '0'}
          icon={Users}
          description="Người dùng đã đăng ký"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={stats?.totalOrders.toLocaleString('vi-VN') || '0'}
          icon={ShoppingCart}
          description="Đơn hàng đã tạo"
        />
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          description="Doanh thu tích lũy"
        />
        <StatsCard
          title="Tổng sản phẩm"
          value={stats?.totalProducts.toLocaleString('vi-VN') || '0'}
          icon={Package}
          description="Sản phẩm trong kho"
        />
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Đơn hàng hôm nay"
          value={stats?.todayOrders.toLocaleString('vi-VN') || '0'}
          icon={ShoppingCart}
          description="Đơn hàng được tạo hôm nay"
        />
        <StatsCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats?.todayRevenue || 0)}
          icon={DollarSign}
          description="Doanh thu trong ngày"
        />
        <StatsCard
          title="Sản phẩm đang bán"
          value={stats?.activeProducts.toLocaleString('vi-VN') || '0'}
          icon={Package}
          description="Sản phẩm đang hoạt động"
        />
        <StatsCard
          title="Giá trị đơn trung bình"
          value={formatCurrency(stats?.averageOrderValue || 0)}
          icon={DollarSign}
          description="Trung bình mỗi đơn hàng"
        />
      </div>

      {/* Revenue Chart */}
      {revenueSummary && revenueSummary.length > 0 && <RevenueChart data={revenueSummary} />}

      {/* Category Sales - Full Width */}
      {categorySales && categorySales.length > 0 && <CategorySalesChart data={categorySales} />}

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer Growth */}
        {customerGrowth && customerGrowth.length > 0 && (
          <CustomerGrowthChart data={customerGrowth} />
        )}

        {/* Order Status Distribution */}
        {orderStatusDistribution && orderStatusDistribution.length > 0 && (
          <OrderStatusChart data={orderStatusDistribution} />
        )}
      </div>

      {/* Latest Orders */}
      {latestOrders && <LatestOrdersTable orders={latestOrders} />}

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Best Selling Products */}
        {bestSellingProducts && <BestSellingProductsTable products={bestSellingProducts} />}

        {/* Low Stock Products */}
        {lowStockProducts && <LowStockProductsTable products={lowStockProducts} />}
      </div>
    </>
  );
}
