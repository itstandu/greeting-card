'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  defaultVisible?: boolean;
}

function PasswordInput({ className, defaultVisible = false, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(defaultVisible);

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <div className="relative">
      <Input type={isVisible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {isVisible ? (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export { PasswordInput };
