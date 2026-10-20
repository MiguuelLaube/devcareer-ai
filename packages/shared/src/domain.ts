import { z } from 'zod';
import {
  adaptationModeSchema,
  applicationStatusSchema,
  requirementMatchSchema,
  resumeTemplateSchema,
  taskStatusSchema,
} from './enums.ts';

// Requisitos identificados na vaga
export const jobRequirementSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  skill: z.string().min(1),
  category: z.string().default('Geral'), // Linguagem, Framework, Banco, Metodologia, etc.
  kind: z.enum(['required', 'preferred']).default('required'),
  importance: z.number().int().min(1).max(5).default(3),
  plainExplanation: z.string().default(''),
  match: requirementMatchSchema.default('not_evaluated'),
  evidence: z.string().default(''),
  gap: z.string().default(''),
  nextAction: z.string().default(''),
});
export type JobRequirement = z.infer<typeof jobRequirementSchema>;

// Análise detalhada da vaga
export const jobAnalysisSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  role: z.string(),
  company: z.string(),
  seniority: z.string(),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  requirements: z.array(jobRequirementSchema).default([]),
  compatibilityScore: z.number().min(0).max(100).default(0),
  compatibilityCriteria: z.array(z.string()).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
});
export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

// Vaga cadastrada
export const jobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  company: z.string().default('Empresa Confidencial'),
  source: z.enum(['text', 'url', 'pdf']).default('text'),
  sourceUrl: z.string().optional(),
  rawText: z.string(),
  deadline: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  analysis: jobAnalysisSchema.optional(),
});
export type Job = z.infer<typeof jobSchema>;

// Sugestão de melhoria no currículo
export const resumeSuggestionSchema = z.object({
  id: z.string(),
  section: z.string(),
  originalText: z.string().default(''),
  suggestedText: z.string(),
  rationale: z.string(),
  requiresSkill: z.string().optional(), // Habilidade condicionada
  status: z.enum(['pending', 'accepted', 'rejected', 'edited']).default('pending'),
});
export type ResumeSuggestion = z.infer<typeof resumeSuggestionSchema>;

// Conteúdo estruturado do currículo
export const resumeContentSchema = z.object({
  fullName: z.string(),
  headline: z.string().default(''),
  email: z.string(),
  phone: z.string().default(''),
  location: z.string().default(''),
  photoUrl: z.string().default(''),
  githubUrl: z.string().default(''),
  linkedinUrl: z.string().default(''),
  summary: z.string(),
  skills: z.array(z.string()).default([]),
  experiences: z.array(z.object({
    role: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.string(),
    highlights: z.array(z.string()).default([]),
  })).default([]),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    period: z.string(),
  })).default([]),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).default([]),
    link: z.string().optional(),
  })).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});
export type ResumeContent = z.infer<typeof resumeContentSchema>;

// Versão do currículo
export const resumeVersionSchema = z.object({
  id: z.string(),
  resumeId: z.string(),
  jobId: z.string().optional(),
  versionNumber: z.number().int().default(1),
  label: z.string(),
  mode: adaptationModeSchema.default('immediate'),
  template: resumeTemplateSchema.default('classic'),
  content: resumeContentSchema,
  isPreview: z.boolean().default(false), // true se for versão hipotética pós-treinamento
  suggestions: z.array(resumeSuggestionSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
});
export type ResumeVersion = z.infer<typeof resumeVersionSchema>;

// Currículo pai
export const resumeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  isBase: z.boolean().default(false),
  currentVersionId: z.string().optional(),
  versions: z.array(resumeVersionSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type Resume = z.infer<typeof resumeSchema>;

// Tarefa de aprendizado
export const learningTaskSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  kind: z.enum(['lesson', 'exercise', 'challenge', 'project', 'assessment', 'review']).default('lesson'),
  estimatedMinutes: z.number().default(15),
  scheduledFor: z.string().optional(), // YYYY-MM-DD
  status: taskStatusSchema.default('not_started'),
  completedAt: z.string().optional(),
  interactiveData: z.record(z.string(), z.any()).optional(), // Conteúdo dinâmico da aula/exercício
});
export type LearningTask = z.infer<typeof learningTaskSchema>;

// Módulo de aprendizado
export const learningModuleSchema = z.object({
  id: z.string(),
  pathId: z.string(),
  skill: z.string(),
  position: z.number().int().default(1),
  title: z.string(),
  objective: z.string(),
  explanation: z.string(),
  examples: z.array(z.object({
    title: z.string(),
    code: z.string(),
    description: z.string(),
  })).default([]),
  exercises: z.array(z.object({
    id: z.string(),
    question: z.string(),
    initialCode: z.string().optional(),
    expectedOutput: z.string().optional(),
    hints: z.array(z.string()).default([]),
    explanation: z.string().default(''),
  })).default([]),
  challenge: z.object({
    title: z.string(),
    description: z.string(),
    starterCode: z.string().optional(),
  }).optional(),
  project: z.object({
    title: z.string(),
    objective: z.string(),
    steps: z.array(z.string()).default([]),
  }).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string(),
  })).default([]),
  tasks: z.array(learningTaskSchema).default([]),
  difficulty: z.number().int().min(1).max(5).default(2),
});
export type LearningModule = z.infer<typeof learningModuleSchema>;

// Trilha de aprendizado
export const learningPathSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string().optional(),
  title: z.string(),
  minutesPerDay: z.number().default(30),
  studyDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
  targetDate: z.string().optional(),
  rationale: z.string().default(''),
  modules: z.array(learningModuleSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
});
export type LearningPath = z.infer<typeof learningPathSchema>;

// Avaliação e Pergunta
export const assessmentQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'written', 'code_interpretation', 'code_challenge']),
  prompt: z.string(),
  codeSnippet: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().optional(),
  expectedAnswer: z.string().optional(),
  hints: z.array(z.string()).default([]),
  explanation: z.string(),
});
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const assessmentSchema = z.object({
  id: z.string(),
  skill: z.string(),
  title: z.string(),
  passingScore: z.number().default(70),
  questions: z.array(assessmentQuestionSchema).default([]),
});
export type Assessment = z.infer<typeof assessmentSchema>;

// Candidatura (Pipeline de Vagas)
export const applicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string().optional(),
  role: z.string(),
  company: z.string(),
  url: z.string().optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  compatibilityScore: z.number().optional(),
  notes: z.string().default(''),
  status: applicationStatusSchema.default('interesting'),
  resumeVersionId: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type Application = z.infer<typeof applicationSchema>;

// Projeto de Portfólio
export const portfolioProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  objective: z.string(),
  technologies: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  completionCriteria: z.array(z.string()).default([]),
  documentationGuide: z.string().default(''),
  status: z.enum(['suggested', 'in_progress', 'completed', 'abandoned']).default('suggested'),
  repositoryUrl: z.string().optional(),
  completedAt: z.string().optional(),
});
export type PortfolioProject = z.infer<typeof portfolioProjectSchema>;
