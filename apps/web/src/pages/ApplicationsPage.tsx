import * as React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Briefcase,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from '@devcareer/shared';

export function ApplicationsPage() {
  const { applications, updateApplicationStatus, addApplication } = useAppStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);

  // Form states para nova candidatura
  const [newRole, setNewRole] = React.useState('');
  const [newCompany, setNewCompany] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');
  const [newNotes, setNewNotes] = React.useState('');

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole || !newCompany) return;

    addApplication({
      id: `app-${Date.now()}`,
      userId: 'usr-1',
      role: newRole,
      company: newCompany,
      url: newUrl || undefined,
      notes: newNotes,
      status: 'interesting',
      compatibilityScore: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setNewRole('');
    setNewCompany('');
    setNewUrl('');
    setNewNotes('');
    setIsNewModalOpen(false);
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'interview':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'applied':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ready':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'studying':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'preparing_resume':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'not_selected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
              Minhas Candidaturas
            </h1>
            <Badge variant="primary">{applications.length} registradas</Badge>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Acompanhe o funil de processos seletivos: da análise e estudo até a entrevista e aprovação.
          </p>
        </div>

        <Button onClick={() => setIsNewModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Candidatura
        </Button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--color-fg-subtle)]" />
          <input
            type="text"
            placeholder="Pesquisar por cargo ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
        >
          <option value="all">Todos os Status</option>
          {APPLICATION_STATUSES.map((st) => (
            <option key={st} value={st}>
              {APPLICATION_STATUS_LABELS[st]}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Candidaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplications.map((app) => (
          <Card key={app.id} className="bg-[var(--color-surface)] border-[var(--color-border)] p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-fg-subtle)] uppercase tracking-wider">
                  {app.company}
                </span>
                {app.compatibilityScore && (
                  <span className="text-xs font-bold text-[var(--color-accent)]">
                    {app.compatibilityScore}% compatível
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-[var(--color-fg)]">{app.role}</h3>

              {app.notes && (
                <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2 italic">
                  "{app.notes}"
                </p>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-[var(--color-border)]">
              {/* Seletor de Status (Usuário no Controle) */}
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-fg-subtle)] uppercase mb-1">
                  Status Atual:
                </label>
                <select
                  value={app.status}
                  onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none ${getStatusColor(
                    app.status
                  )}`}
                >
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-[var(--color-surface)] text-[var(--color-fg)]">
                      {APPLICATION_STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              {app.url && (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline pt-1"
                >
                  Ver link da vaga original
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal para Adicionar Candidatura */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Registrar Nova Candidatura"
        description="Acompanhe o status e anotações desta vaga."
      >
        <form onSubmit={handleCreateApplication} className="space-y-4 pt-2">
          <Input
            label="Cargo da Oportunidade"
            placeholder="Ex: Desenvolvedor Front-end Júnior"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            required
          />
          <Input
            label="Empresa"
            placeholder="Ex: Mercado Livre, Nubank, Startup X"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            required
          />
          <Input
            label="Link da Vaga (opcional)"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Input
            label="Observações Iniciais"
            placeholder="Ex: Preciso revisar conceitos de TypeScript antes de enviar"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Candidatura</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
