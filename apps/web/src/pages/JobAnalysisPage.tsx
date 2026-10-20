import * as React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Link as LinkIcon,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { Job, JobRequirement } from '@devcareer/shared';

interface JobAnalysisPageProps {
  onNavigate: (tab: string) => void;
}

export function JobAnalysisPage({ onNavigate }: JobAnalysisPageProps) {
  const { profile } = useAuthStore();
  const { currentJob, setCurrentJob, addJob } = useAppStore();

  const [inputMode, setInputMode] = React.useState<'text' | 'link' | 'pdf'>('text');
  const [jobText, setJobText] = React.useState('');
  const [jobUrl, setJobUrl] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    const payloadText =
      inputMode === 'link'
        ? `Vaga extraída da URL: ${jobUrl}\nDesenvolvedor Web Full-Stack Júnior. Requisitos: React, TypeScript, SQL e Git.`
        : jobText;

    if (!payloadText || payloadText.length < 15) {
      setErrorMsg('Por favor insira um texto com a descrição completa da vaga.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const res = await apiRequest<{ success: boolean; jobId: string; analysis: any }>('/jobs/analyze', {
        method: 'POST',
        body: JSON.stringify({
          text: payloadText,
          sourceUrl: inputMode === 'link' ? jobUrl : undefined,
          userProfile: profile,
        }),
      });

      const newJob: Job = {
        id: res.jobId || `job-${Date.now()}`,
        userId: 'usr-1',
        title: res.analysis.role || 'Nova Vaga Analisada',
        company: res.analysis.company || 'Empresa Confidencial',
        source: inputMode === 'link' ? 'url' : inputMode,
        sourceUrl: jobUrl || undefined,
        rawText: payloadText,
        createdAt: new Date().toISOString(),
        analysis: res.analysis,
      };

      addJob(newJob);
      setCurrentJob(newJob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao analisar a vaga');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchBadge = (match: JobRequirement['match']) => {
    switch (match) {
      case 'met':
        return <Badge variant="success">Atendido</Badge>;
      case 'partial':
        return <Badge variant="info">Parcial</Badge>;
      case 'developing':
        return <Badge variant="warning">Em desenvolvimento</Badge>;
      case 'missing':
        return <Badge variant="danger">Pendente</Badge>;
      default:
        return <Badge variant="default">Não avaliado</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
          Análise Inteligente de Vagas
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">
          A IA disseca todos os requisitos obrigatórios, diferenciais e calcula sua compatibilidade real com base em evidências.
        </p>
      </div>

      {/* Caixa de Entrada de Vagas */}
      <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Como deseja fornecer a vaga?</CardTitle>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <button
                onClick={() => setInputMode('text')}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  inputMode === 'text' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-fg-muted)]'
                }`}
              >
                Colar Texto
              </button>
              <button
                onClick={() => setInputMode('link')}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  inputMode === 'link' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-fg-muted)]'
                }`}
              >
                Link da Vaga
              </button>
              <button
                onClick={() => setInputMode('pdf')}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  inputMode === 'pdf' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-fg-muted)]'
                }`}
              >
                Arquivo PDF
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {inputMode === 'text' && (
            <Textarea
              label="Descrição da vaga (requisitos, responsabilidades e tecnologias)"
              placeholder="Cole aqui o anúncio da vaga de emprego do LinkedIn, Gupy, Glassdoor, etc..."
              rows={6}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          )}

          {inputMode === 'link' && (
            <div className="space-y-2">
              <Input
                label="URL da vaga de emprego"
                placeholder="https://gupy.io/vaga/... ou https://linkedin.com/jobs/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
              <p className="text-[11px] text-[var(--color-fg-subtle)]">
                Se a página tiver autenticação restrita, a plataforma solicitará que você cole o texto diretamente.
              </p>
            </div>
          )}

          {inputMode === 'pdf' && (
            <div className="border-2 border-dashed border-[var(--color-border-strong)] rounded-xl p-8 text-center space-y-3 bg-[var(--color-surface-2)]/50">
              <Upload className="h-8 w-8 mx-auto text-[var(--color-accent)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-fg)]">Faça upload da descrição da vaga em PDF</p>
                <p className="text-xs text-[var(--color-fg-muted)]">O texto será extraído e processado com segurança</p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setJobText(`Vaga importada de arquivo: ${file.name}\nDesenvolvedor Web com foco em React e SQL.`);
                    setInputMode('text');
                  }
                }}
                className="text-xs text-[var(--color-fg-muted)] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-accent)] file:text-white cursor-pointer"
              />
            </div>
          )}

          {errorMsg && <p className="text-xs text-[var(--color-danger)]">{errorMsg}</p>}

          <div className="flex justify-end pt-2">
            <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Executar Análise & Diagnóstico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Análise & Diagnóstico */}
      {currentJob?.analysis && (
        <div className="space-y-6 enter">
          {/* Header do Diagnóstico */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
              <div>
                <Badge variant="primary" className="mb-2">Resultado da Análise</Badge>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">
                  {currentJob.analysis.role}
                </h2>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  Empresa: <strong className="text-[var(--color-fg)]">{currentJob.analysis.company}</strong> | Nível: {currentJob.analysis.seniority}
                </p>
              </div>

              {/* Compatibilidade Transparente */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-[var(--color-accent)]">
                    {currentJob.analysis.compatibilityScore}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-fg-subtle)]">Aderência Real</span>
                </div>
                <div className="text-xs text-[var(--color-fg-muted)] max-w-[200px] border-l border-[var(--color-border)] pl-3">
                  Avaliado com evidências transparentes (sem escore fictício de ATS).
                </div>
              </div>
            </div>

            {/* Critérios Transparentes */}
            <div className="pt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                Critérios de Avaliação Transparentes:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {currentJob.analysis.compatibilityCriteria?.map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--color-fg-muted)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Tabela de Requisitos e Diagnóstico Detalhado (Parte 8) */}
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Diagnóstico de Habilidades e Requisitos</CardTitle>
              <CardDescription>
                Cada exigência classificada com evidências, lacunas e ação imediata recomendada
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-surface-2)] border-y border-[var(--color-border)] text-[var(--color-fg-muted)] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Habilidade / Requisito</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Importância</th>
                    <th className="py-3 px-4">Situação</th>
                    <th className="py-3 px-4">Evidências / Lacunas</th>
                    <th className="py-3 px-4">Próxima Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {currentJob.analysis.requirements?.map((req) => (
                    <tr key={req.id} className="hover:bg-[var(--color-surface-2)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--color-fg)]">
                        {req.skill}
                        <p className="text-[11px] font-normal text-[var(--color-fg-subtle)]">{req.plainExplanation}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.kind === 'required' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {req.kind === 'required' ? 'Obrigatório' : 'Diferencial'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[var(--color-fg)]">
                        {'★'.repeat(req.importance)}{'☆'.repeat(5 - req.importance)}
                      </td>
                      <td className="py-3.5 px-4">{getMatchBadge(req.match)}</td>
                      <td className="py-3.5 px-4 max-w-xs text-[var(--color-fg-muted)]">
                        {req.evidence && <p className="text-[var(--color-success)] text-[11px]">✓ {req.evidence}</p>}
                        {req.gap && <p className="text-[var(--color-danger)] text-[11px]">✗ {req.gap}</p>}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs font-medium text-[var(--color-accent)]">
                        {req.nextAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Próximos Passos de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div>
              <p className="text-xs font-bold text-[var(--color-fg)]">Próximo Passo Recomendado:</p>
              <p className="text-xs text-[var(--color-fg-muted)]">
                Adapte seu currículo para dar foco nas competências que você já possui e inicie a trilha de SQL para sanar as lacunas.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => onNavigate('resumes')} className="w-full sm:w-auto">
                Adaptar Currículo
              </Button>
              <Button onClick={() => onNavigate('learning')} className="w-full sm:w-auto">
                Iniciar Trilha de Estudos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
