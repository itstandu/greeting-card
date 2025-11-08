'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';

export function HeaderWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Không hiển thị Header trong admin route vì admin có header riêng
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <Header />
    </>
  );
}
