import { z } from 'zod';
import { declaredLevelSchema, WEEKDAYS } from './enums.ts';

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Informe uma URL começando com http:// ou https://')
  .default('');

const shortText = (max = 160) => z.string().trim().max(max).default('');

export const technologySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome').max(60),
  level: declaredLevelSchema,
});
export type Technology = z.infer<typeof technologySchema>;

export const experienceSchema = z.object({
  role: z.string().trim().min(1, 'Informe o cargo').max(120),
  company: z.string().trim().min(1, 'Informe a empresa').max(120),
  start: shortText(20),
  end: shortText(20),
  description: shortText(2000),
});
export type Experience = z.infer<typeof experienceSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome').max(120),
  kind: z.enum(['personal', 'academic', 'professional']).default('personal'),
  description: shortText(2000),
  technologies: z.array(z.string().trim().max(60)).max(30).default([]),
  url: optionalUrl,
});
export type Project = z.infer<typeof projectSchema>;

export const courseSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome').max(160),
  institution: shortText(120),
  year: shortText(10),
});
export type Course = z.infer<typeof courseSchema>;

export const languageSchema = z.object({
  name: z.string().trim().min(1, 'Informe o idioma').max(40),
  level: z.enum(['basic', 'intermediate', 'advanced', 'fluent', 'native']),
});
export type Language = z.infer<typeof languageSchema>;

/**
 * Editable profile (Parte 5). Email is owned by Supabase Auth and is not part of this payload.
 */
export const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Informe seu nome').max(120),
  education: shortText(120),
  institution: shortText(120),
  academic_period: shortText(40),
  career_goal: shortText(500),
  technologies: z.array(technologySchema).max(80).default([]),
  experiences: z.array(experienceSchema).max(30).default([]),
  projects: z.array(projectSchema).max(40).default([]),
  courses: z.array(courseSchema).max(40).default([]),
  certifications: z.array(courseSchema).max(40).default([]),
  languages: z.array(languageSchema).max(15).default([]),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  portfolio_url: optionalUrl,
  study_minutes_per_day: z.number().int().min(5).max(720).nullable().default(null),
  study_days: z.array(z.number().int().min(0).max(6)).max(WEEKDAYS.length).default([]),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .nullable()
    .default(null),
});
export type ProfileInput = z.input<typeof profileSchema>;
export type Profile = z.output<typeof profileSchema>;
