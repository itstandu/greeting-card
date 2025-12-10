'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resendVerification, verifyEmail } from '@/services/auth.service';
import { toast } from 'sonner';

type VerificationState = 'idle' | 'verifying' | 'success';

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [isResending, setIsResending] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);

  // Check for token in URL query params when component mounts
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam && tokenParam.trim()) {
      // Auto-verify if token exists in URL
      handleAutoVerify(tokenParam.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Auto-verify when token from URL is available
  const handleAutoVerify = async (token: string) => {
    if (!token || !token.trim()) {
      return;
    }

    setVerificationState('verifying');
    try {
      const response = await verifyEmail(token);
      const message = response.message || 'Email đã được xác thực thành công';
      toast.success(message);
      setVerificationState('success');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch {
      setVerificationState('idle');
    }
  };

  // Resend verification email
  const handleResend = async () => {
    const emailToResend = email.trim();
    if (!emailToResend) {
      toast.error('Gửi email thất bại', {
        description: 'Vui lòng nhập email để gửi lại email xác thực',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToResend)) {
      toast.error('Gửi email thất bại', {
        description: 'Email không hợp lệ. Vui lòng nhập email hợp lệ',
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerification({ email: emailToResend });
      const message = response.message || 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.';
      toast.success('Gửi email thành công', {
        description: message,
      });
      // Clear email input and hide form after successful resend
      setEmail('');
      setShowResendForm(false);
    } catch {
    } finally {
      setIsResending(false);
    }
  };

  // Show loading/verifying state when token from URL is being processed
  if (verificationState === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Xác thực Email</CardTitle>
            <CardDescription>Đang xác thực email của bạn...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
              <p className="text-muted-foreground text-sm">Vui lòng đợi trong giây lát...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state
  if (verificationState === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md py-6">
          <CardHeader>
            <CardTitle>Xác thực Thành Công</CardTitle>
            <CardDescription>Email của bạn đã được xác thực thành công</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground text-center text-sm">
                Bạn sẽ được chuyển hướng đến trang đăng nhập...
              </p>
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                Đi đến đăng nhập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form when no token in URL or verification failed
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Xác thực Email</CardTitle>
          <CardDescription>
            Vui lòng kiểm tra email và click vào link xác thực để hoàn tất đăng ký tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {!showResendForm ? (
              <>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-center text-sm">
                    Chưa nhận được email xác thực?
                  </p>
                  <Button
                    onClick={() => setShowResendForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Gửi lại email xác thực
                  </Button>
                </div>

                <div className="mt-2 text-center text-sm">
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isResending}
                  />
                  <p className="text-muted-foreground text-xs">
                    Nhập email của bạn để nhận lại email xác thực
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleResend}
                    disabled={isResending || !email.trim()}
                    className="flex-1"
                  >
                    {isResending ? 'Đang gửi...' : 'Gửi lại Email'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResendForm(false);
                      setEmail('');
                    }}
                    variant="outline"
                    disabled={isResending}
                  >
                    Hủy
                  </Button>
                </div>

                <div className="mt-2 text-center text-sm">
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
