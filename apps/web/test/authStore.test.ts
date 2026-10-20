import { describe, expect, it, beforeEach } from 'vitest';
import { useAuthStore } from '../src/store/useAuthStore';
import { useIdentityStore } from '../src/store/useIdentityStore';

describe('Web Stores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.profile.full_name).toBeDefined();
  });

  it('updates profile locally', async () => {
    await useAuthStore.getState().updateProfile({ full_name: 'Teste Dev' });
    expect(useAuthStore.getState().profile.full_name).toBe('Teste Dev');
  });

  it('manages identity store independently', () => {
    useIdentityStore.getState().setIdentity({
      fullName: 'Carlos Eduardo',
      email: 'carlos@eduardo.dev',
      location: 'Curitiba, PR',
    });

    const identity = useIdentityStore.getState().identity;
    expect(identity.fullName).toBe('Carlos Eduardo');
    expect(identity.email).toBe('carlos@eduardo.dev');
    expect(identity.location).toBe('Curitiba, PR');
  });
});
