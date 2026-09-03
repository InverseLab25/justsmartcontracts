import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TTheme = "light" | "dark";

type State = {
  theme: TTheme;
};

type Actions = {
  update: (_theme: TTheme) => void;
  toggle: () => void;
};

// Only read on first paint, before the persisted choice (if any) is rehydrated.
const systemTheme = (): TTheme =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const useThemeStore = create<State & Actions>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      update: (theme: TTheme) => set(() => ({ theme })),
      toggle: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    { name: "theme" }
  )
);

export const useTheme = () => useThemeStore((state) => state);

// The scss reads off data-theme, and color-scheme keeps the browser from
// painting light scrollbars and form controls over a dark page.
export const useApplyTheme = (theme: TTheme) => {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
};
