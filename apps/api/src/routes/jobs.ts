import { Router } from 'express';
import { z } from 'zod';
import { analyzeJobText } from '../services/ai.ts';

export const jobsRouter = Router();

// Analisar vaga (por texto ou link)
jobsRouter.post('/analyze', async (req, res, next) => {
  try {
    const bodySchema = z.object({
      text: z.string().min(10, 'O texto da vaga deve conter ao menos 10 caracteres.'),
      sourceUrl: z.string().optional(),
      userProfile: z.any().optional(),
    });

    const { text, sourceUrl, userProfile } = bodySchema.parse(req.body);

    const analysis = await analyzeJobText(text, userProfile);

    // Se estiver autenticado e com banco disponível, podemos persistir
    const db = req.db;
    let savedJobId = `job-${Date.now()}`;

    if (db && req.user) {
      try {
        const { data: jobRow } = await db.from('jobs').insert({
          user_id: req.user.id,
          source: sourceUrl ? 'url' : 'text',
          source_url: sourceUrl || null,
          raw_text: text,
          title: analysis.role || 'Vaga em Análise',
          company: analysis.company || 'Empresa',
          seniority: analysis.seniority || 'Júnior',
        }).select().single();

        if (jobRow) {
          savedJobId = jobRow.id;
          await db.from('job_analyses').insert({
            user_id: req.user.id,
            job_id: jobRow.id,
            summary: analysis,
            compatibility_score: analysis.compatibilityScore || 0,
            compatibility_breakdown: analysis.compatibilityCriteria || [],
            model: 'gemini-2.5-flash',
          });
        }
      } catch (dbErr) {
        console.warn('[jobs] Não foi possível salvar no banco remoto (Supabase offline), retornando análise diretamente:', dbErr);
      }
    }

    res.json({
      success: true,
      jobId: savedJobId,
      analysis,
    });
  } catch (err) {
    next(err);
  }
});
