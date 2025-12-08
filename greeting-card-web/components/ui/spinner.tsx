import type { LucideProps } from 'lucide-react';
import { LoaderIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SpinnerProps extends Omit<LucideProps, 'ref'> {
  message?: string;
}

function Spinner({ className, message, ...props }: SpinnerProps) {
  // If message is provided, show full-screen loading with message
  if (message) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon
            role="status"
            aria-label={message}
            className={cn('size-8 animate-spin text-primary', className)}
            {...props}
          />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  // Otherwise, return just the spinner icon
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
