'use client';

import Link from 'next/link';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin để đăng nhập vào tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Chưa có tài khoản? </span>
            <Link href="/auth/register" className="text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginContent />
    </GuestRoute>
  );
}
