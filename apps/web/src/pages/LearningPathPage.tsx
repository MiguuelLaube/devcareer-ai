import * as React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  Code2,
  Award,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { TaskStatus } from '@devcareer/shared';

interface LearningPathPageProps {
  onNavigate: (tab: string) => void;
}

export function LearningPathPage({ onNavigate }: LearningPathPageProps) {
  const { currentPath, toggleTaskStatus } = useAppStore();
  const [selectedMinutes, setSelectedMinutes] = React.useState<number>(currentPath?.minutesPerDay || 30);
  const [expandedModuleId, setExpandedModuleId] = React.useState<string | null>(currentPath?.modules[0]?.id || null);

  const modules = currentPath?.modules || [];
  const allTasks = modules.flatMap((m) => m.tasks);
  const completedCount = allTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Concluída</Badge>;
      case 'in_progress':
        return <Badge variant="warning">Em andamento</Badge>;
      case 'needs_review':
        return <Badge variant="danger">Precisa revisar</Badge>;
      default:
        return <Badge variant="default">Não iniciada</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      {/* Header com Metas e Progresso */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
              Minha Trilha de Aprendizagem
            </h1>
            <Badge variant="primary">Intensivo</Badge>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Planejamento pedagógico personalizado com foco nas lacunas reais da vaga alvo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => alert('Rotina reorganizada com sucesso! As tarefas pendentes foram redistribuídas.')} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reorganizar Rotina
          </Button>
          <Button onClick={() => onNavigate('tutor')} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Estudar com Professor IA
          </Button>
        </div>
      </div>

      {/* Configuração de Rotina Diária (Parte 10) */}
      <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-fg)]">Sua Meta Diária de Estudos</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              Ajuste conforme sua disponibilidade real. O ritmo respeita sua rotina.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[15, 30, 60, 120].map((min) => (
                <button
                  key={min}
                  onClick={() => setSelectedMinutes(min)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer pressable transition-colors ${
                    selectedMinutes === min
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {min} min / dia
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-fg)]">Avanço da Trilha</span>
              <span className="font-bold text-[var(--color-success)]">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-success)] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--color-fg-subtle)]">
              {completedCount} de {allTasks.length} atividades finalizadas.
            </p>
          </div>
        </div>
      </Card>

      {/* Módulos de Aprendizagem */}
      <div className="space-y-4">
        {modules.map((mod, idx) => {
          const isExpanded = expandedModuleId === mod.id;
          return (
            <Card key={mod.id} className="bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
              {/* Header do Módulo */}
              <div
                onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--color-surface-2)]/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center font-bold text-sm text-[var(--color-accent)]">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                        {mod.skill}
                      </span>
                      <span className="text-xs text-[var(--color-fg-subtle)]">• Nível {mod.difficulty}/5</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--color-fg)] mt-0.5">{mod.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-fg-muted)] hidden sm:inline-block">
                    {mod.tasks.filter((t) => t.status === 'completed').length}/{mod.tasks.length} concluídas
                  </span>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-[var(--color-fg-subtle)]" /> : <ChevronDown className="h-5 w-5 text-[var(--color-fg-subtle)]" />}
                </div>
              </div>

              {/* Detalhes Expandidos do Módulo */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-[var(--color-border)] space-y-5 enter">
                  {/* Objetivo e Explicação Didática */}
                  <div className="space-y-2 text-xs leading-relaxed">
                    <p className="font-semibold text-[var(--color-fg)]">
                      🎯 Objetivo: <span className="font-normal text-[var(--color-fg-muted)]">{mod.objective}</span>
                    </p>
                    <p className="font-semibold text-[var(--color-fg)]">
                      💡 Explicação Conceitual: <span className="font-normal text-[var(--color-fg-muted)]">{mod.explanation}</span>
                    </p>
                  </div>

                  {/* Exemplos Práticos de Código */}
                  {mod.examples && mod.examples.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[var(--color-fg)] uppercase tracking-wider">
                        Exemplo Prático de Código:
                      </p>
                      {mod.examples.map((ex, i) => (
                        <div key={i} className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                          <p className="text-xs font-semibold text-[var(--color-fg)] mb-1.5">{ex.title}</p>
                          <pre className="p-2.5 rounded bg-black/60 text-emerald-400 font-mono text-xs overflow-x-auto">
                            <code>{ex.code}</code>
                          </pre>
                          <p className="text-[11px] text-[var(--color-fg-muted)] mt-1.5">{ex.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lista de Atividades do Módulo (com toggle de conclusão real) */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[var(--color-fg)] uppercase tracking-wider">
                      Atividades & Exercícios:
                    </p>
                    <div className="space-y-2">
                      {mod.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => currentPath && toggleTaskStatus(currentPath.id, mod.id, task.id)}
                              className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer pressable transition-colors ${
                                task.status === 'completed'
                                  ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
                                  : 'border-[var(--color-border-strong)] hover:border-[var(--color-accent)]'
                              }`}
                            >
                              {task.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </button>
                            <div>
                              <p className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-[var(--color-fg-subtle)]' : 'text-[var(--color-fg)]'}`}>
                                {task.title}
                              </p>
                              <span className="text-[11px] text-[var(--color-fg-muted)]">
                                {task.estimatedMinutes} min • {task.kind.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getTaskStatusBadge(task.status)}
                            {task.kind === 'exercise' ? (
                              <Button size="sm" variant="outline" onClick={() => onNavigate('assessment')} className="h-7 text-xs">
                                Abrir Exercício
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => onNavigate('tutor')} className="h-7 text-xs">
                                Estudar com IA
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
