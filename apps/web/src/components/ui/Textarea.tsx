import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[var(--color-fg-muted)]">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:border-[var(--color-accent)] focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
