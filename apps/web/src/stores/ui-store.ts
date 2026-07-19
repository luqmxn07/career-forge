import { create } from "zustand";

export type AppTheme = "dark" | "cyber-violet" | "emerald-glow" | "pure-light";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
}

const getInitialTheme = (): AppTheme => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("cf_theme") as AppTheme;
  if (saved && ["dark", "cyber-violet", "emerald-glow", "pure-light"].includes(saved)) {
    return saved;
  }
  return "dark";
};

export const applyThemeToDom = (theme: AppTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-cyber-violet", "theme-emerald-glow", "theme-pure-light", "dark");
  if (theme !== "dark") {
    root.classList.add(`theme-${theme}`);
  } else {
    root.classList.add("dark");
  }
};

const initialTheme = getInitialTheme();
applyThemeToDom(initialTheme);

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  commandOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
  theme: initialTheme,
  setTheme: (t) => {
    localStorage.setItem("cf_theme", t);
    applyThemeToDom(t);
    set({ theme: t });
  },
}));
