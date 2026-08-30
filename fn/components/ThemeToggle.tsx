"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, themeLocked } = useTheme();
  const isDark = theme === "dark";

  if (themeLocked) return null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="inline-flex h-9 w-[3.75rem] items-center rounded-full border border-gray-200 bg-gray-100 p-0.5 transition-colors dark:border-[#303030] dark:bg-[#1e1e1e]"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ease-out ${
          isDark ? "translate-x-6 bg-[#8e4dff] text-white" : "translate-x-0 bg-white text-[#8e4dff]"
        }`}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2 4.8 4.8M19.2 19.2l-1.4-1.4M17.8 6.2l1.4-1.4M6.2 17.8l-1.4 1.4" />
          </svg>
        )}
      </span>
    </button>
  );
}
