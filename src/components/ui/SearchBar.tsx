"use client";

import { Search } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  const { isDark } = useTheme();

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search icon */}
      <Search
        size={15}
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: isDark ? "rgba(148,163,184,0.5)" : "rgba(100,116,139,0.5)",
          pointerEvents: "none",
        }}
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 16px 10px 40px",
          fontSize: 14,
          fontFamily: "inherit",
          color: isDark ? "#e2e8f0" : "#1e293b",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.025)"
            : "rgba(0,0,0,0.025)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.08)",
          borderRadius: 9999,
          outline: "none",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "border-color 0.2s, background 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = isDark
            ? "rgba(59,130,246,0.3)"
            : "rgba(59,130,246,0.4)";
          e.currentTarget.style.backgroundColor = isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.03)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.08)";
          e.currentTarget.style.backgroundColor = isDark
            ? "rgba(255,255,255,0.025)"
            : "rgba(0,0,0,0.025)";
        }}
      />
    </div>
  );
}
