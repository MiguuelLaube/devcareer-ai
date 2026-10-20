import { create } from 'zustand';
import type { Profile } from '@devcareer/shared';

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
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, fullName: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<Profile>) => void;
  completeOnboarding: () => void;
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

// Carrega dados salvos no navegador se existirem
const savedUser = localStorage.getItem('devcareer_user');
const savedProfile = localStorage.getItem('devcareer_profile');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : { id: 'usr-1', email: 'dev@devcareer.ai', fullName: 'Dev Iniciante' },
  profile: savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE,
  isAuthenticated: !!savedUser || true, // Pronto para teste imediato de todas as funcionalidades
  isLoading: false,

  login: async (email: string) => {
    const user = { id: `usr-${Date.now()}`, email, fullName: email.split('@')[0] };
    localStorage.setItem('devcareer_user', JSON.stringify(user));
    localStorage.setItem('devcareer_auth_token', 'local-jwt-token');
    set({ user, isAuthenticated: true });
    return true;
  },

  signup: async (email: string, fullName: string) => {
    const user = { id: `usr-${Date.now()}`, email, fullName };
    localStorage.setItem('devcareer_user', JSON.stringify(user));
    localStorage.setItem('devcareer_auth_token', 'local-jwt-token');
    set((state) => ({
      user,
      isAuthenticated: true,
      profile: { ...state.profile, full_name: fullName },
    }));
    return true;
  },

  logout: () => {
    localStorage.removeItem('devcareer_user');
    localStorage.removeItem('devcareer_auth_token');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updated) => {
    set((state) => {
      const newProfile = { ...state.profile, ...updated };
      localStorage.setItem('devcareer_profile', JSON.stringify(newProfile));
      return { profile: newProfile };
    });
  },

  completeOnboarding: () => {
    set((state) => {
      const newProfile = { ...state.profile };
      localStorage.setItem('devcareer_profile', JSON.stringify(newProfile));
      return { profile: newProfile };
    });
  },
}));
