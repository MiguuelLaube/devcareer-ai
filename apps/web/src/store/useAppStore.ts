import { create } from 'zustand';
import type {
  Job,
  JobAnalysis,
  Resume,
  ResumeContent,
  ResumeVersion,
  LearningPath,
  Application,
  PortfolioProject,
} from '@devcareer/shared';

interface AppState {
  // Vagas e Análises
  jobs: Job[];
  currentJob: Job | null;
  setCurrentJob: (job: Job | null) => void;
  addJob: (job: Job) => void;

  // Currículos e Versões
  resumes: Resume[];
  currentResume: Resume | null;
  currentVersion: ResumeVersion | null;
  setCurrentResume: (resume: Resume | null) => void;
  setCurrentVersion: (version: ResumeVersion | null) => void;
  updateResumeContent: (versionId: string, content: ResumeContent) => void;
  applySuggestion: (versionId: string, suggestionId: string, accepted: boolean) => void;

  // Trilhas e Aprendizado
  learningPaths: LearningPath[];
  currentPath: LearningPath | null;
  setCurrentPath: (path: LearningPath | null) => void;
  toggleTaskStatus: (pathId: string, moduleId: string, taskId: string) => void;
  reorganizeRoutine: (pathId: string) => void;

  // Candidaturas
  applications: Application[];
  addApplication: (app: Application) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;

  // Portfólio
  projects: PortfolioProject[];
  updateProjectStatus: (id: string, status: PortfolioProject['status'], repoUrl?: string) => void;

  // Métricas do Dashboard
  stats: {
    analyzedJobsCount: number;
    ongoingApplicationsCount: number;
    generatedResumesCount: number;
    developingSkillsCount: number;
    studyMinutesTotal: number;
  };
  addStudyMinutes: (minutes: number) => void;
}

// Dados iniciais de demonstração ricos e profissionais para o usuário começar imediatamente
const INITIAL_JOB: Job = {
  id: 'job-demo-1',
  userId: 'usr-1',
  title: 'Desenvolvedor(a) Front-end / Full-Stack Júnior',
  company: 'Inovação & Sistemas Tech',
  source: 'text',
  rawText: 'Vaga para Desenvolvedor Front-end Júnior. Requisitos: React, TypeScript, Git, SQL básico e APIs REST.',
  createdAt: new Date().toISOString(),
  analysis: {
    id: 'analysis-1',
    jobId: 'job-demo-1',
    role: 'Desenvolvedor(a) Front-end / Full-Stack Júnior',
    company: 'Inovação & Sistemas Tech',
    seniority: 'Júnior',
    responsibilities: [
      'Construção de componentes web reativos e responsivos em React',
      'Integração e consumo de serviços RESTful',
      'Versionamento colaborativo com Git e Pull Requests',
      'Modelagem e consultas fundamentais em bancos SQL',
    ],
    technologies: ['React', 'TypeScript', 'SQL', 'Git', 'Tailwind CSS', 'Node.js'],
    languages: ['Português'],
    keywords: ['Clean Code', 'Testes', 'SCRUM', 'Componentização'],
    requirements: [
      {
        id: 'req-1',
        skill: 'React & Componentização',
        category: 'Framework',
        kind: 'required',
        importance: 5,
        plainExplanation: 'Biblioteca para criação de interfaces modernas declarativas.',
        match: 'met',
        evidence: 'Projeto pessoal Catálogo de Filmes no GitHub',
        gap: '',
        nextAction: 'Revisar hooks avançados (useCallback, useMemo)',
      },
      {
        id: 'req-2',
        skill: 'Git & GitHub',
        category: 'Ferramenta',
        kind: 'required',
        importance: 4,
        plainExplanation: 'Controle de versão para histórico de alterações em equipe.',
        match: 'met',
        evidence: 'Histórico ativo no GitHub com mensagens claras',
        gap: '',
        nextAction: 'Manter boas práticas de branch e PR',
      },
      {
        id: 'req-3',
        skill: 'SQL & Bancos Relacionais',
        category: 'Banco de Dados',
        kind: 'required',
        importance: 4,
        plainExplanation: 'Comandos estruturados para consulta e junção de dados.',
        match: 'missing',
        evidence: '',
        gap: 'Sem evidência de consultas com JOIN e agregações.',
        nextAction: 'Concluir a trilha intensiva de SQL no DevCareer',
      },
      {
        id: 'req-4',
        skill: 'APIs RESTful',
        category: 'Integrações',
        kind: 'required',
        importance: 4,
        plainExplanation: 'Padrão HTTP para troca de dados entre serviços.',
        match: 'partial',
        evidence: 'Consumo de API em projeto React',
        gap: 'Falta criar uma API própria com tratamento de erros.',
        nextAction: 'Construir pequeno CRUD com Express',
      },
    ],
    compatibilityScore: 68,
    compatibilityCriteria: [
      '2 de 4 requisitos principais comprovados com projetos reais',
      '1 requisito em desenvolvimento e 1 lacuna prioritária (SQL)',
      'Avaliação transparente baseada em evidências, sem pontuação falsa de ATS',
    ],
    createdAt: new Date().toISOString(),
  },
};

const INITIAL_RESUME_CONTENT: ResumeContent = {
  fullName: 'Dev Iniciante',
  headline: 'Desenvolvedor(a) Web | Foco em React, TypeScript & SQL',
  email: 'dev@devcareer.ai',
  phone: '(11) 98765-4321',
  location: 'São Paulo, SP - Remoto / Híbrido',
  photoUrl: '',
  githubUrl: 'https://github.com/exemplo/dev-iniciante',
  linkedinUrl: 'https://linkedin.com/in/dev-iniciante',
  summary: 'Desenvolvedor em início de carreira com sólido domínio prático em React, JavaScript e Git. Foco em interfaces limpas, código legível e rápida curva de aprendizado para agregar valor ao time.',
  skills: ['JavaScript (ES6+)', 'React', 'Git & GitHub', 'HTML5 & CSS3', 'Tailwind CSS'],
  experiences: [],
  education: [
    {
      degree: 'Bacharelado em Ciência da Computação / ADS',
      institution: 'Faculdade de Tecnologia',
      period: '2024 - 2027 (Previsão)',
    },
  ],
  projects: [
    {
      name: 'Catálogo de Filmes Reativo',
      description: 'Aplicação web interativa construída com React e Tailwind CSS consumindo API REST pública.',
      technologies: ['React', 'JavaScript', 'Tailwind CSS', 'REST API'],
      link: 'https://github.com/exemplo/catalogo-filmes',
    },
  ],
  certifications: ['Formação Frontend Essencial - 60h'],
  languages: ['Português (Nativo)', 'Inglês (Técnico para leitura)'],
};

const INITIAL_RESUME: Resume = {
  id: 'res-base',
  userId: 'usr-1',
  title: 'Currículo Base - Desenvolvedor Web',
  isBase: true,
  currentVersionId: 'ver-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  versions: [
    {
      id: 'ver-1',
      resumeId: 'res-base',
      versionNumber: 1,
      label: 'Versão Base Inicial',
      mode: 'immediate',
      template: 'classic',
      content: INITIAL_RESUME_CONTENT,
      isPreview: false,
      suggestions: [
        {
          id: 'sug-1',
          section: 'summary',
          originalText: INITIAL_RESUME_CONTENT.summary,
          suggestedText: 'Desenvolvedor Web com conhecimentos práticos em React e Git aplicados em projetos versionados. Estudando ativamente bancos relacionais e APIs REST para soluções full-stack com alta colaboração.',
          rationale: 'Ressalta alinhamento direto aos requisitos da vaga sem inventar experiência profissional.',
          status: 'pending',
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ],
};

const INITIAL_PATH: LearningPath = {
  id: 'path-1',
  userId: 'usr-1',
  jobId: 'job-demo-1',
  title: 'Trilha Intensiva: SQL & Bancos de Dados para a Vaga',
  minutesPerDay: 30,
  studyDays: [1, 2, 3, 4, 5],
  targetDate: '2026-11-15',
  rationale: 'Foco prioritário em sanar a lacuna de SQL obrigatória identificada na vaga da Inovação & Sistemas Tech.',
  createdAt: new Date().toISOString(),
  modules: [
    {
      id: 'mod-1',
      pathId: 'path-1',
      skill: 'SQL Básico',
      position: 1,
      title: 'Módulo 1: Fundamentos de Tabelas e Consultas SELECT',
      objective: 'Compreender como os dados são guardados em tabelas e dominar consultas com SELECT, WHERE, ORDER BY.',
      explanation: 'Bancos de dados relacionais organizam dados em tabelas compostas por linhas (registros) e colunas (atributos). A linguagem SQL permite pesquisar e manipular esses dados com comandos intuitivos.',
      examples: [
        {
          title: 'Consultar usuários com filtro',
          code: 'SELECT id, nome, email\nFROM usuarios\nWHERE ativo = true\nORDER BY nome ASC;',
          description: 'Recupera apenas usuários ativos e organiza alfabeticamente.',
        },
      ],
      exercises: [
        {
          id: 'ex-sql-1',
          question: 'Escreva uma consulta que selecione "cargo" e "empresa" da tabela "vagas" onde o "salario" seja maior que 3000.',
          initialCode: 'SELECT cargo, empresa FROM vagas WHERE ...',
          expectedOutput: 'SELECT cargo, empresa FROM vagas WHERE salario > 3000;',
          hints: ['Use a cláusula WHERE salario > 3000', 'Lembre-se do ponto e vírgula no final'],
          explanation: 'O filtro WHERE analisa a condição booleana para cada linha da tabela.',
        },
      ],
      tasks: [
        {
          id: 'task-1',
          moduleId: 'mod-1',
          title: 'Aula: Estrutura de Tabelas, Tipos e Chaves Primárias',
          kind: 'lesson',
          estimatedMinutes: 15,
          status: 'completed',
        },
        {
          id: 'task-2',
          moduleId: 'mod-1',
          title: 'Exercício Prático: Filtros com WHERE e ORDER BY',
          kind: 'exercise',
          estimatedMinutes: 20,
          status: 'in_progress',
        },
        {
          id: 'task-3',
          moduleId: 'mod-1',
          title: 'Desafio: Consulta em banco de e-commerce fictício',
          kind: 'challenge',
          estimatedMinutes: 25,
          status: 'not_started',
        },
      ],
      difficulty: 2,
      resources: [],
    },
    {
      id: 'mod-2',
      pathId: 'path-1',
      skill: 'SQL Intermediário',
      position: 2,
      title: 'Módulo 2: Relacionando Tabelas com INNER e LEFT JOIN',
      objective: 'Aprender a juntar dados de múltiplas tabelas através de chaves estrangeiras com segurança.',
      explanation: 'No mundo real, um pedido tem um cliente, e uma vaga tem requisitos. O JOIN é a instrução que cruza essas tabelas de forma performática.',
      examples: [
        {
          title: 'Cruzamento com INNER JOIN',
          code: 'SELECT c.nome, p.numero_pedido\nFROM pedidos p\nINNER JOIN clientes c ON c.id = p.cliente_id;',
          description: 'Junta pedidos aos seus respectivos clientes.',
        },
      ],
      exercises: [],
      tasks: [
        {
          id: 'task-4',
          moduleId: 'mod-2',
          title: 'Aula: Conceito de Chave Estrangeira e Tipos de JOIN',
          kind: 'lesson',
          estimatedMinutes: 20,
          status: 'not_started',
        },
      ],
      difficulty: 3,
      resources: [],
    },
  ],
};

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    userId: 'usr-1',
    jobId: 'job-demo-1',
    role: 'Desenvolvedor(a) Front-end Júnior',
    company: 'Inovação & Sistemas Tech',
    status: 'studying',
    compatibilityScore: 68,
    notes: 'Estudando o módulo de SQL antes de enviar o currículo adaptado para a vaga.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_PORTFOLIO: PortfolioProject[] = [
  {
    id: 'port-1',
    userId: 'usr-1',
    title: 'Sistema de Banco de Dados de Carreiras (SQL)',
    objective: 'Criar o banco de dados relacional para gerenciar vagas, currículos e requisitos com consultas de cruzamento JOIN.',
    technologies: ['PostgreSQL', 'SQLite', 'SQL'],
    requirements: [
      'Modelar diagrama de tabelas',
      'Implementar chaves primárias e estrangeiras',
      'Criar consultas para calcular percentual de aderência',
    ],
    steps: [
      'Crie o arquivo schema.sql com os comandos DDL',
      'Insira 5 empresas e 10 vagas com requisitos',
      'Escreva queries com INNER JOIN agrupando por empresa',
    ],
    completionCriteria: [
      'Script executa sem erros em SQLite/PostgreSQL',
      'README no GitHub com diagrama ER bem documentado',
    ],
    documentationGuide: 'Inclua screenshots das queries e explicação do racional de modelagem no README.',
    status: 'in_progress',
  },
  {
    id: 'port-2',
    userId: 'usr-1',
    title: 'API RESTful de Tarefas de Estudo com Express & Node',
    objective: 'Construir uma API completa com rotas GET, POST, PUT, DELETE e validação de dados com Zod.',
    technologies: ['Node.js', 'Express', 'TypeScript', 'Zod'],
    requirements: [
      'Rotas protegidas com códigos HTTP adequados',
      'Validação de schema de entrada',
    ],
    steps: [
      'Inicie o projeto Node com TypeScript',
      'Configure rotas com Express Router',
      'Valide o payload de criação de tarefas com Zod',
    ],
    completionCriteria: ['Rotas testadas com Postman ou Vitest', 'Código limpo no repositório'],
    documentationGuide: 'Descreva os endpoints na documentação do GitHub.',
    status: 'suggested',
  },
];

// Persistência local segura
const loadStorage = <T>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const useAppStore = create<AppState>((set) => ({
  jobs: loadStorage('devcareer_jobs', [INITIAL_JOB]),
  currentJob: loadStorage('devcareer_current_job', INITIAL_JOB),
  setCurrentJob: (job) => {
    localStorage.setItem('devcareer_current_job', JSON.stringify(job));
    set({ currentJob: job });
  },
  addJob: (job) => {
    set((state) => {
      const updated = [job, ...state.jobs.filter((j) => j.id !== job.id)];
      localStorage.setItem('devcareer_jobs', JSON.stringify(updated));
      localStorage.setItem('devcareer_current_job', JSON.stringify(job));
      return { jobs: updated, currentJob: job };
    });
  },

  resumes: loadStorage('devcareer_resumes', [INITIAL_RESUME]),
  currentResume: loadStorage('devcareer_current_resume', INITIAL_RESUME),
  currentVersion: loadStorage('devcareer_current_version', INITIAL_RESUME.versions[0]),
  setCurrentResume: (resume) => {
    localStorage.setItem('devcareer_current_resume', JSON.stringify(resume));
    set({ currentResume: resume, currentVersion: resume?.versions[0] || null });
  },
  setCurrentVersion: (version) => {
    localStorage.setItem('devcareer_current_version', JSON.stringify(version));
    set({ currentVersion: version });
  },
  updateResumeContent: (versionId, content) => {
    set((state) => {
      if (!state.currentResume) return state;
      const updatedVersions = state.currentResume.versions.map((v) =>
        v.id === versionId ? { ...v, content } : v
      );
      const updatedResume = { ...state.currentResume, versions: updatedVersions };
      const currentVer = updatedVersions.find((v) => v.id === versionId) || state.currentVersion;
      localStorage.setItem('devcareer_current_resume', JSON.stringify(updatedResume));
      localStorage.setItem('devcareer_current_version', JSON.stringify(currentVer));
      return { currentResume: updatedResume, currentVersion: currentVer };
    });
  },
  applySuggestion: (versionId, suggestionId, accepted) => {
    set((state) => {
      if (!state.currentResume) return state;
      const updatedVersions = state.currentResume.versions.map((v) => {
        if (v.id !== versionId) return v;
        const suggestion = v.suggestions.find((s) => s.id === suggestionId);
        if (!suggestion) return v;

        const updatedSuggestions = v.suggestions.map((s) =>
          s.id === suggestionId ? { ...s, status: accepted ? ('accepted' as const) : ('rejected' as const) } : s
        );

        let newContent = { ...v.content };
        if (accepted) {
          if (suggestion.section === 'summary') {
            newContent.summary = suggestion.suggestedText;
          } else if (suggestion.section === 'skills') {
            newContent.skills = suggestion.suggestedText.split(',').map((s) => s.trim());
          }
        }

        return { ...v, content: newContent, suggestions: updatedSuggestions };
      });

      const updatedResume = { ...state.currentResume, versions: updatedVersions };
      const currentVer = updatedVersions.find((v) => v.id === versionId) || state.currentVersion;
      localStorage.setItem('devcareer_current_resume', JSON.stringify(updatedResume));
      localStorage.setItem('devcareer_current_version', JSON.stringify(currentVer));
      return { currentResume: updatedResume, currentVersion: currentVer };
    });
  },

  learningPaths: loadStorage('devcareer_paths', [INITIAL_PATH]),
  currentPath: loadStorage('devcareer_current_path', INITIAL_PATH),
  setCurrentPath: (path) => {
    localStorage.setItem('devcareer_current_path', JSON.stringify(path));
    set({ currentPath: path });
  },
  toggleTaskStatus: (pathId, moduleId, taskId) => {
    set((state) => {
      const updatedPaths = state.learningPaths.map((path) => {
        if (path.id !== pathId) return path;
        const updatedModules = path.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          const updatedTasks = mod.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const nextStatus: any = task.status === 'completed' ? 'not_started' : 'completed';
            return {
              ...task,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
            };
          });
          return { ...mod, tasks: updatedTasks };
        });
        return { ...path, modules: updatedModules };
      });

      const current = updatedPaths.find((p) => p.id === pathId) || state.currentPath;
      localStorage.setItem('devcareer_paths', JSON.stringify(updatedPaths));
      localStorage.setItem('devcareer_current_path', JSON.stringify(current));
      return { learningPaths: updatedPaths, currentPath: current };
    });
  },
  reorganizeRoutine: (pathId) => {
    set((state) => {
      // Reorganiza tarefas pendentes redistribuindo datas
      return state;
    });
  },

  applications: loadStorage('devcareer_applications', INITIAL_APPLICATIONS),
  addApplication: (app) => {
    set((state) => {
      const updated = [app, ...state.applications];
      localStorage.setItem('devcareer_applications', JSON.stringify(updated));
      return { applications: updated };
    });
  },
  updateApplicationStatus: (id, status) => {
    set((state) => {
      const updated = state.applications.map((a) => (a.id === id ? { ...a, status } : a));
      localStorage.setItem('devcareer_applications', JSON.stringify(updated));
      return { applications: updated };
    });
  },

  projects: loadStorage('devcareer_portfolio', INITIAL_PORTFOLIO),
  updateProjectStatus: (id, status, repoUrl) => {
    set((state) => {
      const updated = state.projects.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              repositoryUrl: repoUrl || p.repositoryUrl,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            }
          : p
      );
      localStorage.setItem('devcareer_portfolio', JSON.stringify(updated));
      return { projects: updated };
    });
  },

  stats: {
    analyzedJobsCount: 1,
    ongoingApplicationsCount: 1,
    generatedResumesCount: 1,
    developingSkillsCount: 2,
    studyMinutesTotal: 95,
  },
  addStudyMinutes: (minutes) => {
    set((state) => ({
      stats: {
        ...state.stats,
        studyMinutesTotal: state.stats.studyMinutesTotal + minutes,
      },
    }));
  },
}));
