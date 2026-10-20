import * as React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  Sparkles,
  Download,
  Check,
  X,
  Edit2,
  Eye,
  ShieldCheck,
  AlertCircle,
  Copy,
  Github,
} from 'lucide-react';
import type { ResumeContent, ResumeTemplate, AdaptationMode, ResumeEditOp } from '@devcareer/shared';
import { applyEditOps, applyIdentity, RESUME_TEMPLATE_DEV_INICIANTE } from '@devcareer/shared';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { IdentityForm } from '@/components/resume/IdentityForm';
import { useIdentityStore } from '@/store/useIdentityStore';

interface ResumePageProps {
  onNavigate: (tab: string) => void;
}

export function ResumePage({ onNavigate }: ResumePageProps) {
  const { currentResume, currentVersion, currentJob, applySuggestion, updateResumeContent } = useAppStore();

  const [selectedMode, setSelectedMode] = React.useState<AdaptationMode>('immediate');
  const [selectedTemplate, setSelectedTemplate] = React.useState<ResumeTemplate>('classic');
  const [isAdapting, setIsAdapting] = React.useState(false);
  const [editingSummary, setEditingSummary] = React.useState(false);
  const [summaryText, setSummaryText] = React.useState('');

  const identity = useIdentityStore((s) => s.identity);
  const [instruction, setInstruction] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editNote, setEditNote] = React.useState<string | null>(null);
  const [changedPaths, setChangedPaths] = React.useState<string[]>([]);

  // Conteúdo = modelo estrutural + versão salva + dados do perfil (fonte única do cabeçalho)
  const content: ResumeContent = React.useMemo(
    () => applyIdentity({ ...RESUME_TEMPLATE_DEV_INICIANTE, ...(currentVersion?.content ?? {}) }, identity),
    [currentVersion?.content, identity],
  );

  React.useEffect(() => {
    setSummaryText(content.summary);
  }, [content.summary]);

  const commit = (next: ResumeContent, paths: string[]) => {
    if (currentVersion) updateResumeContent(currentVersion.id, next);
    setChangedPaths(paths);
  };

  const handleInlineEdit = (ops: ResumeEditOp[]) => {
    const { content: next, applied } = applyEditOps(content, ops, identity);
    commit(next, applied.map((o) => o.path));
  };

  const handleAIEdit = async () => {
    if (instruction.trim().length < 3) return;
    setIsEditing(true);
    setEditNote(null);
    try {
      const res = await apiRequest<{ content: ResumeContent; applied: ResumeEditOp[]; note: string }>('/resumes/edit', {
        method: 'POST',
        body: JSON.stringify({ content, instruction, identity }),
      });
      commit(res.content, res.applied.map((o) => o.path));
      setEditNote(res.applied.length ? res.note || 'Alteração aplicada.' : res.note || 'Nada foi alterado.');
      if (res.applied.length) setInstruction('');
    } catch (err: any) {
      setEditNote(err.message || 'Erro ao editar com IA.');
    } finally {
      setIsEditing(false);
    }
  };

  const [isSyncingGithub, setIsSyncingGithub] = React.useState(false);
  const [githubSyncNote, setGithubSyncNote] = React.useState<string | null>(null);

  const handleSyncGithub = async () => {
    if (!identity.githubUrl) {
      setGithubSyncNote('Preencha seu perfil do GitHub nos dados do cabeçalho primeiro.');
      return;
    }
    setIsSyncingGithub(true);
    setGithubSyncNote(null);
    try {
      const res = await apiRequest<{ success: boolean; projects: ResumeContent['projects']; note: string }>('/resumes/sync-github', {
        method: 'POST',
        body: JSON.stringify({
          githubUrl: identity.githubUrl,
          currentResume: content,
        }),
      });

      if (res.projects && res.projects.length > 0) {
        const nextContent: ResumeContent = {
          ...content,
          projects: res.projects,
        };
        commit(nextContent, ['projects.0', 'projects.1']);
        setGithubSyncNote(res.note);
      }
    } catch (err: any) {
      setGithubSyncNote(err.message || 'Erro ao sincronizar repositórios do GitHub.');
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const handleAdaptWithAI = async (mode: AdaptationMode) => {
    setIsAdapting(true);
    setSelectedMode(mode);

    try {
      const res = await apiRequest<{
        success: boolean;
        adaptedContent: ResumeContent;
        suggestions: any[];
      }>('/resumes/adapt', {
        method: 'POST',
        body: JSON.stringify({
          baseResume: content,
          jobAnalysis: currentJob?.analysis || { role: 'Desenvolvedor Web', company: 'Empresa' },
          mode,
        }),
      });

      if (res.adaptedContent && currentVersion) {
        commit(applyIdentity(res.adaptedContent, identity), ['headline', 'summary', 'skills']);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdapting(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
              Currículo Adaptado por IA
            </h1>
            <Badge variant="primary">Regra de Integridade Ativa</Badge>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Otimizado para a vaga alvo sem jamais inventar experiências, empregos ou dados falsos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handlePrintPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF Profissional
          </Button>
          <Button onClick={() => handleAdaptWithAI(selectedMode)} isLoading={isAdapting} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Reanalisar & Adaptar
          </Button>
        </div>
      </div>

      {/* Seletor dos 3 Modos Exclusivos (Parte 9.2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => handleAdaptWithAI('immediate')}
          className={`p-4 rounded-xl border cursor-pointer pressable transition-all ${
            selectedMode === 'immediate'
              ? 'bg-[var(--color-surface-2)] border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">Modo A</span>
            <Badge variant="success">Recomendado</Badge>
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-fg)]">Candidatura Imediata</h3>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">
            Otimiza o currículo usando apenas informações verdadeiras já confirmadas no seu perfil e projetos.
          </p>
        </div>

        <div
          onClick={() => handleAdaptWithAI('preparation')}
          className={`p-4 rounded-xl border cursor-pointer pressable transition-all ${
            selectedMode === 'preparation'
              ? 'bg-[var(--color-surface-2)] border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-warning)]">Modo B</span>
            <Badge variant="warning">Em Estudo</Badge>
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-fg)]">Preparação para a Vaga</h3>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">
            Currículo atual com lista de melhorias e competências pendentes condicionadas ao término dos módulos.
          </p>
        </div>

        <div
          onClick={() => handleAdaptWithAI('post_training')}
          className={`p-4 rounded-xl border cursor-pointer pressable transition-all ${
            selectedMode === 'post_training'
              ? 'bg-[var(--color-surface-2)] border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-info)]">Modo C</span>
            <Badge variant="info">Prévia</Badge>
          </div>
          <h3 className="font-semibold text-sm text-[var(--color-fg)]">Após Treinamento</h3>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">
            Prévia de como seu currículo ficará após demonstrar o conhecimento de SQL e APIs na avaliação prática.
          </p>
        </div>
      </div>

      {/* Painel Central: Sugestões da IA & Visualizador do Currículo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Sugestões e Ajustes */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
                Seus Dados no Cabeçalho
              </CardTitle>
              <CardDescription>
                Fonte única: nome, e-mail, telefone, endereço e foto aparecem iguais em todo o currículo. A IA não altera estes campos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IdentityForm />
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-[var(--color-accent)]" />
                Editar com IA
              </CardTitle>
              <CardDescription>
                Peça uma alteração específica. Só o que você pedir muda — seções e layout ficam intactos. Você também pode clicar em qualquer texto do currículo para editar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                id="resume-ai-instruction"
                value={instruction}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstruction(e.target.value)}
                placeholder='Ex.: "Deixe o resumo mais focado em front-end" ou "Troque o período da formação para 2023 - 2026"'
                rows={3}
              />
              <Button id="resume-ai-apply" onClick={handleAIEdit} isLoading={isEditing} className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Aplicar alteração
              </Button>
              {editNote && <p className="text-xs text-[var(--color-fg-muted)]">{editNote}</p>}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Github className="h-4 w-4 text-[var(--color-accent)]" />
                Projetos Reais do GitHub
              </CardTitle>
              <CardDescription>
                A IA analisa seus repositórios públicos no GitHub e preenche os projetos do currículo com links reais e descrições técnicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[var(--color-fg-muted)]">
                Perfil conectado: <strong className="text-[var(--color-fg)]">{identity.githubUrl || 'Nenhum'}</strong>
              </p>
              <Button
                id="resume-sync-github"
                variant="secondary"
                onClick={handleSyncGithub}
                isLoading={isSyncingGithub}
                className="w-full gap-2"
              >
                <Github className="h-4 w-4" />
                Buscar & Preencher Projetos Reais
              </Button>
              {githubSyncNote && <p className="text-xs text-[var(--color-accent)]">{githubSyncNote}</p>}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                Sugestões de Otimização da IA
              </CardTitle>
              <CardDescription>
                Você tem controle total: aceite, rejeite ou edite cada sugestão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentVersion?.suggestions && currentVersion.suggestions.length > 0 ? (
                currentVersion.suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-3.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-fg)] uppercase tracking-wider text-[10px]">
                        Seção: {sug.section}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sug.status === 'accepted'
                            ? 'bg-green-500/10 text-green-400'
                            : sug.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {sug.status === 'accepted' ? 'Aceita' : sug.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                      </span>
                    </div>

                    <p className="text-[var(--color-fg-muted)] leading-relaxed italic">
                      "{sug.suggestedText}"
                    </p>

                    <p className="text-[11px] text-[var(--color-fg-subtle)]">
                      <strong>Por que:</strong> {sug.rationale}
                    </p>

                    {sug.requiresSkill && (
                      <div className="p-2 rounded bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Condicionado à validação prática de: <strong>{sug.requiresSkill}</strong></span>
                      </div>
                    )}

                    {sug.status === 'pending' && currentVersion && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => applySuggestion(currentVersion.id, sug.id, true)}
                          className="h-7 text-xs bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => applySuggestion(currentVersion.id, sug.id, false)}
                          className="h-7 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] gap-1"
                        >
                          <X className="h-3 w-3" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-fg-muted)]">Nenhuma sugestão pendente no momento.</p>
              )}
            </CardContent>
          </Card>

          {/* Modelos de Currículo (Parte 16) */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-4 space-y-3">
            <CardTitle className="text-sm">Modelo de Visualização</CardTitle>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'classic', label: 'Clássico (ATS)' },
                { id: 'minimal', label: 'Minimalista' },
                { id: 'developer', label: 'Desenvolvedor' },
                { id: 'internship', label: 'Estágio / Júnior' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id as ResumeTemplate)}
                  className={`p-2 rounded-lg border text-left cursor-pointer pressable transition-colors ${
                    selectedTemplate === tmpl.id
                      ? 'bg-[var(--color-surface-2)] border-[var(--color-accent)] text-[var(--color-fg)] font-semibold'
                      : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Coluna Direita: Folha de Currículo Profissional (Preview Realista & Imprimível) */}
        <div className="lg:col-span-7">
          <ResumeDocument
            content={content}
            onEdit={handleInlineEdit}
            onIdentityChange={(patch) => useIdentityStore.getState().setIdentity(patch as any)}
            highlightPaths={changedPaths}
          />
        </div>
      </div>
    </div>
  );
}
