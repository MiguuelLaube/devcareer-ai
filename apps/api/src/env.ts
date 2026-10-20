import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().default(8787),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  AI_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(40),
});

// Treat empty strings in .env as "not set"
const raw: Record<string, any> = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === '' ? undefined : v]),
);

if (!raw.SUPABASE_ANON_KEY && raw.SUPABASE_PUBLISHABLE_KEY) {
  raw.SUPABASE_ANON_KEY = raw.SUPABASE_PUBLISHABLE_KEY;
}
if (!raw.SUPABASE_SERVICE_ROLE_KEY && raw.SUPABASE_SECRET_KEY) {
  raw.SUPABASE_SERVICE_ROLE_KEY = raw.SUPABASE_SECRET_KEY;
}

export const env = envSchema.parse(raw);

/** Which integrations are configured. Never exposes values, only presence. */
export function integrationStatus() {
  return {
    supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    supabaseAdmin: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    ai: Boolean(env.GEMINI_API_KEY),
  };
}
