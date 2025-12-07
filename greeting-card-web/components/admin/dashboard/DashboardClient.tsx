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

  type SectionKey =
    | 'stats'
    | 'revenue'
    | 'categorySales'
    | 'customerGrowth'
    | 'orderStatus'
    | 'latestOrders'
    | 'bestSelling'
    | 'lowStock';

  type SectionStatus = 'idle' | 'loading' | 'success' | 'error';

  const [sectionStatus, setSectionStatus] = useState<Record<SectionKey, SectionStatus>>({
    stats: 'idle',
    revenue: 'idle',
    categorySales: 'idle',
    customerGrowth: 'idle',
    orderStatus: 'idle',
    latestOrders: 'idle',
    bestSelling: 'idle',
    lowStock: 'idle',
  });

  const [sectionErrors, setSectionErrors] = useState<Record<SectionKey, string | null>>({
    stats: null,
    revenue: null,
    categorySales: null,
    customerGrowth: null,
    orderStatus: null,
    latestOrders: null,
    bestSelling: null,
    lowStock: null,
  });

  useEffect(() => {
    let isActive = true;

    const updateStatus = (key: SectionKey, status: SectionStatus) => {
      setSectionStatus(prev => ({ ...prev, [key]: status }));
    };

    const updateError = (key: SectionKey, message: string | null) => {
      setSectionErrors(prev => ({ ...prev, [key]: message }));
    };

    const fetchInOrder = async () => {
      const steps: Array<{
        key: SectionKey;
        fetcher: () => Promise<{ data: unknown }>;
        onSuccess: (data: unknown) => void;
      }> = [
        {
          key: 'stats',
          fetcher: () => getDashboardStats(),
          onSuccess: data => setStats(data as DashboardStats),
        },
        {
          key: 'revenue',
          fetcher: () => getRevenueSummary('daily', 30),
          onSuccess: data => setRevenueSummary(data as RevenueSummary[]),
        },
        {
          key: 'categorySales',
          fetcher: () => getCategorySales(),
          onSuccess: data => setCategorySales(data as CategorySales[]),
        },
        {
          key: 'customerGrowth',
          fetcher: () => getCustomerGrowth('daily', 30),
          onSuccess: data => setCustomerGrowth(data as CustomerGrowth[]),
        },
        {
          key: 'orderStatus',
          fetcher: () => getOrderStatusDistribution(),
          onSuccess: data => setOrderStatusDistribution(data as OrderStatusDistribution[]),
        },
        {
          key: 'latestOrders',
          fetcher: () => getLatestOrders(10),
          onSuccess: data => setLatestOrders(data as OrderSimple[]),
        },
        {
          key: 'bestSelling',
          fetcher: () => getBestSellingProducts(5),
          onSuccess: data => setBestSellingProducts(data as BestSellingProduct[]),
        },
        {
          key: 'lowStock',
          fetcher: () => getLowStockProducts(10, 10),
          onSuccess: data => setLowStockProducts(data as LowStockProduct[]),
        },
      ];

      for (const step of steps) {
        if (!isActive) return;

        updateStatus(step.key, 'loading');
        updateError(step.key, null);

        try {
          const response = await step.fetcher();
          if (!isActive) return;

          step.onSuccess(response.data);
          updateStatus(step.key, 'success');
        } catch (err) {
          if (!isActive) return;
          const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu';
          updateError(step.key, message);
          updateStatus(step.key, 'error');
        }
      }
    };

    fetchInOrder();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      {/* Stats Cards */}
      {sectionErrors.stats && (
        <Alert variant="destructive" className="mb-2">
          <AlertTitle>Lỗi tải thống kê</AlertTitle>
          <AlertDescription>{sectionErrors.stats}</AlertDescription>
        </Alert>
      )}

      {['loading', 'idle'].includes(sectionStatus.stats) ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      {/* Revenue Chart */}
      {sectionErrors.revenue && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Lỗi tải doanh thu</AlertTitle>
          <AlertDescription>{sectionErrors.revenue}</AlertDescription>
        </Alert>
      )}

      {['loading', 'idle'].includes(sectionStatus.revenue) ? (
        <Skeleton className="mt-4 h-[400px]" />
      ) : revenueSummary && revenueSummary.length > 0 ? (
        <RevenueChart data={revenueSummary} />
      ) : (
        <Alert className="mt-4" variant="default">
          <AlertTitle>Chưa có dữ liệu doanh thu</AlertTitle>
          <AlertDescription>Hệ thống sẽ hiển thị khi có dữ liệu mới.</AlertDescription>
        </Alert>
      )}

      {/* Category Sales - Full Width */}
      {sectionErrors.categorySales && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Lỗi tải doanh số theo danh mục</AlertTitle>
          <AlertDescription>{sectionErrors.categorySales}</AlertDescription>
        </Alert>
      )}

      {['loading', 'idle'].includes(sectionStatus.categorySales) ? (
        <Skeleton className="mt-4 h-[300px]" />
      ) : categorySales && categorySales.length > 0 ? (
        <CategorySalesChart data={categorySales} />
      ) : (
        <Alert className="mt-4" variant="default">
          <AlertTitle>Chưa có dữ liệu danh mục</AlertTitle>
          <AlertDescription>Thêm đơn hàng để xem báo cáo theo danh mục.</AlertDescription>
        </Alert>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {sectionErrors.customerGrowth && (
            <Alert variant="destructive">
              <AlertTitle>Lỗi tải tăng trưởng khách hàng</AlertTitle>
              <AlertDescription>{sectionErrors.customerGrowth}</AlertDescription>
            </Alert>
          )}

          {['loading', 'idle'].includes(sectionStatus.customerGrowth) ? (
            <Skeleton className="h-[300px]" />
          ) : customerGrowth && customerGrowth.length > 0 ? (
            <CustomerGrowthChart data={customerGrowth} />
          ) : (
            <Alert variant="default">
              <AlertTitle>Chưa có dữ liệu tăng trưởng</AlertTitle>
              <AlertDescription>Chưa ghi nhận khách hàng mới.</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          {sectionErrors.orderStatus && (
            <Alert variant="destructive">
              <AlertTitle>Lỗi tải trạng thái đơn hàng</AlertTitle>
              <AlertDescription>{sectionErrors.orderStatus}</AlertDescription>
            </Alert>
          )}

          {['loading', 'idle'].includes(sectionStatus.orderStatus) ? (
            <Skeleton className="h-[300px]" />
          ) : orderStatusDistribution && orderStatusDistribution.length > 0 ? (
            <OrderStatusChart data={orderStatusDistribution} />
          ) : (
            <Alert variant="default">
              <AlertTitle>Chưa có dữ liệu trạng thái</AlertTitle>
              <AlertDescription>Đơn hàng sẽ hiển thị khi có giao dịch.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Latest Orders */}
      {sectionErrors.latestOrders && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Lỗi tải đơn hàng mới</AlertTitle>
          <AlertDescription>{sectionErrors.latestOrders}</AlertDescription>
        </Alert>
      )}

      {['loading', 'idle'].includes(sectionStatus.latestOrders) ? (
        <Skeleton className="mt-4 h-80" />
      ) : latestOrders && latestOrders.length > 0 ? (
        <LatestOrdersTable orders={latestOrders} />
      ) : (
        <Alert className="mt-4" variant="default">
          <AlertTitle>Chưa có đơn hàng</AlertTitle>
          <AlertDescription>Tạo đơn hàng để xem bảng cập nhật.</AlertDescription>
        </Alert>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          {sectionErrors.bestSelling && (
            <Alert variant="destructive" className="mb-2">
              <AlertTitle>Lỗi tải sản phẩm bán chạy</AlertTitle>
              <AlertDescription>{sectionErrors.bestSelling}</AlertDescription>
            </Alert>
          )}

          {['loading', 'idle'].includes(sectionStatus.bestSelling) ? (
            <Skeleton className="h-80" />
          ) : bestSellingProducts && bestSellingProducts.length > 0 ? (
            <BestSellingProductsTable products={bestSellingProducts} />
          ) : (
            <Alert variant="default">
              <AlertTitle>Chưa có dữ liệu bán chạy</AlertTitle>
              <AlertDescription>Chờ thêm giao dịch để hiển thị.</AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          {sectionErrors.lowStock && (
            <Alert variant="destructive" className="mb-2">
              <AlertTitle>Lỗi tải tồn kho thấp</AlertTitle>
              <AlertDescription>{sectionErrors.lowStock}</AlertDescription>
            </Alert>
          )}

          {['loading', 'idle'].includes(sectionStatus.lowStock) ? (
            <Skeleton className="h-80" />
          ) : lowStockProducts && lowStockProducts.length > 0 ? (
            <LowStockProductsTable products={lowStockProducts} />
          ) : (
            <Alert variant="default">
              <AlertTitle>Kho đang đủ hàng</AlertTitle>
              <AlertDescription>Chưa có sản phẩm nào sắp hết.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}
