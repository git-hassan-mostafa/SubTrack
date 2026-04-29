import { create } from 'zustand';
import { apiClient } from '../data/api/api-client';
import type { StoredUser } from '../data/api/api-client';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredUser | null;
  error: string | null;

  /** Check if user has valid stored session */
  checkAuth: () => Promise<void>;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Logout and clear session */
  logout: () => Promise<void>;
  /** Clear error message */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const isAuth = await apiClient.isAuthenticated();
      if (isAuth) {
        const user = await apiClient.getUser();
        set({ isAuthenticated: true, user, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await apiClient.login(email, password);
      set({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  logout: async () => {
    await apiClient.clearToken();
    set({ isAuthenticated: false, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
