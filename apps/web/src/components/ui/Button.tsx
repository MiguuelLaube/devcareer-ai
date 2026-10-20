import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed pressable select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm',
        secondary:
          'bg-[var(--color-surface-2)] text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)]',
        outline:
          'border border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]',
        ghost:
          'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]',
        danger:
          'bg-[var(--color-danger)] text-white hover:opacity-90 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
