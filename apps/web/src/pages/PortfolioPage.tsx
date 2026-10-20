import * as React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  FolderGit2,
  CheckCircle2,
  ExternalLink,
  Code2,
  BookOpen,
  Github,
  Plus,
} from 'lucide-react';
import type { PortfolioProject } from '@devcareer/shared';

export function PortfolioPage() {
  const { projects, updateProjectStatus } = useAppStore();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [repoUrlInput, setRepoUrlInput] = React.useState('');

  const handleSaveRepo = (id: string) => {
    updateProjectStatus(id, 'completed', repoUrlInput);
    setEditingId(null);
    setRepoUrlInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
            Projetos Recomendados para Portfólio
          </h1>
          <Badge variant="primary">Evidências Concretas</Badge>
        </div>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Construa projetos reais no GitHub que comprovam suas habilidades para os recrutadores. Apenas projetos finalizados vão para o currículo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <Card key={proj.id} className="bg-[var(--color-surface)] border-[var(--color-border)] flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-border)]">
                      {t}
                    </span>
                  ))}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    proj.status === 'completed'
                      ? 'bg-green-500/10 text-green-400'
                      : proj.status === 'in_progress'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-zinc-500/10 text-zinc-400'
                  }`}
                >
                  {proj.status === 'completed' ? 'Concluído' : proj.status === 'in_progress' ? 'Em Desenvolvimento' : 'Sugerido'}
                </span>
              </div>
              <CardTitle className="text-base">{proj.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">{proj.objective}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0 text-xs">
              {/* Etapas Recomendadas */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-fg)]">Etapas de Execução:</p>
                <ul className="space-y-1 text-[11px] text-[var(--color-fg-muted)]">
                  {proj.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[var(--color-accent)] font-bold">{i + 1}.</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critérios de Conclusão */}
              <div className="space-y-1">
                <p className="font-semibold text-[var(--color-fg)]">Critérios para Validar no Currículo:</p>
                <ul className="space-y-0.5 text-[11px] text-[var(--color-fg-muted)]">
                  {proj.completionCriteria.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-[var(--color-success)] shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Link do Repositório ou Marcar como Concluído */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                {proj.status === 'completed' && proj.repositoryUrl ? (
                  <a
                    href={proj.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    Ver Repositório no GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : editingId === proj.id ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="https://github.com/seu-usuario/seu-projeto"
                      value={repoUrlInput}
                      onChange={(e) => setRepoUrlInput(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveRepo(proj.id)}>Salvar & Concluir</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(proj.id);
                      setRepoUrlInput(proj.repositoryUrl || '');
                    }}
                    className="w-full text-xs gap-1.5"
                  >
                    <FolderGit2 className="h-3.5 w-3.5" />
                    Vincular Repositório do GitHub
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
