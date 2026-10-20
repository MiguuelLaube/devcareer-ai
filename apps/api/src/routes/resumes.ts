import { Router } from 'express';
import { z } from 'zod';
import { adaptResume, editResumeWithInstruction, syncGithubProjects } from '../services/ai.ts';
import { resumeContentSchema, resumeIdentitySchema } from '@devcareer/shared';

export const resumesRouter = Router();

// Adaptação de currículo por IA
resumesRouter.post('/adapt', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      baseResume: resumeContentSchema,
      jobAnalysis: z.any(),
      mode: z.enum(['immediate', 'preparation', 'post_training']).default('immediate'),
    });

    const { baseResume, jobAnalysis, mode } = bodySchema.parse(req.body);

    const result = await adaptResume(baseResume, jobAnalysis, mode);

    res.json({
      success: true,
      adaptedContent: result.adaptedContent,
      suggestions: result.suggestions,
      mode,
    });
  } catch (err) {
    next(err);
  }
});

// Edição pontual por instrução, preservando layout e dados pessoais
resumesRouter.post('/edit', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      content: resumeContentSchema,
      instruction: z.string().trim().min(3, 'Descreva a alteração desejada.').max(2000),
      identity: resumeIdentitySchema.partial().default({}),
    });
    const { content, instruction, identity } = bodySchema.parse(req.body);
    const result = await editResumeWithInstruction(content, instruction, identity);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Sincronizar e analisar projetos reais do GitHub do aluno
resumesRouter.post('/sync-github', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      githubUrl: z.string().min(1, 'Informe o perfil ou URL do GitHub.'),
      currentResume: resumeContentSchema,
    });
    const { githubUrl, currentResume } = bodySchema.parse(req.body);
    const result = await syncGithubProjects(githubUrl, currentResume);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

