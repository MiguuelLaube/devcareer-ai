import { supabase } from './supabase';

const API_BASE = '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = localStorage.getItem('devcareer_auth_token');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch {}

  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Erro na requisição: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

