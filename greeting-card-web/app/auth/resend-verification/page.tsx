'use client';

import Link from 'next/link';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ResendVerificationForm } from '@/components/auth/ResendVerificationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ResendVerificationContent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Gửi lại Email Xác Thực</CardTitle>
          <CardDescription>Nhập email của bạn để nhận lại email xác thực tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <ResendVerificationForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResendVerificationPage() {
  return (
    <GuestRoute>
      <ResendVerificationContent />
    </GuestRoute>
  );
}
