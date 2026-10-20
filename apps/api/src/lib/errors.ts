import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/** An error whose message is safe to show to end users. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const notConfigured = (variable: string, how: string) =>
  new HttpError(503, 'integration_not_configured', `Integração não configurada: defina ${variable} em apps/api/.env. ${how}`, {
    variable,
  });

/**
 * Central error handler. Logs only metadata (never request bodies, which may contain
 * resumes or personal data) and never leaks stack traces to the client.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, ...err.details } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Dados inválidos.',
        issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }
  const e = err as { type?: string; status?: number };
  if (e?.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'payload_too_large', message: 'Conteúdo maior que o limite permitido.' } });
    return;
  }
  console.error(`[api] ${req.method} ${req.path} failed:`, err instanceof Error ? err.message : 'unknown error');
  res.status(500).json({ error: { code: 'internal_error', message: 'Algo deu errado. Tente novamente em instantes.' } });
}
