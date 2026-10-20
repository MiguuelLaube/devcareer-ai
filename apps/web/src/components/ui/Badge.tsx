import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-surface-2)] text-[var(--color-fg-muted)] border-[var(--color-border)]',
        primary:
          'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]/30',
        success:
          'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/30',
        warning:
          'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/30',
        danger:
          'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
        info:
          'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
