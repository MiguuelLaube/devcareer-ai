import { createApp } from './app.ts';
import { env, integrationStatus } from './env.ts';

const app = createApp();
app.listen(env.PORT, () => {
  const s = integrationStatus();
  console.log(`[api] listening on http://localhost:${env.PORT}`);
  if (!s.supabase) console.warn('[api] SUPABASE_URL/SUPABASE_ANON_KEY ausentes — rotas autenticadas retornarão 503.');
  if (!s.ai) console.warn('[api] GEMINI_API_KEY ausente — funções de IA retornarão 503 com instruções.');
});
