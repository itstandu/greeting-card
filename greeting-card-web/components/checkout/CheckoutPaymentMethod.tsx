'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PaymentMethod } from '@/types';
import { CreditCard } from 'lucide-react';

interface CheckoutPaymentMethodProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: number | null;
  onPaymentMethodSelect: (methodId: number) => void;
}

export function CheckoutPaymentMethod({
  paymentMethods,
  selectedPaymentMethodId,
  onPaymentMethodSelect,
}: CheckoutPaymentMethodProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Phương thức thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPaymentMethodId?.toString()}
          onValueChange={value => onPaymentMethodSelect(parseInt(value))}
        >
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors ${
                selectedPaymentMethodId === method.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onPaymentMethodSelect(method.id)}
            >
              <RadioGroupItem value={method.id.toString()} id={`payment-${method.id}`} />
              <div className="flex-1">
                <Label htmlFor={`payment-${method.id}`} className="cursor-pointer font-semibold">
                  {method.name}
                </Label>
                {method.description && (
                  <p className="text-muted-foreground text-sm">{method.description}</p>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
