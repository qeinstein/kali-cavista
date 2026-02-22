import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SurveyAnswers {
  mealsPerDay: string;
  activityLevel: string;
  waterGoal: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasCompletedOnboarding: boolean;
  surveyAnswers: SurveyAnswers | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  saveSurvey: (answers: SurveyAnswers) => void;
  clearError: () => void;
}

// ─── Mock helpers ───────────────────────────────────────────────────────────────

const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTcwMDAwMDAwMH0.mock_signature";

const mockDelay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hasCompletedOnboarding: false,
  surveyAnswers: null,
  isLoading: false,
  error: null,

  login: async (email: string, _password: string) => {
    set({ isLoading: true, error: null });
    try {
      await mockDelay();
      // Mock POST /auth/login
      const user: AuthUser = {
        id: "user-123",
        email,
        name: email.split("@")[0],
      };
      set({ token: FAKE_JWT, user, isLoading: false });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : "Login failed",
        isLoading: false,
      });
      throw e;
    }
  },

  register: async (name: string, email: string, _password: string) => {
    set({ isLoading: true, error: null });
    try {
      await mockDelay();
      // Mock POST /auth/register
      const user: AuthUser = {
        id: "user-" + Math.random().toString(36).slice(2, 8),
        email,
        name,
      };
      set({ token: FAKE_JWT, user, isLoading: false });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : "Registration failed",
        isLoading: false,
      });
      throw e;
    }
  },

  logout: () => {
    set({ token: null, user: null });
  },

  completeOnboarding: () => {
    set({ hasCompletedOnboarding: true });
  },

  saveSurvey: (answers: SurveyAnswers) => {
    set({ surveyAnswers: answers });
  },

  clearError: () => set({ error: null }),
}));
