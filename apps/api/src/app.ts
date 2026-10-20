import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env, integrationStatus } from './env.ts';
import { errorHandler, HttpError } from './lib/errors.ts';
import { requireAuth } from './middleware/auth.ts';
import { accountRouter } from './routes/account.ts';
import { jobsRouter } from './routes/jobs.ts';
import { resumesRouter } from './routes/resumes.ts';
import { learningRouter } from './routes/learning.ts';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: false }));
  app.use(express.json({ limit: '5mb' }));

  // Proteção global contra abuso
  app.use(
    rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, integrations: integrationStatus() });
  });

  // Rotas de Domínio DevCareer AI
  app.use('/api/jobs', jobsRouter);
  app.use('/api/resumes', resumesRouter);
  app.use('/api/learning', learningRouter);
  app.use('/api/account', requireAuth, accountRouter);

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'not_found', 'Rota não encontrada.')));
  app.use(errorHandler);
  return app;
}
