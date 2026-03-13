"use client";

import { useTheme } from "@/lib/theme";

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  const { isDark } = useTheme();

  const titleGradient = isDark
    ? "linear-gradient(180deg, #f1f5f9 40%, #64748b 100%)"
    : "linear-gradient(180deg, #0f172a 40%, #475569 100%)";

  return (
    <div>
      {/* Accent line */}
      <div
        style={{
          width: 20,
          height: 2,
          backgroundColor: "#3b82f6",
          marginBottom: 12,
        }}
      />

      {/* Label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: "#3b82f6",
          margin: 0,
          marginBottom: 10,
          lineHeight: 1,
        }}
      >
        {label}
      </p>

      {/* Title */}
      <h2
        style={{
          fontSize: "clamp(36px, 4vw, 42px)",
          fontWeight: 800,
          backgroundImage: titleGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: 15,
            color: isDark ? "rgba(148,163,184,0.7)" : "rgba(100,116,139,0.8)",
            margin: 0,
            marginTop: 10,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
