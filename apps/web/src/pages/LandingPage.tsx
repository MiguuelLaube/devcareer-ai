import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  FileText,
  BookOpen,
  Bot,
  Code2,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 text-xs font-semibold text-[var(--color-accent)] mb-6 enter">
          <Sparkles className="h-3.5 w-3.5" />
          Plataforma de Design Engineering & Carreira em TI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--color-fg)] leading-[1.15] max-w-4xl mx-auto enter">
          Analise vagas de TI, adapte seu currículo com <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#a79aff]">dados reais</span> e aprenda o que falta.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed enter">
          O <strong>DevCareer AI</strong> é seu mentor inteligente: compara seus conhecimentos com as exigências da oportunidade, gera versões de currículo éticas (sem mentiras) e cria trilhas intensivas de código para você conquistar sua vaga.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 enter">
          <Button size="lg" onClick={onStart} className="w-full sm:w-auto text-base">
            Começar Gratuitamente
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <a
            href="#fluxo"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors pressable"
          >
            Como Funciona
          </a>
        </div>

        {/* Badges de Integridade e Ética */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-fg-subtle)]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[var(--color-success)]" />
            Integridade Garantida: zero alucinação
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            Critérios transparentes de compatibilidade
          </span>
          <span className="flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-[var(--color-accent)]" />
            Professor particular com IA integrada
          </span>
        </div>
      </section>

      {/* Fluxo Principal em 4 Passos */}
      <section id="fluxo" className="py-16 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-fg)]">
              O fluxo inteligente da sua preparação
            </h2>
            <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
              Transforme a ansiedade do processo seletivo em uma rotina metódica de estudos e candidatura assertiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] font-bold">
                  1
                </div>
                <h3 className="font-semibold text-base text-[var(--color-fg)]">Envie a Vaga & Currículo</h3>
                <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                  Cole o link da vaga, faça upload do PDF ou insira o texto. A IA extrai requisitos mandatórios e diferenciais.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-info-soft)] flex items-center justify-center text-[var(--color-info)] font-bold">
                  2
                </div>
                <h3 className="font-semibold text-base text-[var(--color-fg)]">Diagnóstico de Lacunas</h3>
                <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                  Classificação item a item: o que você já atende, o que está em evolução e o que é pendente crítico.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-warning-soft)] flex items-center justify-center text-[var(--color-warning)] font-bold">
                  3
                </div>
                <h3 className="font-semibold text-base text-[var(--color-fg)]">Adaptação Ética do CV</h3>
                <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                  Três modos exclusivos (A: imediato, B: preparação, C: pós-treino). Aceite ou edite cada sugestão.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-success-soft)] flex items-center justify-center text-[var(--color-success)] font-bold">
                  4
                </div>
                <h3 className="font-semibold text-base text-[var(--color-fg)]">Trilha Intensiva & Validação</h3>
                <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                  Aprenda com o Professor IA, resolva exercícios práticos de código e adicione ao currículo apenas após demonstrar domínio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Funcionalidades Chave */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-fg)]">Score Transparente</h3>
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              Nada de pontuações mágicas de ATS que iludem você. O DevCareer explica exatamente por que você tem 68% de aderência e o que precisa fazer para chegar a 90%.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--color-success-soft)] flex items-center justify-center text-[var(--color-success)]">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-fg)]">Geração de PDF Profissional</h3>
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              Exporte nos modelos Clássico, Minimalista ou Desenvolvedor com texto selecionável e compatibilidade perfeita com leitores automatizados de RH.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--color-info-soft)] flex items-center justify-center text-[var(--color-info)]">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-fg)]">Prática em Ambiente Isolado</h3>
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              Resolva queries SQL e desafios de lógica rodando de forma segura diretamente no seu navegador, recebendo feedback imediato.
            </p>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-20 p-8 rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)] text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-fg)]">
            Pronto para transformar sua carreira em tecnologia?
          </h2>
          <p className="mt-2 text-sm text-[var(--color-fg-muted)] max-w-lg mx-auto">
            Cadastre-se agora e comece analisando sua primeira vaga de emprego em segundos.
          </p>
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={onStart}>
              Acessar Plataforma Completa
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
