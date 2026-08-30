"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "sustally-theme";

const LOCKED_LIGHT_PATHS = ["/scope/certificate", "/dashboard"];

export function isThemeLockedPath(pathname: string) {
  return LOCKED_LIGHT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  themeLocked: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  themeLocked: false,
});

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const themeLocked = isThemeLockedPath(pathname);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next: Theme = stored === "dark" ? "dark" : "light";
    setTheme(next);
  }, []);

  useEffect(() => {
    applyTheme(themeLocked ? "light" : theme);
  }, [theme, themeLocked]);

  const toggleTheme = useCallback(() => {
    if (themeLocked) return;
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, [themeLocked]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeLocked }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export async function captureInLightTheme<T>(fn: () => Promise<T>): Promise<T> {
  const root = document.documentElement;
  const wasDark = root.classList.contains("dark");
  if (wasDark) root.classList.remove("dark");
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  try {
    return await fn();
  } finally {
    if (wasDark) root.classList.add("dark");
  }
}
