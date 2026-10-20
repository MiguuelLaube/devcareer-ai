import type { NextFunction, Request, Response } from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { HttpError } from '../lib/errors.ts';
import { supabaseForUser } from '../lib/supabase.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    db?: SupabaseClient;
  }
}

/** Verifies the Supabase JWT and attaches an RLS-scoped client to the request. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(new HttpError(401, 'unauthorized', 'Sessão expirada. Entre novamente.'));

  try {
    const db = supabaseForUser(token);
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return next(new HttpError(401, 'unauthorized', 'Sessão expirada. Entre novamente.'));
    req.user = data.user;
    req.db = db;
    next();
  } catch (err) {
    next(err);
  }
}
