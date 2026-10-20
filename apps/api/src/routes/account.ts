import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../lib/errors.ts';
import { supabaseAdmin } from '../lib/supabase.ts';

export const accountRouter = Router();

/**
 * Exportação dos dados do próprio usuário (LGPD — direito de acesso).
 * Uses the RLS-scoped client, so only the caller's rows are returned.
 */
const EXPORT_TABLES = [
  'resumes', 'resume_versions', 'resume_suggestions', 'jobs', 'job_requirements', 'job_analyses',
  'skill_profiles', 'learning_paths', 'learning_modules', 'learning_tasks', 'assessments',
  'assessment_attempts', 'portfolio_projects', 'applications', 'study_sessions',
] as const;

accountRouter.get('/export', async (req, res, next) => {
  try {
    const db = req.db!;
    const out: Record<string, unknown> = {};
    const { data: profile } = await db.from('profiles').select('*').eq('id', req.user!.id).maybeSingle();
    out.profile = profile;
    for (const t of EXPORT_TABLES) {
      const { data, error } = await db.from(t).select('*');
      if (error) throw new Error(`export ${t} failed`);
      out[t] = data;
    }
    res.setHeader('Content-Disposition', 'attachment; filename="devcareer-dados.json"');
    res.json(out);
  } catch (err) {
    next(err);
  }
});

/**
 * Exclusão definitiva da conta. Requires the user to type the confirmation phrase.
 * Storage files are removed first; all table rows cascade from auth.users.
 */
accountRouter.delete('/', async (req, res, next) => {
  try {
    const { confirm } = z.object({ confirm: z.string() }).parse(req.body);
    if (confirm !== 'EXCLUIR') throw new HttpError(400, 'confirmation_required', 'Digite EXCLUIR para confirmar.');

    const admin = supabaseAdmin();
    const userId = req.user!.id;

    const { data: files } = await admin.storage.from('documents').list(userId, { limit: 1000 });
    if (files?.length) {
      await admin.storage.from('documents').remove(files.map((f) => `${userId}/${f.name}`));
    }
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error('delete user failed');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
