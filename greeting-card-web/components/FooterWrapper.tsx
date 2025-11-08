'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/home/Footer';

export function FooterWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Không hiển thị Footer trong admin route vì admin có layout riêng
  if (isAdminRoute) {
    return null;
  }

  return <Footer />;
}
