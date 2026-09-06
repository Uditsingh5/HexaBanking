import { create } from "zustand";
import { authApi } from "@/api/auth.api";
import { accountApi } from "@/api/account.api";
import { ApiError, getErrorMessage } from "@/lib/errors";
import {
  clearSessionUser,
  writeSessionUser,
} from "@/lib/session";
import { useAccountStore } from "@/stores/account.store";
import type { User } from "@/types";


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

let initializePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  async initializeAuth() {
    if (get().isInitialized) return;
    if (initializePromise) {
      await initializePromise;
      return;
    }

    initializePromise = (async () => {
      try {
        // Fetch fresh user (with role) + accounts in parallel
        const [meRes, accountsRes] = await Promise.all([
          authApi.me(),
          accountApi.list(),
        ]);

        const freshUser = meRes.data.user;
        // Persist fresh user (including role) to session storage
        writeSessionUser(freshUser);

        useAccountStore.setState({
          accounts: accountsRes.data.accounts,
          isLoading: false,
          hasLoaded: true,
          error: null,
        });
        set({
          user: freshUser,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        clearSessionUser();
        const status = error instanceof ApiError ? error.status : 0;
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: status === 401 ? null : getErrorMessage(error, "Unable to restore session."),
        });
      }
    })();

    await initializePromise;
  },


  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      if (data.token) {
        try {
          localStorage.setItem("hexa_auth_token", data.token);
        } catch {}
      }
      writeSessionUser(data.user);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, "Sign in failed. Please try again."),
      });
      throw error;
    }
  },

  async register(name, email, password) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register({ name, email, password });
      if (data.token) {
        try {
          localStorage.setItem("hexa_auth_token", data.token);
        } catch {}
      }
      writeSessionUser(data.user);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, "Registration failed. Please try again."),
      });
      throw error;
    }
  },

  async logout() {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } catch {
      // Session is cleared locally even if the server call fails.
    } finally {
      try {
        localStorage.removeItem("hexa_auth_token");
        sessionStorage.removeItem("hexa_auth_token");
      } catch {}
      clearSessionUser();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearAuth() {
    try {
      localStorage.removeItem("hexa_auth_token");
      sessionStorage.removeItem("hexa_auth_token");
    } catch {}
    clearSessionUser();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));
