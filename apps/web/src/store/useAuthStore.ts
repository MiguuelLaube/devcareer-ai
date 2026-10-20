import { create } from 'zustand';
import type { Profile } from '@devcareer/shared';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  profile: Profile;
  isAuthenticated: boolean;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, fullName: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<Profile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const DEFAULT_PROFILE: Profile = {
  full_name: 'Dev Iniciante',
  education: 'Ciência da Computação / Análise e Desenvolvimento de Sistemas',
  institution: 'Faculdade de Tecnologia',
  academic_period: '3º Semestre',
  career_goal: 'Conquistar a primeira vaga como Desenvolvedor Júnior em TI',
  technologies: [
    { name: 'JavaScript', level: 'intermediate' },
    { name: 'React', level: 'basic' },
    { name: 'Git', level: 'basic' },
    { name: 'HTML & CSS', level: 'intermediate' },
    { name: 'SQL', level: 'learning' },
    { name: 'Node.js', level: 'none' },
  ],
  experiences: [],
  projects: [
    {
      name: 'Catálogo de Filmes com React',
      kind: 'personal',
      description: 'Aplicação web que consome a API do TMDB, com busca dinâmica e layout responsivo.',
      technologies: ['React', 'JavaScript', 'CSS'],
      url: 'https://github.com/exemplo/catalogo-filmes',
    },
  ],
  courses: [
    {
      name: 'Formação Frontend Completa',
      institution: 'DevEducation',
      year: '2025',
    },
  ],
  certifications: [],
  languages: [
    { name: 'Português', level: 'native' },
    { name: 'Inglês', level: 'basic' },
  ],
  github_url: 'https://github.com/deviniciante',
  linkedin_url: 'https://linkedin.com/in/deviniciante',
  portfolio_url: '',
  study_minutes_per_day: 30,
  study_days: [1, 2, 3, 4, 5],
  target_date: null,
};

function formatSupabaseUser(sbUser: any): User {
  return {
    id: sbUser.id,
    email: sbUser.email || '',
    fullName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Desenvolvedor',
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: DEFAULT_PROFILE,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = formatSupabaseUser(session.user);
        localStorage.setItem('devcareer_auth_token', session.access_token);
        localStorage.setItem('devcareer_user', JSON.stringify(user));

        // Busca perfil do Supabase
        let profile = DEFAULT_PROFILE;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!error && data) {
            profile = { ...DEFAULT_PROFILE, ...data };
          }
        } catch {
          // Fallback para profile salvo
        }

        set({ user, profile, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('devcareer_auth_token');
        localStorage.removeItem('devcareer_user');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      console.warn('[auth] Erro ao inicializar sessão:', err);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }

    // Configura ouvinte em tempo real para mudanças de autenticação
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = formatSupabaseUser(session.user);
        localStorage.setItem('devcareer_auth_token', session.access_token);
        localStorage.setItem('devcareer_user', JSON.stringify(user));

        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (data) {
            set({ profile: { ...DEFAULT_PROFILE, ...data } });
          }
        } catch {}

        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('devcareer_auth_token');
        localStorage.removeItem('devcareer_user');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  login: async (email: string, password?: string) => {
    if (!password) throw new Error('Informe sua senha.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos.');
      }
      throw new Error(error.message);
    }

    if (data.session) {
      const user = formatSupabaseUser(data.user);
      localStorage.setItem('devcareer_auth_token', data.session.access_token);
      localStorage.setItem('devcareer_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  signup: async (email: string, fullName: string, password?: string) => {
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Este e-mail já está cadastrado. Tente entrar.');
      }
      throw new Error(error.message);
    }

    if (data.user) {
      const user = formatSupabaseUser(data.user);
      if (data.session) {
        localStorage.setItem('devcareer_auth_token', data.session.access_token);
      }
      localStorage.setItem('devcareer_user', JSON.stringify(user));

      // Garante que o profile é atualizado com o nome
      try {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, full_name: fullName });
      } catch {}

      set((state) => ({
        user,
        isAuthenticated: !!data.session,
        profile: { ...state.profile, full_name: fullName },
      }));
      return true;
    }
    return false;
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) throw new Error(error.message);
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('devcareer_auth_token');
    localStorage.removeItem('devcareer_user');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (updated: Partial<Profile>) => {
    const user = get().user;
    const newProfile = { ...get().profile, ...updated };
    set({ profile: newProfile });
    localStorage.setItem('devcareer_profile', JSON.stringify(newProfile));

    if (user?.id) {
      try {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, ...updated });
      } catch (err) {
        console.warn('[auth] Erro ao sincronizar perfil remoto:', err);
      }
    }
  },

  completeOnboarding: async () => {
    const user = get().user;
    const newProfile = { ...get().profile, onboarding_completed: true };
    set({ profile: newProfile });
    localStorage.setItem('devcareer_profile', JSON.stringify(newProfile));

    if (user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      } catch (err) {
        console.warn('[auth] Erro ao registrar onboarding remoto:', err);
      }
    }
  },
}));
