'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If authenticated, redirect to home; otherwise redirect to login
      router.replace(isAuthenticated ? '/' : '/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return <Spinner message="Đang chuyển hướng..." />;
}
