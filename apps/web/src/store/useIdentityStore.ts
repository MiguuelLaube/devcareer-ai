import { create } from 'zustand';
import { resumeIdentitySchema, type ResumeIdentity } from '@devcareer/shared';
import { useAuthStore } from './useAuthStore';

const KEY = 'devcareer_resume_identity';

function getInitialIdentity(): ResumeIdentity {
  let saved: any = {};
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw);
  } catch {}

  // Puxa perfil do candidato como fallback inteligente se o campo ainda não foi preenchido
  const profile = useAuthStore.getState().profile;
  const user = useAuthStore.getState().user;

  return resumeIdentitySchema.parse({
    fullName: saved.fullName !== undefined ? saved.fullName : (profile?.full_name || user?.fullName || 'Dev Iniciante'),
    email: saved.email !== undefined ? saved.email : (user?.email || 'dev@devcareer.ai'),
    phone: saved.phone !== undefined ? saved.phone : '(11) 98765-4321',
    location: saved.location !== undefined ? saved.location : (profile?.academic_period ? 'São Paulo, SP - Remoto / Híbrido' : ''),
    photoUrl: saved.photoUrl || '',
    githubUrl: saved.githubUrl !== undefined ? saved.githubUrl : (profile?.github_url || 'https://github.com/deviniciante'),
    linkedinUrl: saved.linkedinUrl !== undefined ? saved.linkedinUrl : (profile?.linkedin_url || 'https://linkedin.com/in/deviniciante'),
  });
}

interface IdentityState {
  identity: ResumeIdentity;
  setIdentity: (patch: Partial<ResumeIdentity>) => void;
  syncFromProfile: () => void;
}

/** Dados pessoais do aluno — fonte única para o cabeçalho do currículo. */
export const useIdentityStore = create<IdentityState>((set) => ({
  identity: getInitialIdentity(),
  setIdentity: (patch) =>
    set((s) => {
      const identity = resumeIdentitySchema.parse({ ...s.identity, ...patch });
      try {
        localStorage.setItem(KEY, JSON.stringify(identity));
      } catch {
        /* foto grande demais para o storage: mantém em memória */
      }
      if (patch.fullName) {
        useAuthStore.getState().updateProfile({ full_name: patch.fullName });
      }
      if (patch.githubUrl) {
        useAuthStore.getState().updateProfile({ github_url: patch.githubUrl });
      }
      if (patch.linkedinUrl) {
        useAuthStore.getState().updateProfile({ linkedin_url: patch.linkedinUrl });
      }
      return { identity };
    }),
  syncFromProfile: () => {
    const profile = useAuthStore.getState().profile;
    const user = useAuthStore.getState().user;
    set((s) => {
      const updated = resumeIdentitySchema.parse({
        ...s.identity,
        fullName: profile?.full_name || user?.fullName || s.identity.fullName,
        email: user?.email || s.identity.email,
        githubUrl: profile?.github_url || s.identity.githubUrl,
        linkedinUrl: profile?.linkedin_url || s.identity.linkedinUrl,
      });
      try {
        localStorage.setItem(KEY, JSON.stringify(updated));
      } catch {}
      return { identity: updated };
    });
  },
}));
