'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, XCircle } from 'lucide-react';

interface PaymentErrorStateProps {
  error: string;
}

export function PaymentErrorState({ error }: PaymentErrorStateProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="text-destructive mb-4 h-12 w-12" />
            <p className="mb-4 text-lg font-semibold">Lỗi</p>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đơn hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
