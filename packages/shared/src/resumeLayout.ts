import { z } from 'zod';
import type { ResumeContent } from './domain.ts';

/**
 * Motor de layout do currículo editável.
 *
 * O layout é FIXO (espelha o modelo "DEV INICIANTE"). A IA e o usuário só podem
 * trocar o CONTEÚDO de blocos existentes — nunca criar, remover ou reordenar seções.
 *
 *  ┌ header ─────────────────────────────────────────────┐
 *  │ [photo]  fullName (h1)                              │
 *  │          headline (cargo │ foco)                    │
 *  │          email • phone • location                   │
 *  ├ summary   RESUMO PROFISSIONAL       (parágrafo)     │
 *  ├ skills    COMPETÊNCIAS & TECNOLOGIAS (chips)        │
 *  ├ projects  PROJETOS & PORTFÓLIO      (n× nome|link,  │
 *  │                                      descrição,     │
 *  │                                      tecnologias)   │
 *  └ education FORMAÇÃO ACADÊMICA        (curso — inst.  │
 *                                         | período)     │
 */

export type ResumeBlockId = 'header' | 'summary' | 'skills' | 'projects' | 'education';

export interface ResumeBlockDef {
  id: ResumeBlockId;
  title: string; // título exibido (fixo)
  kind: 'header' | 'paragraph' | 'chips' | 'entries';
  /** Campos editáveis do bloco, relativos ao ResumeContent. `[]` = item de lista. */
  fields: string[];
}

export const RESUME_LAYOUT: readonly ResumeBlockDef[] = [
  { id: 'header', title: '', kind: 'header', fields: ['photoUrl', 'fullName', 'headline', 'email', 'phone', 'location', 'githubUrl', 'linkedinUrl'] },
  { id: 'summary', title: 'Resumo Profissional', kind: 'paragraph', fields: ['summary'] },
  { id: 'skills', title: 'Competências & Tecnologias', kind: 'chips', fields: ['skills[]'] },
  {
    id: 'projects',
    title: 'Projetos & Portfólio Relevante',
    kind: 'entries',
    fields: ['projects[].name', 'projects[].link', 'projects[].description', 'projects[].technologies'],
  },
  {
    id: 'education',
    title: 'Formação Acadêmica',
    kind: 'entries',
    fields: ['education[].degree', 'education[].institution', 'education[].period'],
  },
] as const;

/** Dados pessoais do aluno — fonte única da verdade para o cabeçalho. */
export const resumeIdentitySchema = z.object({
  fullName: z.string().max(120).default(''),
  email: z.string().max(160).default(''),
  phone: z.string().max(40).default(''),
  location: z.string().max(160).default(''), // endereço / cidade
  photoUrl: z.string().max(2_000_000).default(''), // data URL ou http(s)
  githubUrl: z.string().max(250).default(''),
  linkedinUrl: z.string().max(250).default(''),
});
export type ResumeIdentity = z.infer<typeof resumeIdentitySchema>;
export const IDENTITY_FIELDS = ['fullName', 'email', 'phone', 'location', 'photoUrl', 'githubUrl', 'linkedinUrl'] as const;

/** Limites de tamanho (caracteres) para não deslocar o layout. */
const LIMITS = {
  headline: 70,
  summary: 420,
  skill: 28,
  maxSkills: 12,
  projectName: 48,
  projectLink: 80,
  projectDescription: 220,
  projectTech: 24,
  maxProjectTechs: 8,
  degree: 70,
  institution: 50,
  period: 28,
};

/** Tamanho permitido: ~ original ±25%, nunca acima do teto do bloco. */
function fit(value: unknown, original: string, hardMax: number): string {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  const soft = Math.max(Math.ceil(original.length * 1.25), Math.min(hardMax, 40));
  const max = Math.min(hardMax, soft);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  if (lastStop > max * 0.6) return cut.slice(0, lastStop + 1);
  return cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max).replace(/[,;:\s]+$/, '') + '…';
}

function fitList(value: unknown, original: string[], itemMax: number, maxItems: number): string[] {
  if (!Array.isArray(value)) return original;
  const cleaned = value
    .map((v) => String(v ?? '').trim())
    .filter(Boolean)
    .map((v) => (v.length > itemMax ? v.slice(0, itemMax) : v));
  return [...new Set(cleaned)].slice(0, maxItems);
}

/** Insere os dados do perfil no cabeçalho. Campo ausente → vazio (layout intacto). */
export function applyIdentity(content: ResumeContent, identity: Partial<ResumeIdentity>): ResumeContent {
  const id = resumeIdentitySchema.parse(identity ?? {});
  return { ...content, ...id };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Coerência: qualquer menção a nome/e-mail/telefone ANTIGOS ou variações
 * no corpo do documento é trocada pela forma canônica do perfil.
 */
export function enforceCoherence(content: ResumeContent, previous?: Partial<ResumeContent>): ResumeContent {
  const pairs: [RegExp, string][] = [];
  const add = (oldVal: string | undefined, canonical: string, flags = 'gi') => {
    if (oldVal && oldVal.trim().length >= 3 && oldVal !== canonical) pairs.push([new RegExp(escapeRe(oldVal.trim()), flags), canonical]);
  };
  add(previous?.fullName, content.fullName);
  add(previous?.email, content.email);
  add(previous?.phone, content.phone);
  // telefone escrito sem máscara → canônico
  const digits = content.phone.replace(/\D/g, '');
  if (digits.length >= 8) pairs.push([new RegExp(digits.split('').join('[\\s().-]*'), 'g'), content.phone]);

  if (!pairs.length) return content;
  const fix = (s: string) => pairs.reduce((acc, [re, to]) => (to ? acc.replace(re, to) : acc), s);
  return {
    ...content,
    headline: fix(content.headline),
    summary: fix(content.summary),
    projects: content.projects.map((p) => ({ ...p, name: fix(p.name), description: fix(p.description) })),
  };
}

/**
 * Trava estrutural: recebe um conteúdo candidato (ex.: vindo da IA) e devolve
 * um conteúdo com EXATAMENTE a mesma estrutura do original — mesmos projetos,
 * mesma formação, mesmo cabeçalho — trocando apenas textos permitidos e com
 * tamanho controlado.
 */
export function lockStructure(
  original: ResumeContent,
  candidate: Partial<ResumeContent> | null | undefined,
  identity?: Partial<ResumeIdentity>,
): ResumeContent {
  const c = candidate ?? {};
  const out: ResumeContent = {
    ...original,
    headline: c.headline !== undefined ? fit(c.headline, original.headline, LIMITS.headline) : original.headline,
    summary: c.summary !== undefined ? fit(c.summary, original.summary, LIMITS.summary) : original.summary,
    skills: c.skills !== undefined ? fitList(c.skills, original.skills, LIMITS.skill, LIMITS.maxSkills) : original.skills,
    projects: original.projects.map((p, i) => {
      const n = c.projects?.[i];
      if (!n) return p;
      return {
        name: n.name !== undefined ? fit(n.name, p.name, LIMITS.projectName) : p.name,
        link: n.link !== undefined ? fit(n.link, p.link ?? '', LIMITS.projectLink) : p.link,
        description: n.description !== undefined ? fit(n.description, p.description, LIMITS.projectDescription) : p.description,
        technologies:
          n.technologies !== undefined
            ? fitList(n.technologies, p.technologies, LIMITS.projectTech, LIMITS.maxProjectTechs)
            : p.technologies,
      };
    }),
    education: original.education.map((e, i) => {
      const n = c.education?.[i];
      if (!n) return e;
      return {
        degree: n.degree !== undefined ? fit(n.degree, e.degree, LIMITS.degree) : e.degree,
        institution: n.institution !== undefined ? fit(n.institution, e.institution, LIMITS.institution) : e.institution,
        period: n.period !== undefined ? fit(n.period, e.period, LIMITS.period) : e.period,
      };
    }),
  };
  // Cabeçalho pessoal nunca vem da IA: sempre do perfil (ou do original).
  const withId = identity ? applyIdentity(out, identity) : out;
  return enforceCoherence(withId, original);
}

/* ---------- Edição pontual por caminho (usada pela IA e pela edição inline) ---------- */

export const resumeEditOpSchema = z.object({
  path: z.string(), // ex.: "summary", "skills", "projects.1.description", "education.0.period"
  value: z.union([z.string(), z.array(z.string())]),
});
export type ResumeEditOp = z.infer<typeof resumeEditOpSchema>;

const EDITABLE_PATHS: RegExp[] = [
  /^headline$/,
  /^summary$/,
  /^skills$/,
  /^skills\.\d+$/,
  /^projects\.\d+\.(name|link|description|technologies)$/,
  /^education\.\d+\.(degree|institution|period)$/,
];

export function isEditablePath(path: string) {
  return EDITABLE_PATHS.some((re) => re.test(path));
}

/** Aplica somente as operações válidas; caminhos inexistentes ou de identidade são ignorados. */
export function applyEditOps(
  original: ResumeContent,
  ops: ResumeEditOp[],
  identity?: Partial<ResumeIdentity>,
): { content: ResumeContent; applied: ResumeEditOp[]; rejected: ResumeEditOp[] } {
  const draft: any = structuredClone(original);
  const applied: ResumeEditOp[] = [];
  const rejected: ResumeEditOp[] = [];

  for (const op of ops) {
    if (!isEditablePath(op.path)) {
      rejected.push(op);
      continue;
    }
    const parts = op.path.split('.');
    let target: any = draft;
    for (let i = 0; i < parts.length - 1; i++) target = target?.[parts[i]];
    const key = parts[parts.length - 1];
    // Só altera itens que já existem (não cria projetos/formações novos)
    if (target == null || (Array.isArray(target) && !(Number(key) < target.length))) {
      rejected.push(op);
      continue;
    }
    target[key] = op.value;
    applied.push(op);
  }

  return { content: lockStructure(original, draft, identity), applied, rejected };
}

/** Mapa textual do layout — enviado à IA para que ela saiba exatamente o que pode tocar. */
export function describeLayoutForAI(content: ResumeContent): string {
  const lines: string[] = [];
  lines.push(`headline (${content.headline.length}/${LIMITS.headline} chars): ${content.headline}`);
  lines.push(`summary (${content.summary.length}/${LIMITS.summary} chars): ${content.summary}`);
  lines.push(`skills (máx ${LIMITS.maxSkills} itens): ${JSON.stringify(content.skills)}`);
  content.projects.forEach((p, i) => {
    lines.push(`projects.${i}.name: ${p.name}`);
    lines.push(`projects.${i}.link: ${p.link ?? ''}`);
    lines.push(`projects.${i}.description (${p.description.length}/${LIMITS.projectDescription} chars): ${p.description}`);
    lines.push(`projects.${i}.technologies: ${JSON.stringify(p.technologies)}`);
  });
  content.education.forEach((e, i) => {
    lines.push(`education.${i}.degree: ${e.degree}`);
    lines.push(`education.${i}.institution: ${e.institution}`);
    lines.push(`education.${i}.period: ${e.period}`);
  });
  return lines.join('\n');
}

/** Currículo modelo (estrutura de referência "DEV INICIANTE"). */
export const RESUME_TEMPLATE_DEV_INICIANTE: ResumeContent = {
  fullName: 'Dev Iniciante',
  headline: 'Desenvolvedor(a) Web | Foco em React, TypeScript & SQL',
  email: 'dev@devcareer.ai',
  phone: '(11) 98765-4321',
  location: 'São Paulo, SP - Remoto / Híbrido',
  photoUrl: '',
  githubUrl: 'https://github.com/exemplo/dev-iniciante',
  linkedinUrl: 'https://linkedin.com/in/dev-iniciante',
  summary:
    'Desenvolvedor Web Full-Stack Júnior com base sólida em React, TypeScript e modelagem/consultas SQL. Experiência na criação de interfaces componentizadas, consumo e integração de APIs REST e fluxo colaborativo de versionamento com Git.',
  skills: ['React', 'TypeScript', 'SQL', 'Git & GitHub', 'JavaScript (ES6+)', 'APIs REST', 'Tailwind CSS', 'HTML5 & CSS3'],
  experiences: [],
  education: [
    { degree: 'Bacharelado em Ciência da Computação / ADS', institution: 'Faculdade de Tecnologia', period: '2024 - 2027 (Previsão)' },
  ],
  projects: [
    {
      name: 'Catálogo de Filmes Reativo',
      link: 'https://github.com/exemplo/catalogo-filmes',
      description:
        'Aplicação web interativa desenvolvida com React e Tailwind CSS consumindo API REST pública e versionada via Git.',
      technologies: ['React', 'JavaScript', 'Tailwind CSS', 'REST API', 'Git'],
    },
    {
      name: 'Sistema Full-Stack de Gerenciamento',
      link: 'https://github.com/exemplo/fullstack-ts-sql',
      description:
        'Aplicação web desenvolvida durante a trilha de capacitação full-stack, com interface em React e TypeScript conectada a serviços backend com persistência e queries em banco de dados SQL.',
      technologies: ['React', 'TypeScript', 'SQL', 'Git'],
    },
  ],
  certifications: [],
  languages: [],
};
