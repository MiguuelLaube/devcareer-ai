import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg' }: ModalProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs backdrop transition-opacity"
        onClick={onClose}
      />

      {/* Conteúdo do Diálogo */}
      <div
        className={cn(
          'relative z-50 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl enter',
          maxWidth
        )}
      >
        <div className="flex items-start justify-between pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-fg)]">{title}</h2>
            {description && <p className="text-sm text-[var(--color-fg-muted)] mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] pressable cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
