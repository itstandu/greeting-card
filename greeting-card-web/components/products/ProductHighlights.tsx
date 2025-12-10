'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Award, Gift, RefreshCcw, Shield } from 'lucide-react';

const productHighlights = [
  { icon: Award, text: 'Chất lượng cao cấp', color: 'text-amber-600' },
  { icon: Gift, text: 'Đóng gói đẹp mắt', color: 'text-pink-600' },
  { icon: RefreshCcw, text: 'Đổi trả dễ dàng', color: 'text-blue-600' },
  { icon: Shield, text: 'Bảo hành chính hãng', color: 'text-green-600' },
];

interface ProductHighlightsProps {
  variant?: 'desktop' | 'mobile';
}

export function ProductHighlights({ variant = 'desktop' }: ProductHighlightsProps) {
  return (
    <div
      className={
        variant === 'desktop'
          ? 'hidden grid-cols-2 gap-3 lg:grid'
          : 'grid grid-cols-2 gap-3 lg:hidden'
      }
    >
      {productHighlights.map((highlight, index) => {
        const Icon = highlight.icon;
        return (
          <Card key={index} className="border-dashed">
            <CardContent className="flex items-center gap-3 px-3">
              <Icon className={`h-5 w-5 ${highlight.color}`} />
              <span className="text-sm font-medium">{highlight.text}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
