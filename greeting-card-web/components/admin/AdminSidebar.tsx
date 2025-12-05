'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  Bell,
  CreditCard,
  FolderTree,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
  PhoneCall,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const items = [
    {
      title: 'Tổng quan',
      url: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Đơn hàng',
      url: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      title: 'Giỏ hàng',
      url: '/admin/carts',
      icon: ShoppingCart,
    },
    {
      title: 'Yêu thích',
      url: '/admin/wishlists',
      icon: Heart,
    },
    {
      title: 'Người dùng',
      url: '/admin/users',
      icon: Users,
    },
    {
      title: 'Sản phẩm',
      url: '/admin/products',
      icon: Package,
    },
    {
      title: 'Danh mục',
      url: '/admin/categories',
      icon: FolderTree,
    },
    {
      title: 'Khuyến mãi',
      url: '/admin/coupons',
      icon: Tag,
    },
    {
      title: 'Quản lý kho',
      url: '/admin/stock-transactions',
      icon: Warehouse,
    },
    {
      title: 'Đánh giá',
      url: '/admin/reviews',
      icon: MessageSquare,
    },
    {
      title: 'Liên hệ',
      url: '/admin/contacts',
      icon: PhoneCall,
    },
    {
      title: 'Phương thức thanh toán',
      url: '/admin/payment-methods',
      icon: CreditCard,
    },
    {
      title: 'Thông báo',
      url: '/admin/notifications',
      icon: Bell,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-4">
          <ShoppingBag className="size-6" />
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-xl font-semibold">Greeting Card</span>
            <span className="text-muted-foreground text-xs">Admin Panel</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                // Special handling for /admin to only be active when exactly /admin
                const isActive =
                  item.url === '/admin'
                    ? pathname === '/admin'
                    : pathname === item.url || pathname.startsWith(item.url + '/');

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Home />
                <span>Quay về trang chủ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()}>
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
