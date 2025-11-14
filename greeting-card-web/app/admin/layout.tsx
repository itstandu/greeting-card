'use client';

import type { ReactNode } from 'react';
import { AdminRoute } from '@/components/auth/AdminRoute';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminRoute>{children}</AdminRoute>;
}
