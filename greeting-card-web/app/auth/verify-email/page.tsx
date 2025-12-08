'use client';

import { Spinner } from '@/components/ui/spinner';
import { Suspense } from 'react';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { VerifyEmailPage } from '@/components/auth/VerifyEmailPage';

function VerifyEmailContent() {
  return (
    <Suspense fallback={<Spinner message="Đang tải..." />}>
      <VerifyEmailPage />
    </Suspense>
  );
}

export default function VerifyEmail() {
  return (
    <GuestRoute>
      <VerifyEmailContent />
    </GuestRoute>
  );
}
