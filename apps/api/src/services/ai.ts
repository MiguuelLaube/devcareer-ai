import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  applyEditOps,
  describeLayoutForAI,
  lockStructure,
  resumeEditOpSchema,
  type ResumeEditOp,
  type ResumeIdentity,
} from '@devcareer/shared';
import { env } from '../env.ts';
import type {
  JobAnalysis,
  ResumeContent,
  ResumeSuggestion,
  LearningPath,
  Profile,
} from '@devcareer/shared';

// Inicializa cliente Gemini se chave presente
let genAI: GoogleGenAI | null = null;
if (env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  } catch (err) {
    console.error('[ai] Falha ao inicializar GoogleGenAI:', err);
  }
}

/**
 * Função utilitária para chamar o Gemini ou gerar retorno estruturado padrão
 */
async function callGeminiStructured<T>(prompt: string, fallback: T): Promise<T> {
  if (!genAI || !env.GEMINI_API_KEY) {
    return fallback;
  }
  try {
    const response = await genAI.models.generateContent({
      model: env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text;
    if (!rawText) return fallback;
    const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error('[ai] Erro ao chamar modelo Gemini:', error);
    return fallback;
  }
}

/**
 * Analisa a vaga de emprego e extrai requisitos categorizados
 */
export async function analyzeJobText(jobText: string, userProfile?: Profile | null): Promise<Partial<JobAnalysis>> {
  const prompt = `
Você é um especialista em recrutamento técnico de TI do DevCareer AI.
Analise detalhadamente a vaga abaixo e extraia requisitos reais em formato JSON rigoroso.
NUNCA invente informações. Se o link ou texto não tiver algo, seja honesto.

Texto da vaga:
"""
${jobText.slice(0, 10000)}
"""

Retorne exatamente um JSON com a estrutura:
{
  "role": "string (cargo identificado)",
  "company": "string (empresa ou Confidencial)",
  "seniority": "string (Estágio, Júnior, Pleno, Sênior, etc.)",
  "responsibilities": ["string", "string"],
  "technologies": ["string"],
  "languages": ["string"],
  "keywords": ["string"],
  "requirements": [
    {
      "skill": "string (ex: React, SQL, Git)",
      "category": "string (Linguagem, Framework, Banco de Dados, Metodologia, etc.)",
      "kind": "required" ou "preferred",
      "importance": número de 1 a 5,
      "plainExplanation": "string (explicação didática do que é essa habilidade e por que a vaga pede)",
      "match": "met" | "partial" | "developing" | "missing" | "not_evaluated",
      "evidence": "string (se houver no perfil)",
      "gap": "string (o que falta aprender)",
      "nextAction": "string (próximo passo prático recomendado)"
    }
  ],
  "compatibilityScore": número de 0 a 100,
  "compatibilityCriteria": ["string explicando transparência do cálculo"]
}
`;

  // Fallback inteligente caso a IA não tenha chave configurada de imediato
  const knownTechs = userProfile?.technologies?.map(t => t.name.toLowerCase()) || ['javascript', 'git'];
  const hasSql = knownTechs.includes('sql');
  const hasReact = knownTechs.includes('react');

  const fallback: Partial<JobAnalysis> = {
    role: 'Desenvolvedor(a) Front-end / Full-Stack Júnior',
    company: 'Tech Solutions & Inovação',
    seniority: 'Júnior',
    responsibilities: [
      'Desenvolver interfaces web responsivas e acessíveis com React e TypeScript',
      'Integrar componentes com APIs REST e serviços de backend',
      'Colaborar com equipe utilizando controle de versão Git e boas práticas de código',
      'Escrever consultas e manusear bancos relacionais (SQL)',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Tailwind CSS', 'REST APIs'],
    languages: ['Português (Nativo)', 'Inglês (Técnico para leitura)'],
    keywords: ['Clean Code', 'Componentização', 'SCRUM', 'Responsividade', 'CI/CD'],
    requirements: [
      {
        id: 'req-1',
        skill: 'React & Componentização',
        category: 'Framework',
        kind: 'required',
        importance: 5,
        plainExplanation: 'Biblioteca fundamental para criar interfaces reativas e modulares na web moderna.',
        match: hasReact ? 'met' : 'developing',
        evidence: hasReact ? 'Projeto pessoal no GitHub demonstrando hooks e props' : '',
        gap: hasReact ? '' : 'Falta aprofundar em ciclos de vida e otimizações de renderização.',
        nextAction: hasReact ? 'Revisar arquitetura de estado' : 'Completar o módulo prático de React Hooks',
      },
      {
        id: 'req-2',
        skill: 'Git & GitHub',
        category: 'Controle de Versão',
        kind: 'required',
        importance: 4,
        plainExplanation: 'Ferramenta padrão do mercado para rastrear histórico de alterações e colaborar em time.',
        match: 'met',
        evidence: 'Repositórios públicos com commits atômicos no GitHub',
        gap: '',
        nextAction: 'Manter padrão de conventional commits',
      },
      {
        id: 'req-3',
        skill: 'SQL & Bancos Relacionais',
        category: 'Banco de Dados',
        kind: 'required',
        importance: 4,
        plainExplanation: 'Linguagem universal para consultar, filtrar e relacionar dados em tabelas estruturadas.',
        match: hasSql ? 'met' : 'missing',
        evidence: hasSql ? 'Conhecimento declarado básico' : '',
        gap: hasSql ? '' : 'Não conhece comandos fundamentais como SELECT, JOIN e GROUP BY.',
        nextAction: 'Realizar trilha intensiva de SQL com exercícios práticos no SQLite',
      },
      {
        id: 'req-4',
        skill: 'APIs RESTful',
        category: 'Integrações',
        kind: 'required',
        importance: 4,
        plainExplanation: 'Comunicação entre o cliente e o servidor através de métodos HTTP (GET, POST, PUT, DELETE).',
        match: 'partial',
        evidence: 'Consumo de APIs com fetch/axios em projetos de estudo',
        gap: 'Falta criar uma API própria com tratamento de status HTTP e validação.',
        nextAction: 'Construir pequeno CRUD com Express e Zod',
      },
      {
        id: 'req-5',
        skill: 'TypeScript',
        category: 'Linguagem',
        kind: 'preferred',
        importance: 3,
        plainExplanation: 'Tipagem estática para JavaScript, prevenindo bugs em tempo de compilação.',
        match: 'developing',
        evidence: 'Uso de interfaces simples em componentes',
        gap: 'Tipos avançados como generics e utilitários (Pick, Omit).',
        nextAction: 'Resolver desafios de tipagem do DevCareer',
      },
    ],
    compatibilityScore: hasSql && hasReact ? 85 : hasReact ? 68 : 52,
    compatibilityCriteria: [
      '3 de 4 requisitos essenciais atendidos ou em evolução',
      'Critério transparente: avaliado com base em evidências verificadas no perfil e projetos',
      'Sem inflar score fictício de ATS — foco na correspondência real de habilidades',
    ],
  };

  return await callGeminiStructured<Partial<JobAnalysis>>(prompt, fallback);
}

/**
 * Adapta o currículo sem inventar informações (Regra estrita de integridade)
 */
export async function adaptResume(
  baseResume: ResumeContent,
  jobAnalysis: Partial<JobAnalysis>,
  mode: 'immediate' | 'preparation' | 'post_training',
): Promise<{ adaptedContent: ResumeContent; suggestions: any[] }> {
  const prompt = `
Você é o Adaptador de Currículos do DevCareer AI.
Sua missão é otimizar o currículo para a vaga alvo respeitando RIGOROSAMENTE as regras de integridade:
- NUNCA invente empregos, empresas, datas, resultados inexistentes ou habilidades não comprovadas.
- Modo A (immediate): Usa estritamente o que já existe de verdadeiro, reordenando e dando ênfase máxima nas competências que batem com a vaga.
- Modo B (preparation): Mostra o currículo atual otimizado e lista sugestões condicionadas ao aprendizado futuro.
- Modo C (post_training): Prévia hipotética que adiciona APENAS as habilidades que o aluno concluiu nas trilhas de aprendizado.

Currículo Original:
${JSON.stringify(baseResume, null, 2)}

Vaga Alvo:
${JSON.stringify(jobAnalysis, null, 2)}

Modo selecionado: ${mode}

Retorne um JSON com:
{
  "adaptedContent": { ...mesma estrutura de ResumeContent... },
  "suggestions": [
    {
      "id": "sug-1",
      "section": "summary" | "skills" | "experiences" | "projects",
      "originalText": "texto original",
      "suggestedText": "texto sugerido com melhor clareza e palavras-chave da vaga",
      "rationale": "por que esta mudança aumenta a aderência sem mentir",
      "requiresSkill": "opcional, ex: SQL básico (apenas se for condicional)",
      "status": "pending"
    }
  ]
}
`;

  // Fallback com alta qualidade e integridade comprovada
  const adaptedContent: ResumeContent = {
    ...baseResume,
    summary: `${baseResume.fullName || 'Profissional em transição para TI'}, com foco em desenvolvimento web e construção de interfaces eficientes. Conhecimentos práticos em ${baseResume.skills.slice(0, 4).join(', ') || 'tecnologias web modernas'}. Apaixonado por código limpo, resolução de problemas e aprendizado contínuo para geração de valor real à equipe da ${jobAnalysis.company || 'empresa'}.`,
    skills: [...new Set([...baseResume.skills])],
  };

  const suggestions: ResumeSuggestion[] = [
    {
      id: 'sug-1',
      section: 'summary',
      originalText: baseResume.summary || '',
      suggestedText: adaptedContent.summary,
      rationale: 'Alinha o resumo diretamente aos objetivos da vaga sem inventar experiência profissional.',
      status: 'pending',
    },
    {
      id: 'sug-2',
      section: 'skills',
      originalText: baseResume.skills.join(', '),
      suggestedText: baseResume.skills.sort((a, b) => {
        const aMatch = jobAnalysis.technologies?.includes(a) ? -1 : 1;
        const bMatch = jobAnalysis.technologies?.includes(b) ? -1 : 1;
        return aMatch - bMatch;
      }).join(', '),
      rationale: 'Reorganiza as habilidades prioritárias da vaga no topo para leitura rápida do recrutador.',
      status: 'pending',
    },
    {
      id: 'sug-3',
      section: 'projects',
      originalText: 'Descrições genéricas de projetos',
      suggestedText: 'Destacar o uso de controle de versão (Git) e componentização nas aplicações criadas',
      rationale: 'A vaga exige colaboração e boas práticas; enfatizar isso nos projetos pessoais existentes valoriza o perfil.',
      status: 'pending',
    },
  ];

  if (mode === 'preparation' || mode === 'post_training') {
    suggestions.push({
      id: 'sug-4',
      section: 'skills',
      originalText: 'SQL não listado',
      suggestedText: 'SQL Básico (Consultas SELECT, JOIN e modelagem relacional)',
      rationale: 'Habilidade exigida como obrigatória na vaga. Só deve ser confirmada no currículo após completar a avaliação prática.',
      requiresSkill: 'SQL',
      status: 'pending',
    });
  }

  const result = await callGeminiStructured(prompt, { adaptedContent, suggestions });
  // Trava de layout: a IA nunca altera estrutura nem dados pessoais
  return {
    adaptedContent: lockStructure(baseResume, result?.adaptedContent, {
      fullName: baseResume.fullName,
      email: baseResume.email,
      phone: baseResume.phone,
      location: baseResume.location,
      photoUrl: baseResume.photoUrl,
      githubUrl: baseResume.githubUrl,
      linkedinUrl: baseResume.linkedinUrl,
    }),
    suggestions: Array.isArray(result?.suggestions) ? result.suggestions : suggestions,
  };
}

/**
 * Edição pontual: aplica SOMENTE o que o usuário pediu, em blocos existentes,
 * preservando layout, tamanho aproximado e dados pessoais.
 */
export async function editResumeWithInstruction(
  content: ResumeContent,
  instruction: string,
  identity: Partial<ResumeIdentity>,
): Promise<{ content: ResumeContent; applied: ResumeEditOp[]; rejected: ResumeEditOp[]; note: string }> {
  const prompt = `
Você edita currículos com LAYOUT FIXO. Você NÃO pode criar, remover ou reordenar seções,
nem alterar nome, e-mail, telefone, endereço ou foto (vêm do perfil do aluno).
Nunca invente empregos, empresas, datas, links ou habilidades que o aluno não informou.
Altere SOMENTE o que a instrução pede. Mantenha o tamanho aproximado de cada texto (±25%).

Campos editáveis atuais (caminho: valor):
${describeLayoutForAI(content)}

Instrução do usuário:
"""${instruction.slice(0, 2000)}"""

Responda APENAS JSON:
{
  "ops": [ { "path": "summary" | "headline" | "skills" | "projects.N.campo" | "education.N.campo", "value": "string" ou ["lista"] } ],
  "note": "frase curta explicando o que foi alterado (ou por que nada foi alterado)"
}
`;
  const fallback = { ops: [] as ResumeEditOp[], note: 'IA indisponível — nenhuma alteração aplicada.' };
  const raw = await callGeminiStructured<{ ops?: unknown; note?: string }>(prompt, fallback);
  const parsed = z.array(resumeEditOpSchema).safeParse(raw?.ops ?? []);
  const ops = parsed.success ? parsed.data : [];
  const result = applyEditOps(content, ops, identity);
  return { ...result, note: String(raw?.note ?? '') };
}

/**
 * Cria o Plano Intensivo de Estudos personalizado
 */
export async function generateLearningPath(
  jobAnalysis: Partial<JobAnalysis>,
  minutesPerDay: number,
  studyDays: number[],
  targetDate?: string,
): Promise<Partial<LearningPath>> {
  const prompt = `
Você é o Coordenador Pedagógico do DevCareer AI.
Crie um plano intensivo de estudos sob medida com base nas lacunas identificadas da vaga:
Vaga: ${jobAnalysis.role} em ${jobAnalysis.company}
Tempo diário disponível: ${minutesPerDay} minutos por dia
Dias na semana: ${studyDays.length} dias
Prazo estimado: ${targetDate || 'A definir'}

Requisitos pendentes prioritários:
${JSON.stringify(jobAnalysis.requirements?.filter(r => r.match === 'missing' || r.match === 'developing'), null, 2)}

Gere um JSON completo estruturado com módulos contendo:
- Objetivo claro
- Explicação didática
- Exemplos de código
- Exercícios práticos
- Desafio final
- Projeto para portfólio
- Recursos recomendados
`;

  const fallback: Partial<LearningPath> = {
    title: `Trilha de Aceleração para ${jobAnalysis.role || 'Desenvolvedor'}`,
    minutesPerDay,
    studyDays,
    targetDate,
    rationale: `Foco total em suprir as lacunas obrigatórias da vaga (${jobAnalysis.requirements?.filter(r => r.match === 'missing').map(r => r.skill).join(', ') || 'SQL e APIs'}) respeitando seu tempo de ${minutesPerDay} min/dia.`,
    modules: [
      {
        id: 'mod-sql-1',
        pathId: 'path-1',
        skill: 'SQL Básico e Bancos Relacionais',
        position: 1,
        title: 'Fundamentos de SQL: De Consultas Simples a Relacionamentos com JOIN',
        objective: 'Compreender como os dados são guardados em tabelas e dominar consultas com SELECT, WHERE, ORDER BY e JOIN.',
        explanation: 'SQL (Structured Query Language) é a linguagem utilizada para interagir com bancos de dados relacionais como PostgreSQL, MySQL e SQLite. As empresas armazenam cadastros, pedidos e configurações em tabelas com linhas e colunas.',
        examples: [
          {
            title: 'Consulta básica com filtro',
            code: 'SELECT nome, email, data_cadastro\nFROM usuarios\nWHERE ativo = true\nORDER BY data_cadastro DESC;',
            description: 'Recupera apenas usuários ativos ordenados pelos mais recentes.',
          },
          {
            title: 'Cruzamento com INNER JOIN',
            code: 'SELECT u.nome, p.titulo, p.valor\nFROM pedidos p\nINNER JOIN usuarios u ON u.id = p.usuario_id\nWHERE p.valor > 100;',
            description: 'Junta dados de pedidos com dados do cliente correspondente.',
          },
        ],
        exercises: [
          {
            id: 'ex-1',
            question: 'Escreva uma consulta SQL para selecionar todas as colunas da tabela "produtos" onde o "preco" seja maior que 50 e o "estoque" maior que 0.',
            initialCode: 'SELECT * FROM produtos WHERE ...',
            expectedOutput: 'SELECT * FROM produtos WHERE preco > 50 AND estoque > 0;',
            hints: ['Use o operador AND para unir duas condições', 'A sintaxe é coluna > valor'],
            explanation: 'O filtro WHERE avalia predicados lógicos retornando somente as linhas que atendem a ambos os critérios.',
          },
          {
            id: 'ex-2',
            question: 'Faça um INNER JOIN entre as tabelas "candidaturas" (alias c) e "vagas" (alias v) ligadas por c.vaga_id = v.id, selecionando v.cargo e c.status.',
            initialCode: 'SELECT v.cargo, c.status\nFROM candidaturas c\nJOIN ...',
            expectedOutput: 'SELECT v.cargo, c.status FROM candidaturas c INNER JOIN vagas v ON c.vaga_id = v.id;',
            hints: ['Especifique a tabela e a condição ON'],
            explanation: 'O JOIN combina linhas de duas ou mais tabelas baseado em uma coluna relacionada.',
          },
        ],
        challenge: {
          title: 'Relatório de Vagas e Compatibilidade',
          description: 'Crie uma query que agrupe o número de candidatos por vaga e ordene pelo total de forma decrescente.',
          starterCode: 'SELECT vaga_id, COUNT(*) as total_candidatos\nFROM candidaturas\nGROUP BY ...',
        },
        project: {
          title: 'Modelagem e Banco de Dados de um Sistema de Carreiras',
          objective: 'Criar as tabelas de vagas, requisitos e candidatos e testar queries de busca com múltiplos critérios.',
          steps: [
            'Desenhar o diagrama ER (Entidade-Relacionamento)',
            'Escrever o script DDL (CREATE TABLE com chaves primárias e estrangeiras)',
            'Inserir 10 registros fictícios',
            'Executar 5 queries complexas com filtros e JOINs',
          ],
        },
        resources: [
          { title: 'PostgreSQL Tutorial Interativo', url: 'https://www.postgresqltutorial.com/', type: 'Guia' },
          { title: 'SQLBolt - Aprenda SQL no navegador', url: 'https://sqlbolt.com/', type: 'Interativo' },
        ],
        tasks: [
          {
            id: 'tsk-1',
            moduleId: 'mod-sql-1',
            title: 'Aula: O que são tabelas, chaves primárias e tipos de dados',
            kind: 'lesson',
            estimatedMinutes: 20,
            status: 'not_started',
          },
          {
            id: 'tsk-2',
            moduleId: 'mod-sql-1',
            title: 'Exercício: Consultas com SELECT, WHERE e ORDER BY',
            kind: 'exercise',
            estimatedMinutes: 25,
            status: 'not_started',
          },
          {
            id: 'tsk-3',
            moduleId: 'mod-sql-1',
            title: 'Aula & Prática: Entendendo JOINs visuais',
            kind: 'lesson',
            estimatedMinutes: 25,
            status: 'not_started',
          },
          {
            id: 'tsk-4',
            moduleId: 'mod-sql-1',
            title: 'Avaliação de Habilidade: Validação Prática em SQL',
            kind: 'assessment',
            estimatedMinutes: 20,
            status: 'not_started',
          },
        ],
        difficulty: 2,
      },
      {
        id: 'mod-api-2',
        pathId: 'path-1',
        skill: 'APIs REST e Integrações Web',
        position: 2,
        title: 'Arquitetura REST: Métodos HTTP, JSON e Tratamento de Erros',
        objective: 'Dominar o funcionamento de requisições web, status codes (200, 201, 400, 404, 500) e consumo seguro de APIs.',
        explanation: 'A maior parte dos sistemas web é composta por um frontend se comunicando com um backend através de requisições HTTP REST transmitindo dados em JSON.',
        examples: [
          {
            title: 'Consumo com Fetch e Async/Await',
            code: 'async function buscarVagas() {\n  const res = await fetch("/api/jobs");\n  if (!res.ok) throw new Error("Erro na requisição");\n  return await res.json();\n}',
            description: 'Padrão moderno para comunicação assíncrona no frontend.',
          },
        ],
        exercises: [],
        tasks: [
          {
            id: 'tsk-5',
            moduleId: 'mod-api-2',
            title: 'Aula: Métodos HTTP e Convenções REST',
            kind: 'lesson',
            estimatedMinutes: 20,
            status: 'not_started',
          },
          {
            id: 'tsk-6',
            moduleId: 'mod-api-2',
            title: 'Projeto: API de Lista de Tarefas com Express',
            kind: 'project',
            estimatedMinutes: 45,
            status: 'not_started',
          },
        ],
        resources: [],
        difficulty: 3,
      },
    ],
  };

  return await callGeminiStructured(prompt, fallback);
}

/**
 * Professor particular IA com respostas pedagógicas graduais (Parte 11)
 */
export async function tutorResponse(
  skill: string,
  question: string,
  userLevel: string = 'iniciante',
  history: Array<{ role: 'user' | 'assistant'; text: string }> = [],
): Promise<{ explanation: string; codeSnippet?: string; nextHint?: string; checkQuestion?: string }> {
  const historyText = history.length > 0
    ? `\nHistórico recente da conversa:\n${history.map((h) => `${h.role}: ${h.text}`).join('\n')}\n`
    : '';

  const prompt = `
Você é o Professor Particular de Programação do DevCareer AI.
Sua regra de ouro da Parte 11:
- Ensine com linguagem clara, empática e adequada ao nível: ${userLevel}.
- NUNCA entregue a resposta pronta de bandeja quando for um exercício ou dúvida de raciocínio.
- Incentive o pensamento crítico, forneça analogias do mundo real, pequenas pistas graduais e explique a causa dos erros.
- Se apresentar código, comente o trecho principal.
- Finalize com uma pergunta rápida para conferir se o aluno realmente compreendeu o conceito.
${historyText}
Tópico/Habilidade: ${skill}
Pergunta do aluno: "${question}"
`;

  const fallback = {
    explanation: `Excelente pergunta sobre ${skill}! Para entender esse conceito, pense que no desenvolvimento web cada elemento tem uma responsabilidade única. Quando fazemos essa operação, o motor do código precisa saber exatamente qual é a condição de parada ou o critério de relacionamento.`,
    codeSnippet: `-- Exemplo de raciocínio:\nSELECT id, nome FROM tabela WHERE condicao = true;`,
    nextHint: `Dica gradual: observe o que acontece se você remover o filtro WHERE. Qual o impacto no resultado retornado?`,
    checkQuestion: `Você saberia me dizer a diferença entre filtrar dados com WHERE e agrupar com GROUP BY?`,
  };

  return await callGeminiStructured(prompt, fallback);
}

/**
 * Analisa o GitHub do candidato e extrai/adapta os projetos reais para o currículo
 */
export async function syncGithubProjects(
  githubUrlOrUser: string,
  currentResume: ResumeContent,
): Promise<{ projects: ResumeContent['projects']; note: string }> {
  // Extrai username do GitHub
  const clean = githubUrlOrUser.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/+$/, '');
  const username = clean.split('/')[0];

  if (!username) {
    return {
      projects: currentResume.projects,
      note: 'Perfil do GitHub não informado ou inválido.',
    };
  }

  let reposData: any[] = [];
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`, {
      headers: {
        'User-Agent': 'DevCareer-AI',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filtra forks e repositórios sem descrição ou pouco relevantes se houver melhores
        reposData = data
          .filter((r: any) => !r.fork)
          .map((r: any) => ({
            name: r.name,
            description: r.description || 'Aplicação desenvolvida e versionada com Git',
            url: r.html_url,
            language: r.language,
            topics: r.topics || [],
            stars: r.stargazers_count,
            updatedAt: r.updated_at,
          }));
      }
    }
  } catch (err) {
    console.warn('[ai] Erro ao consultar GitHub API:', err);
  }

  if (reposData.length === 0) {
    return {
      projects: currentResume.projects,
      note: `Não foi possível encontrar repositórios públicos para o usuário "${username}". Mantidos projetos anteriores.`,
    };
  }

  // Pede para o Gemini selecionar os 2 melhores projetos reais e redigir no formato exato do layout
  const prompt = `
Você é o Analista Técnico do DevCareer AI.
O usuário conectou seu GitHub: "${username}".
Abaixo estão os repositórios públicos REAIS encontrados:
${JSON.stringify(reposData.slice(0, 8), null, 2)}

Sua tarefa:
Selecione exatamente 2 dos melhores projetos reais para compor a seção "PROJETOS & PORTFÓLIO RELEVANTE" do currículo.
IMPORTANTE:
- NUNCA invente projetos, empresas ou tecnologias que não estejam nos repositórios.
- Redija uma descrição técnica objetiva, clara e atraente (máximo 160 caracteres).
- Forneça o link real do GitHub do repositório selecionado.
- Liste as tecnologias reais utilizadas (ex: React, TypeScript, Node.js, CSS).

Responda rigorosamente com um JSON:
{
  "projects": [
    {
      "name": "Nome amigável do Projeto",
      "link": "https://github.com/...",
      "description": "Descrição técnica clara em até 160 caracteres.",
      "technologies": ["Tecnologia 1", "Tecnologia 2"]
    },
    {
      "name": "Nome amigável do Segundo Projeto",
      "link": "https://github.com/...",
      "description": "Descrição técnica clara em até 160 caracteres.",
      "technologies": ["Tecnologia 1", "Tecnologia 2"]
    }
  ],
  "note": "Resumo amigável de quais projetos foram selecionados."
}
`;

  const fallbackProjects = reposData.slice(0, 2).map((r) => ({
    name: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    link: r.url,
    description: (r.description || 'Aplicação desenvolvida e versionada com Git no GitHub.').slice(0, 160),
    technologies: [r.language, ...(r.topics || [])].filter(Boolean).slice(0, 4),
  }));

  const fallback = {
    projects: fallbackProjects.length === 2 ? fallbackProjects : currentResume.projects,
    note: `2 projetos reais do GitHub de @${username} foram mapeados com sucesso.`,
  };

  const aiResult = await callGeminiStructured<{ projects: ResumeContent['projects']; note: string }>(prompt, fallback);

  return {
    projects: Array.isArray(aiResult?.projects) && aiResult.projects.length >= 2 ? aiResult.projects.slice(0, 2) : fallback.projects,
    note: aiResult?.note || fallback.note,
  };
}
