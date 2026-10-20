import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Briefcase,
  BookOpen,
  FileText,
  Bot,
  Code2,
  FolderGit2,
  CheckSquare,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'job-analysis', label: 'Analisar Vaga', icon: Sparkles },
    { id: 'resumes', label: 'Currículo IA', icon: FileText },
    { id: 'learning', label: 'Trilha de Estudos', icon: BookOpen },
    { id: 'tutor', label: 'Professor IA', icon: Bot },
    { id: 'assessment', label: 'Exercícios', icon: Code2 },
    { id: 'portfolio', label: 'Portfólio', icon: FolderGit2 },
    { id: 'applications', label: 'Candidaturas', icon: CheckSquare },
    { id: 'profile', label: 'Meu Perfil', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo DevCareer AI */}
        <div
          onClick={() => onTabChange(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer pressable select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[#5c4ce6] shadow-sm">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[var(--color-fg)]">DevCareer</span>
            <span className="text-xs font-semibold uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded-sm bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
              AI
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer pressable',
                    isActive
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-border)]'
                      : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-fg-subtle)]')} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* User Status & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-block text-xs font-medium text-[var(--color-fg-muted)]">
                {user?.fullName || 'Desenvolvedor'}
              </span>
              <button
                onClick={logout}
                title="Sair da conta"
                className="rounded-lg p-2 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-2)] pressable cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-lg p-2 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] pressable cursor-pointer"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onTabChange('auth')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] pressable cursor-pointer"
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer (conforme mobile-native: touch-action, user-select: none, animação rápida) */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 space-y-1 enter">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer pressable',
                  isActive
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
