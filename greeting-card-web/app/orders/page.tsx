'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserOrdersClient } from '@/components/orders/UserOrdersClient';

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <UserOrdersClient />
    </ProtectedRoute>
  );
}
