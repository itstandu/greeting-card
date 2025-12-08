'use client';

import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string; // Deprecated: no longer redirects, kept for backward compatibility
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Spinner message="Đang tải..." />;
  }

  return <>{children}</>;
}
