'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotificationList } from '@/components/notifications';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationList />
    </ProtectedRoute>
  );
}
