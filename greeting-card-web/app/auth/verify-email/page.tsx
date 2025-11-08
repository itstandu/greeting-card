'use client';

import { Suspense } from 'react';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { VerifyEmailPage } from '@/components/auth/VerifyEmailPage';

function VerifyEmailContent() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}
    >
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
