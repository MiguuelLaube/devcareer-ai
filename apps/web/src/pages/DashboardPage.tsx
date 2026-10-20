import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  Layers,
  Code2,
} from 'lucide-react';
import { formatMinutes } from '@/lib/utils';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuthStore();
  const { jobs, resumes, currentJob, learningPaths, applications, stats } = useAppStore();

  const activePath = learningPaths[0];
  const allTasks = activePath?.modules?.flatMap((m) => m.tasks) || [];
  const completedTasks = allTasks.filter((t) => t.status === 'completed');
  const pendingTasks = allTasks.filter((t) => t.status !== 'completed');
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      {/* Top Banner & Saudação Personalizada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
            Olá, {user?.fullName || 'Desenvolvedor'} 👋
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Aqui está o diagnóstico do seu progresso rumo à sua próxima oportunidade em TI.
          </p>
        </div>

        <Button size="lg" onClick={() => onNavigate('job-analysis')} className="gap-2 shadow-md">
          <Sparkles className="h-4 w-4" />
          Analisar Nova Vaga
        </Button>
      </div>

      {/* Grid de Métricas Principais (Dados Reais Persistidos) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-[var(--color-surface)] border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-muted)]">Vagas Analisadas</p>
              <p className="text-xl font-bold text-[var(--color-fg)] mt-0.5">{jobs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--color-info-soft)] text-[var(--color-info)]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-muted)]">Candidaturas</p>
              <p className="text-xl font-bold text-[var(--color-fg)] mt-0.5">{applications.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-muted)]">Currículos IA</p>
              <p className="text-xl font-bold text-[var(--color-fg)] mt-0.5">{resumes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-muted)]">Em Evolução</p>
              <p className="text-xl font-bold text-[var(--color-fg)] mt-0.5">{stats.developingSkillsCount} skills</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border-[var(--color-border)] col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-muted)]">Tempo de Estudo</p>
              <p className="text-xl font-bold text-[var(--color-fg)] mt-0.5">{formatMinutes(stats.studyMinutesTotal)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Destaque: "Minha Próxima Oportunidade" (Parte 6) */}
      {currentJob ? (
        <Card className="border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-2)] p-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary">Minha Próxima Oportunidade Alvo</Badge>
                <span className="text-xs text-[var(--color-fg-subtle)]">Preparação Ativa</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">
                {currentJob.title}
              </h2>
              <p className="text-sm text-[var(--color-fg-muted)]">
                Empresa: <strong className="text-[var(--color-fg)]">{currentJob.company}</strong> | Nível: {currentJob.analysis?.seniority || 'Júnior'}
              </p>
              {/* Compatibilidade transparente */}
              <div className="pt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center font-bold text-xs text-[var(--color-accent)]">
                    {currentJob.analysis?.compatibilityScore || 0}%
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-fg)]">Compatibilidade Real</p>
                    <p className="text-[11px] text-[var(--color-fg-muted)]">Critérios objetivos verificados</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => onNavigate('resumes')}>
                Ver Currículo Adaptado
              </Button>
              <Button onClick={() => onNavigate('learning')}>
                Continuar Trilha de Estudos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-[var(--color-surface)] border-dashed border-[var(--color-border-strong)]">
          <p className="text-sm text-[var(--color-fg-muted)]">Você ainda não tem uma vaga alvo em preparação ativa.</p>
          <Button onClick={() => onNavigate('job-analysis')} className="mt-4">
            Analisar Minha Primeira Vaga
          </Button>
        </Card>
      )}

      {/* Grid de 2 Colunas: Trilha de Estudos & Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Progresso dos Estudos e Próximas Tarefas */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[var(--color-surface)]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Plano de Estudos em Andamento</CardTitle>
                <CardDescription>{activePath?.title || 'Trilha de Habilidades'}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('learning')}>
                Ver Trilha Completa
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Barra de Progresso Real */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-[var(--color-fg-muted)]">Progresso Geral</span>
                  <span className="text-[var(--color-success)] font-semibold">{progressPercent}% Concluído</span>
                </div>
                <div className="h-2 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-success)] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Lista de Próximas Tarefas */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                  Próximas Atividades Recomendadas
                </p>
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onNavigate(task.kind === 'exercise' ? 'assessment' : 'learning')}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] cursor-pointer pressable transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-accent)]">
                        {task.kind === 'exercise' ? <Code2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-fg)]">{task.title}</p>
                        <p className="text-[11px] text-[var(--color-fg-muted)]">Estimado: {task.estimatedMinutes} min</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--color-fg-subtle)]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projetos de Portfólio Recomendados */}
          <Card className="bg-[var(--color-surface)]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Projetos de Portfólio Obrigatórios</CardTitle>
                <CardDescription>Evidências práticas para o currículo sem mentiras</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('portfolio')}>
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-fg)]">Banco de Dados SQL</span>
                    <Badge variant="warning">Em andamento</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2">
                    Modelagem e consultas relacionais com JOIN para demonstrar domínio em banco de dados.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-fg)]">API REST com Express</span>
                    <Badge variant="default">Sugerido</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2">
                    CRUD completo com tipagem estática Zod e tratamento de status codes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Vagas e Candidaturas Recentes */}
        <div className="space-y-6">
          <Card className="bg-[var(--color-surface)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Últimas Vagas Analisadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  onClick={() => onNavigate('job-analysis')}
                  className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] cursor-pointer pressable transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-fg)]">{j.title}</span>
                    <span className="text-[11px] font-semibold text-[var(--color-accent)]">
                      {j.analysis?.compatibilityScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-fg-muted)]">{j.company}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dica do Mentor IA */}
          <Card className="bg-[var(--color-accent-soft)] border-[var(--color-accent)]/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)]">
              <Award className="h-4 w-4" />
              Orientação do Mentor de Carreira
            </div>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
              Você já domina React e Git! Para atingir 85% de compatibilidade na vaga de Full-Stack, finalize o exercício prático de SQL hoje (20 min).
            </p>
            <Button size="sm" variant="outline" onClick={() => onNavigate('tutor')} className="w-full mt-2 text-xs">
              Conversar com o Professor IA
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
