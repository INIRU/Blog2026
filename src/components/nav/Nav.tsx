"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useTheme } from "@/lib/theme";
import { gsap } from "@/lib/gsap-init";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ExternalLink } from "lucide-react";

const NAV_ITEMS = [
  { label: "Blog", href: "/" },
  { label: "Series", href: "/series" },
];

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const hidden = useScrollDirection();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 opacity-0"
      style={{
        transform: `translateX(-50%) translateY(${hidden ? "-120%" : "0"})`,
        transition: "transform 0.3s ease",
      }}
    >
      <div
        className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-full"
        style={{
          background: isDark ? "rgba(4, 8, 16, 0.7)" : "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(24px) saturate(1.5)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <Link
          href="/"
          className="px-4 py-2 text-[13px] font-bold tracking-wide"
          style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
        >
          INIRU
        </Link>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3.5 py-2 text-[12px] font-medium rounded-full transition-all duration-200"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = isDark ? "#e2e8f0" : "#0f172a";
              (e.currentTarget as HTMLElement).style.background = isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#64748b";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {item.label}
          </Link>
        ))}

        <ThemeToggle />

        <a
          href="https://iniru.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full transition-all duration-200"
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "#60a5fa",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.15)";
          }}
        >
          Portfolio
          <ExternalLink size={11} />
        </a>
      </div>
    </nav>
  );
}
