import { create } from "zustand";
import { THEME_KEY } from "@/constants";

export type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  createAccountOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setCreateAccountOpen: (open: boolean) => void;
}

function readTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: "light",
  sidebarCollapsed: false,
  createAccountOpen: false,

  toggleTheme() {
    const next = get().theme === "light" ? "dark" : "light";
    applyTheme(next);
    set({ theme: next });
  },

  setTheme(theme) {
    applyTheme(theme);
    set({ theme });
  },

  setCreateAccountOpen(open) {
    set({ createAccountOpen: open });
  },
}));

export function initializeTheme() {
  const theme = readTheme();
  applyTheme(theme);
  useUiStore.setState({ theme });
}
