import { useState, useEffect } from "react";

/**
 * Independent theme hook per panel.
 * Each panel stores its preference in a separate localStorage key.
 * When the panel mounts, it applies its theme; on unmount it cleans up.
 */
export function usePanelTheme(storageKey: string) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(storageKey, isDark ? "dark" : "light");
    } catch {}
  }, [isDark, storageKey]);

  // Apply on mount (in case switching between panels)
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem(storageKey);
    if (saved === "dark") {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, [storageKey]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
