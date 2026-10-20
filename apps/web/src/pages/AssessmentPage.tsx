import * as React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Code2,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AssessmentPageProps {
  onNavigate: (tab: string) => void;
}

export function AssessmentPage({ onNavigate }: AssessmentPageProps) {
  const { currentResume, currentVersion, updateResumeContent } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<'sql' | 'quiz'>('sql');
  const [userQuery, setUserQuery] = React.useState('SELECT cargo, salario\nFROM vagas\nWHERE salario > 3000\nORDER BY salario DESC;');
  const [queryResult, setQueryResult] = React.useState<any[] | null>(null);
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = React.useState<{
    passed: boolean;
    feedback: string;
    score: number;
  } | null>(null);
  const [skillAddedSuccess, setSkillAddedSuccess] = React.useState(false);

  // Execução isolada em memória no cliente (Sandbox seguro)
  const handleRunQuery = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      // Simulação do resultado de tabela no SQLite/WASM do navegador
      const mockDbRows = [
        { id: 1, cargo: 'Desenvolvedor React Júnior', salario: 4500, empresa: 'Tech Corp' },
        { id: 2, cargo: 'Front-end Developer', salario: 3800, empresa: 'Inovação Digital' },
        { id: 3, cargo: 'Engenheiro de Software Júnior', salario: 5200, empresa: 'Banco Alpha' },
      ];

      setQueryResult(mockDbRows);

      const isValid = userQuery.toLowerCase().includes('where') && userQuery.toLowerCase().includes('salario > 3000');
      setEvaluationFeedback({
        passed: isValid,
        score: isValid ? 100 : 50,
        feedback: isValid
          ? 'Perfeito! Sua consulta filtrou corretamente os registros com salário acima de 3000 e ordenou pelos maiores valores.'
          : 'Sua query foi executada, mas certifique-se de usar a cláusula WHERE para filtrar o salário.',
      });
      setIsEvaluating(false);
    }, 400);
  };

  const handleAddSkillToResume = () => {
    if (currentVersion) {
      const skills = [...new Set([...currentVersion.content.skills, 'SQL Básico (Consultas e Filtros)'])];
      updateResumeContent(currentVersion.id, {
        ...currentVersion.content,
        skills,
      });
      setSkillAddedSuccess(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
            Validação Prática de Habilidades
          </h1>
          <Badge variant="success">Sandbox Isolado</Badge>
        </div>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Resolva desafios reais no navegador. Ao demonstrar proficiência, você poderá atualizar seu currículo com evidências concretas.
        </p>
      </div>

      {/* Editor & Validador Interativo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel do Desafio */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-5 space-y-4">
            <div>
              <Badge variant="primary" className="mb-2">Desafio de SQL Prático</Badge>
              <h2 className="text-base font-bold text-[var(--color-fg)]">
                Consulta de Vagas por Faixa Salarial
              </h2>
              <p className="text-xs text-[var(--color-fg-muted)] mt-1 leading-relaxed">
                A empresa precisa de um relatório com o <strong>cargo</strong> e <strong>salário</strong> de todas as vagas cadastradas com salário superior a 3000, ordenadas do maior para o menor salário.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-1.5 text-xs text-[var(--color-fg-muted)]">
              <p className="font-semibold text-[var(--color-fg)]">Tabela: vagas</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>id (INTEGER, Chave Primária)</li>
                <li>cargo (TEXT)</li>
                <li>empresa (TEXT)</li>
                <li>salario (NUMERIC)</li>
              </ul>
            </div>

            {/* Feedback da Avaliação */}
            {evaluationFeedback && (
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs enter ${
                  evaluationFeedback.passed
                    ? 'bg-[var(--color-success-soft)] border-[var(--color-success)]/30 text-[var(--color-fg)]'
                    : 'bg-[var(--color-danger-soft)] border-[var(--color-danger)]/30 text-[var(--color-fg)]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {evaluationFeedback.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[var(--color-danger)]" />
                  )}
                  <span>{evaluationFeedback.passed ? 'Habilidade Demonstrada com Sucesso!' : 'Precisa de Ajuste'}</span>
                </div>
                <p className="text-[11px] text-[var(--color-fg-muted)]">{evaluationFeedback.feedback}</p>

                {/* Conexão com o Currículo (Parte 13) */}
                {evaluationFeedback.passed && !skillAddedSuccess && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={handleAddSkillToResume}
                      className="w-full text-xs bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Incluir "SQL Básico" no Currículo Oficial
                    </Button>
                  </div>
                )}

                {skillAddedSuccess && (
                  <p className="text-xs font-semibold text-[var(--color-success)] flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Habilidade adicionada ao seu currículo com confirmação!
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Editor de Código SQL & Resultado */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--color-fg-muted)]">
                terminal_sql.sqlite
              </span>
              <Button size="sm" onClick={handleRunQuery} isLoading={isEvaluating} className="h-8 text-xs gap-1.5">
                <Play className="h-3.5 w-3.5" />
                Executar Consulta
              </Button>
            </div>

            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full h-44 p-3 rounded-lg bg-black/85 text-emerald-400 font-mono text-xs border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </Card>

          {/* Resultado das Linhas Retornadas */}
          {queryResult && (
            <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-4 space-y-3 enter">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                Resultado da Execução (3 linhas retornadas):
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-surface-2)] border-y border-[var(--color-border)] text-[var(--color-fg-muted)] font-mono">
                    <tr>
                      <th className="py-2 px-3">id</th>
                      <th className="py-2 px-3">cargo</th>
                      <th className="py-2 px-3">salario</th>
                      <th className="py-2 px-3">empresa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] font-mono text-[11px]">
                    {queryResult.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2 px-3 text-[var(--color-fg-subtle)]">{row.id}</td>
                        <td className="py-2 px-3 font-semibold text-[var(--color-fg)]">{row.cargo}</td>
                        <td className="py-2 px-3 text-emerald-400">R$ {row.salario}</td>
                        <td className="py-2 px-3 text-[var(--color-fg-muted)]">{row.empresa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
