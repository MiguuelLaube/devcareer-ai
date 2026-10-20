import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env.ts';
import { notConfigured } from './errors.ts';

/**
 * Client acting as the end user: every query passes through RLS with the user's JWT.
 * This is the default for all data access in the API.
 */
export function supabaseForUser(accessToken: string): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw notConfigured('SUPABASE_URL e SUPABASE_ANON_KEY', 'Copie os valores em Supabase → Project Settings → API.');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let admin: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS — use only for operations that require it (account deletion). */
export function supabaseAdmin(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw notConfigured(
      'SUPABASE_SERVICE_ROLE_KEY',
      'Copie a chave service_role em Supabase → Project Settings → API (somente no servidor).',
    );
  }
  admin ??= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
