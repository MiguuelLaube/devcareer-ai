import { Router } from 'express';
import { z } from 'zod';
import { analyzeJobText } from '../services/ai.ts';
import { requireAuth } from '../middleware/auth.ts';
import { HttpError } from '../lib/errors.ts';

export const jobsRouter = Router();

// Listar todas as vagas e análises anteriores do usuário logado (Histórico)
jobsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = req.db!;
    const { data: jobs, error } = await db
      .from('jobs')
      .select('*, job_analyses(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, jobs: jobs || [] });
  } catch (err) {
    next(err);
  }
});

// Reabrir uma vaga e análise específica por ID
jobsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = req.db!;
    const { id } = req.params;
    const { data: job, error } = await db
      .from('jobs')
      .select('*, job_analyses(*), job_requirements(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!job) throw new HttpError(404, 'not_found', 'Vaga não encontrada.');
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
});

// Analisar vaga (por texto ou link) e persistir no Supabase
jobsRouter.post('/analyze', requireAuth, async (req, res, next) => {
  try {
    const bodySchema = z.object({
      text: z.string().min(10, 'O texto da vaga deve conter ao menos 10 caracteres.'),
      sourceUrl: z.string().optional(),
      userProfile: z.any().optional(),
    });

    const { text, sourceUrl, userProfile } = bodySchema.parse(req.body);
    const analysis = await analyzeJobText(text, userProfile);

    const db = req.db!;
    const user = req.user!;
    let savedJobId = `job-${Date.now()}`;

    try {
      const { data: jobRow, error: jobErr } = await db.from('jobs').insert({
        user_id: user.id,
        source: sourceUrl ? 'url' : 'text',
        source_url: sourceUrl || null,
        raw_text: text,
        title: analysis.role || 'Vaga em Análise',
        company: analysis.company || 'Empresa Confidencial',
        seniority: analysis.seniority || 'Júnior',
      }).select().single();

      if (jobErr) throw jobErr;

      if (jobRow) {
        savedJobId = jobRow.id;
        await db.from('job_analyses').insert({
          user_id: user.id,
          job_id: jobRow.id,
          summary: analysis,
          compatibility_score: analysis.compatibilityScore || 0,
          compatibility_breakdown: analysis.compatibilityCriteria || [],
          model: 'gemini-3.8-flash',
        });

        if (Array.isArray(analysis.requirements) && analysis.requirements.length > 0) {
          const reqRows = analysis.requirements.map((r: any) => ({
            user_id: user.id,
            job_id: jobRow.id,
            skill: r.skill,
            category: r.category || 'Geral',
            kind: r.kind || 'required',
            importance: r.importance || 3,
            plain_explanation: r.plainExplanation || '',
            match: r.match || 'not_evaluated',
            evidence: r.evidence || '',
            gap: r.gap || '',
            next_action: r.nextAction || '',
          }));
          await db.from('job_requirements').insert(reqRows);
        }
      }
    } catch (dbErr) {
      console.warn('[jobs] Erro ao persistir no Supabase:', dbErr);
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
