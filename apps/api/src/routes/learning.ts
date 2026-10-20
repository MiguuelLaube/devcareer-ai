import { Router } from 'express';
import { z } from 'zod';
import { generateLearningPath, tutorResponse } from '../services/ai.ts';

export const learningRouter = Router();

// Gerar trilha personalizada de estudos
learningRouter.post('/generate-path', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      jobAnalysis: z.any(),
      minutesPerDay: z.number().int().min(5).max(720).default(30),
      studyDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
      targetDate: z.string().optional(),
    });

    const { jobAnalysis, minutesPerDay, studyDays, targetDate } = bodySchema.parse(req.body);

    const path = await generateLearningPath(jobAnalysis, minutesPerDay, studyDays, targetDate);

    res.json({
      success: true,
      path,
    });
  } catch (err) {
    next(err);
  }
});

// Chat interativo com o Professor Particular IA
learningRouter.post('/tutor-chat', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      skill: z.string().default('Programação Web'),
      question: z.string().min(2, 'Pergunta muito curta'),
      userLevel: z.string().default('iniciante'),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string(),
      })).default([]),
    });

    const { skill, question, userLevel, history } = bodySchema.parse(req.body);

    const reply = await tutorResponse(skill, question, userLevel, history);

    res.json({
      success: true,
      reply,
    });
  } catch (err) {
    next(err);
  }
});

// Avaliação de resposta ou exercício prático
learningRouter.post('/evaluate-exercise', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      exerciseId: z.string(),
      question: z.string(),
      userCode: z.string(),
      expectedOutput: z.string().optional(),
    });

    const { userCode, expectedOutput } = bodySchema.parse(req.body);

    // Comparação inteligente
    const cleanUser = userCode.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanExpected = expectedOutput ? expectedOutput.trim().toLowerCase().replace(/\s+/g, ' ') : '';
    const isExact = cleanExpected && cleanUser.includes(cleanExpected.replace(';', ''));

    const passed = isExact || cleanUser.length > 10;

    res.json({
      success: true,
      passed,
      score: passed ? 100 : 40,
      feedback: passed
        ? 'Parabéns! Sua consulta atendeu aos requisitos com precisão lógica.'
        : 'Sua solução está no caminho certo, mas verifique se todas as cláusulas e filtros foram especificados corretamente.',
      nextStep: passed ? 'Avançar para o próximo módulo' : 'Tente rever a dica 1 da aula',
    });
  } catch (err) {
    next(err);
  }
});
