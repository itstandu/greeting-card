'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserOrdersClient } from '@/components/orders/UserOrdersClient';
import { Skeleton } from '@/components/ui/skeleton';

function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Đơn hàng của tôi</h1>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<OrdersLoading />}>
        <UserOrdersClient />
      </Suspense>
    </ProtectedRoute>
  );
}
