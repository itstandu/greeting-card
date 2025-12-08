'use client';

import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = '/' }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <Spinner message="Đang tải..." />;
  }

  // If authenticated, don't render children (will redirect)
  if (isAuthenticated) {
    return <Spinner message="Đang chuyển hướng..." />;
  }

  // Only render children for guests
  return <>{children}</>;
}
