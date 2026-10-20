import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/layout/Navbar';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { JobAnalysisPage } from '@/pages/JobAnalysisPage';
import { ResumePage } from '@/pages/ResumePage';
import { LearningPathPage } from '@/pages/LearningPathPage';
import { TutorPage } from '@/pages/TutorPage';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { Toaster, toast } from 'sonner';

export function App() {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();
  const [currentTab, setCurrentTab] = React.useState<string>('landing');

  React.useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Mantém estado de tab sincronizado quando faz login ou logout
  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (currentTab === 'landing' || currentTab === 'auth') {
          setCurrentTab('dashboard');
        }
      } else {
        if (currentTab !== 'auth' && currentTab !== 'landing') {
          setCurrentTab('landing');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentTab]);

  const navigateTo = (tab: string) => {
    const protectedTabs = ['dashboard', 'job-analysis', 'resumes', 'learning', 'tutor', 'assessment', 'portfolio', 'applications', 'profile'];
    if (protectedTabs.includes(tab) && !isAuthenticated) {
      toast.info('Faça login para acessar esta funcionalidade.');
      setCurrentTab('auth');
      return;
    }
    setCurrentTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent spin" />
          <p className="text-xs text-[var(--color-fg-muted)] tracking-wider uppercase font-semibold">
            Iniciando DevCareer AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex flex-col font-sans selection:bg-[var(--color-accent)]/30">
      {/* Toast Notifier do Sonner */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-2)',
            color: 'var(--color-fg)',
            border: '1px solid var(--color-border)',
          },
        }}
      />

      {/* Navbar Superior */}
      <Navbar currentTab={currentTab} onTabChange={navigateTo} />

      {/* Roteamento de Telas */}
      <main className="flex-1 pb-16">
        {currentTab === 'landing' && (
          <LandingPage onStart={() => navigateTo(isAuthenticated ? 'dashboard' : 'auth')} />
        )}

        {currentTab === 'auth' && (
          <AuthPage
            onSuccess={() => {
              setCurrentTab('dashboard');
              toast.success('Bem-vindo ao DevCareer AI!');
            }}
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
        {currentTab === 'job-analysis' && <JobAnalysisPage onNavigate={setCurrentTab} />}
        {currentTab === 'resumes' && <ResumePage onNavigate={setCurrentTab} />}
        {currentTab === 'learning' && <LearningPathPage onNavigate={setCurrentTab} />}
        {currentTab === 'tutor' && <TutorPage />}
        {currentTab === 'assessment' && <AssessmentPage onNavigate={setCurrentTab} />}
        {currentTab === 'portfolio' && <PortfolioPage />}
        {currentTab === 'applications' && <ApplicationsPage />}
        {currentTab === 'profile' && <ProfilePage />}
      </main>

      {/* Rodapé Sóbrio */}
      <footer className="border-t border-[var(--color-border)] py-6 bg-[var(--color-surface)] text-center text-xs text-[var(--color-fg-subtle)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} DevCareer AI. Preparação de carreira e aceleração profissional em TI.</p>
          <div className="flex items-center gap-4">
            <span className="text-[var(--color-success)] font-medium">● Integridade Sem Alucinação</span>
            <span>Design Engineering</span>
            <button
              onClick={() => setCurrentTab('profile')}
              className="text-[var(--color-accent)] hover:underline"
            >
              Privacidade LGPD
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
