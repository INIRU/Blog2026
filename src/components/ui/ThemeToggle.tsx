"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 9999,
        border: "none",
        background: "transparent",
        color: isDark ? "rgba(148,163,184,0.8)" : "rgba(100,116,139,0.8)",
        cursor: "pointer",
        transition: "color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = isDark ? "#e2e8f0" : "#0f172a";
        e.currentTarget.style.background = isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = isDark
          ? "rgba(148,163,184,0.8)"
          : "rgba(100,116,139,0.8)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
