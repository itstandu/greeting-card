'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddressManagement } from '@/components/users/AddressManagement';
import { ChangePasswordForm } from '@/components/users/ChangePasswordForm';
import { UpdateProfileForm } from '@/components/users/UpdateProfileForm';
import { useAuth } from '@/hooks/use-auth';

export function ProfileClient() {
  const { isAuthenticated } = useAuth();

  // Note: getCurrentUser is already called by useAuth hook, no need to call it again here
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="py-6">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Đăng nhập để quản lý thông tin tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <p className="text-muted-foreground text-center">
                Vui lòng đăng nhập để truy cập trang thông tin cá nhân.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/register">Đăng ký</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Thông tin cá nhân</h1>
          <p className="text-muted-foreground mt-2 text-sm">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
            <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Quản lý địa chỉ</CardTitle>
                <CardDescription>Thêm, sửa và xóa địa chỉ giao hàng của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <AddressManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>Thay đổi mật khẩu của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
