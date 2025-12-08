import { cn } from '@/lib/utils';
import { LoaderIcon, type LucideProps } from 'lucide-react';

interface SpinnerProps extends Omit<LucideProps, 'ref'> {
  message?: string;
}

function Spinner({ className, message, ...props }: SpinnerProps) {
  // If message is provided, show full-screen loading with message
  if (message) {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon
            role="status"
            aria-label={message}
            className={cn('text-primary size-8 animate-spin', className)}
            {...props}
          />
          <p className="text-muted-foreground text-sm">{message}</p>
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
