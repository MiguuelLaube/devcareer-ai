import { z } from 'zod';

/**
 * Domain enums. These mirror the Postgres enum types in
 * supabase/migrations so that frontend, backend and database agree.
 */

/** Self-declared knowledge level (Parte 5). */
export const DECLARED_LEVELS = ['none', 'learning', 'basic', 'intermediate', 'advanced'] as const;
export const declaredLevelSchema = z.enum(DECLARED_LEVELS);
export type DeclaredLevel = z.infer<typeof declaredLevelSchema>;
export const DECLARED_LEVEL_LABELS: Record<DeclaredLevel, string> = {
  none: 'Não conheço',
  learning: 'Estou aprendendo',
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

/** Evidence-based skill state (Parte 13). Not a certification. */
export const SKILL_STATES = [
  'unknown',
  'learning',
  'assessing',
  'basic_demonstrated',
  'intermediate_demonstrated',
  'advanced_demonstrated',
] as const;
export const skillStateSchema = z.enum(SKILL_STATES);
export type SkillState = z.infer<typeof skillStateSchema>;
export const SKILL_STATE_LABELS: Record<SkillState, string> = {
  unknown: 'Não conhecida',
  learning: 'Em aprendizado',
  assessing: 'Em avaliação',
  basic_demonstrated: 'Básico demonstrado',
  intermediate_demonstrated: 'Intermediário demonstrado',
  advanced_demonstrated: 'Avançado demonstrado',
};

/** Requirement match against the job (Parte 8). */
export const REQUIREMENT_MATCHES = ['met', 'partial', 'developing', 'missing', 'not_evaluated'] as const;
export const requirementMatchSchema = z.enum(REQUIREMENT_MATCHES);
export type RequirementMatch = z.infer<typeof requirementMatchSchema>;
export const REQUIREMENT_MATCH_LABELS: Record<RequirementMatch, string> = {
  met: 'Atendido',
  partial: 'Parcialmente atendido',
  developing: 'Em desenvolvimento',
  missing: 'Pendente',
  not_evaluated: 'Não avaliado',
};

/** Learning task status (Parte 10). */
export const TASK_STATUSES = ['not_started', 'in_progress', 'completed', 'needs_review'] as const;
export const taskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Não iniciada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  needs_review: 'Precisa revisar',
};

/** Application pipeline status (Parte 15). */
export const APPLICATION_STATUSES = [
  'interesting',
  'preparing_resume',
  'studying',
  'ready',
  'applied',
  'interview',
  'approved',
  'not_selected',
  'closed',
] as const;
export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interesting: 'Interessante',
  preparing_resume: 'Preparando currículo',
  studying: 'Estudando para a vaga',
  ready: 'Pronto para se candidatar',
  applied: 'Candidatado',
  interview: 'Entrevista',
  approved: 'Aprovado',
  not_selected: 'Não selecionado',
  closed: 'Encerrado',
};

/** Resume adaptation modes (Parte 9.2). */
export const ADAPTATION_MODES = ['immediate', 'preparation', 'post_training'] as const;
export const adaptationModeSchema = z.enum(ADAPTATION_MODES);
export type AdaptationMode = z.infer<typeof adaptationModeSchema>;

/** Resume templates (Parte 16). */
export const RESUME_TEMPLATES = ['classic', 'minimal', 'developer', 'internship'] as const;
export const resumeTemplateSchema = z.enum(RESUME_TEMPLATES);
export type ResumeTemplate = z.infer<typeof resumeTemplateSchema>;

export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const DAILY_MINUTES_PRESETS = [15, 30, 60, 120] as const;
