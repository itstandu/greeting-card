'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Package } from 'lucide-react';

interface CheckoutNotesFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function CheckoutNotesForm({ notes, onNotesChange }: CheckoutNotesFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ghi chú đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Ghi chú về đơn hàng, ví dụ: yêu cầu giao hàng vào buổi sáng..."
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={3}
        />
      </CardContent>
    </Card>
  );
}
