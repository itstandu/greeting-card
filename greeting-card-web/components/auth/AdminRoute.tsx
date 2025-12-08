'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { ShieldAlert } from 'lucide-react';

type AdminRouteProps = {
  children: React.ReactNode;
};

// Mapping các route admin với title tương ứng
const routeTitles: Record<string, string> = {
  '/admin': 'Tổng quan',
  '/admin/orders': 'Đơn hàng',
  '/admin/carts': 'Giỏ hàng',
  '/admin/wishlists': 'Yêu thích',
  '/admin/users': 'Người dùng',
  '/admin/products': 'Sản phẩm',
  '/admin/categories': 'Danh mục',
  '/admin/coupons': 'Khuyến mãi',
  '/admin/stock-transactions': 'Quản lý kho',
  '/admin/notifications': 'Thông báo',
  '/admin/contacts': 'Liên hệ',
};

// Hàm tạo breadcrumbs từ pathname
function generateBreadcrumbs(pathname: string) {
  const breadcrumbs = [
    {
      label: 'Admin',
      href: '/admin',
      isActive: false,
    },
  ];

  // Tìm route khớp nhất
  const matchingRoute = Object.keys(routeTitles)
    .sort((a, b) => b.length - a.length) // Sắp xếp từ dài đến ngắn
    .find(route => pathname === route || pathname.startsWith(route + '/'));

  if (matchingRoute && matchingRoute !== '/admin') {
    breadcrumbs.push({
      label: routeTitles[matchingRoute],
      href: matchingRoute,
      isActive: pathname === matchingRoute,
    });

    // Nếu có sub-route (ví dụ: /admin/orders/123)
    if (pathname !== matchingRoute) {
      const subPath = pathname.replace(matchingRoute + '/', '');
      // Nếu subPath là ID số, hiển thị "Chi tiết"
      if (/^\d+$/.test(subPath)) {
        breadcrumbs.push({
          label: 'Chi tiết',
          href: pathname,
          isActive: true,
        });
      } else {
        // Nếu không phải ID, hiển thị subPath đã format
        breadcrumbs.push({
          label: subPath.charAt(0).toUpperCase() + subPath.slice(1),
          href: pathname,
          isActive: true,
        });
      }
    }
  } else if (pathname === '/admin') {
    breadcrumbs[0].isActive = true;
  }

  return breadcrumbs;
}

// Bảo vệ route dành riêng cho Admin
export function AdminRoute({ children }: AdminRouteProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <Spinner />
          <span>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-10">
        <Card className="mx-auto max-w-xl py-6">
          <CardHeader>
            <CardTitle>Yêu cầu đăng nhập</CardTitle>
            <CardDescription>
              Vui lòng đăng nhập với tài khoản quản trị để tiếp tục.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              Bạn cần đăng nhập để truy cập khu vực quản trị.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="container py-10">
        <Card className="mx-auto max-w-xl">
          <CardHeader className="flex flex-row items-start gap-3">
            <ShieldAlert className="text-destructive mt-1 size-5" />
            <div className="flex flex-col gap-2">
              <CardTitle>Không có quyền truy cập</CardTitle>
              <CardDescription>
                Tài khoản của bạn không có quyền truy cập vào khu vực quản trị.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Nếu bạn nghĩ đây là nhầm lẫn, vui lòng liên hệ quản trị viên để được cấp quyền.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem className="pl-1.5">
                    {crumb.isActive ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-full min-w-0 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
