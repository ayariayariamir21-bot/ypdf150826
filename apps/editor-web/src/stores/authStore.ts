import { create } from 'zustand';
import type { Tier } from '@pdfplatform/entitlements';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  tier: Tier;
  createdAt: Date;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  upgrade: (tier: Tier) => void;
}

const DEMO_USER: AuthUser = {
  id: 'user-demo',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  avatarUrl: null,
  tier: 'premium',
  createdAt: new Date('2026-01-15T00:00:00Z'),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, name) =>
    set({
      user: { ...DEMO_USER, email, name: name?.trim() || DEMO_USER.name },
      isAuthenticated: true,
    }),
  logout: () => set({ user: null, isAuthenticated: false }),
  upgrade: (tier) =>
    set((state) =>
      state.user ? { user: { ...state.user, tier } } : {}
    ),
}));
