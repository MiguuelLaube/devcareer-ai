import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Plus,
  Trash2,
  Check,
  ShieldAlert,
  Download,
  AlertTriangle,
} from 'lucide-react';
import {
  DECLARED_LEVELS,
  DECLARED_LEVEL_LABELS,
  type DeclaredLevel,
} from '@devcareer/shared';

export function ProfilePage() {
  const { profile, updateProfile, user } = useAuthStore();
  const [formData, setFormData] = React.useState(profile);
  const [newTechName, setNewTechName] = React.useState('');
  const [newTechLevel, setNewTechLevel] = React.useState<DeclaredLevel>('basic');
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleAddTech = () => {
    if (!newTechName.trim()) return;
    const updated = [
      ...formData.technologies,
      { name: newTechName.trim(), level: newTechLevel },
    ];
    setFormData({ ...formData, technologies: updated });
    setNewTechName('');
  };

  const handleRemoveTech = (index: number) => {
    const updated = formData.technologies.filter((_, i) => i !== index);
    setFormData({ ...formData, technologies: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'devcareer_meus_dados_lgpd.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
              Meu Perfil Profissional
            </h1>
            <Badge variant="primary">Base de Diagnóstico</Badge>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Mantenha suas competências e objetivos atualizados para comparações precisas com as vagas.
          </p>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Check className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-success)]/30 text-xs font-semibold text-[var(--color-success)]">
          Perfil atualizado com sucesso!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados Pessoais & Acadêmicos */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-6 space-y-4">
          <CardTitle className="text-base">Informações Pessoais & Formação</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              label="E-mail (Autenticado)"
              value={user?.email || ''}
              disabled
            />
            <Input
              label="Curso / Formação"
              placeholder="Ex: Ciência da Computação / ADS"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            />
            <Input
              label="Instituição de Ensino"
              placeholder="Ex: USP, Fatec, PUC"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <Input
              label="Período Acadêmico"
              placeholder="Ex: 3º Semestre, Concluído"
              value={formData.academic_period}
              onChange={(e) => setFormData({ ...formData, academic_period: e.target.value })}
            />
            <Input
              label="Data Desejada para Candidatura"
              type="date"
              value={formData.target_date || ''}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value || null })}
            />
          </div>

          <Textarea
            label="Objetivo Profissional"
            placeholder="Descreva seu foco de carreira e interesses imediatos..."
            value={formData.career_goal}
            onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
            rows={3}
          />
        </Card>

        {/* Tecnologias & Níveis Declarados (Parte 5) */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-6 space-y-4">
          <div>
            <CardTitle className="text-base">Tecnologias Conhecidas & Níveis Reais</CardTitle>
            <CardDescription>
              Declare o nível exato com honestidade. O sistema não presume que você domina algo apenas por estar matriculado.
            </CardDescription>
          </div>

          {/* Adicionar Nova Tecnologia */}
          <div className="flex flex-col sm:flex-row gap-3 items-end p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="flex-1 w-full">
              <Input
                label="Tecnologia / Ferramenta"
                placeholder="Ex: React, SQL, Docker, Python"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48 space-y-1.5">
              <label className="block text-xs font-medium text-[var(--color-fg-muted)]">Nível Declarado</label>
              <select
                value={newTechLevel}
                onChange={(e) => setNewTechLevel(e.target.value as DeclaredLevel)}
                className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
              >
                {DECLARED_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {DECLARED_LEVEL_LABELS[lvl]}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={handleAddTech} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {/* Lista de Tecnologias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {formData.technologies.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-[var(--color-fg)]">{t.name}</p>
                  <span className="text-[11px] text-[var(--color-accent)] font-medium">
                    {DECLARED_LEVEL_LABELS[t.level]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(idx)}
                  className="p-1.5 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] pressable cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Links Profissionais */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-6 space-y-4">
          <CardTitle className="text-base">Presença Online & Portfólio</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="GitHub"
              placeholder="https://github.com/..."
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            />
            <Input
              label="LinkedIn"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            />
            <Input
              label="Portfólio Pessoal"
              placeholder="https://meusite.dev"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            />
          </div>
        </Card>

        {/* Privacidade, LGPD e Segurança (Parte 20) */}
        <Card className="bg-[var(--color-surface)] border-[var(--color-border)] p-6 space-y-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[var(--color-accent)]" />
              Privacidade & Seus Dados (LGPD)
            </CardTitle>
            <CardDescription>
              Seus dados pertencem exclusivamente a você. Você tem o direito de exportar ou excluir tudo a qualquer momento.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleExportData} className="gap-2 text-xs">
              <Download className="h-4 w-4" />
              Exportar Todos os Meus Dados (JSON)
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (confirm('Tem certeza? Isso apagará seus dados e reinicializará sua conta local.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
            >
              Excluir Meus Dados Definitivamente
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
