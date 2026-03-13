"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { KeyRound, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-[20px]"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <KeyRound size={20} color="#60a5fa" />
          </div>
        </div>

        <h1
          className="text-center text-xl font-extrabold mb-2"
          style={{
            backgroundImage: "var(--gradient-heading)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          관리자 로그인
        </h1>
        <p className="text-center text-xs mb-8" style={{ color: "var(--color-text-muted)" }}>
          INIRU 블로그 관리
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-[12px] text-sm font-medium outline-none transition-colors"
            style={{
              background: "var(--color-surface-hover)",
              border: "1px solid var(--color-border-hover)",
              color: "var(--color-text-primary)",
            }}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-[12px] text-sm font-medium outline-none transition-colors"
            style={{
              background: "var(--color-surface-hover)",
              border: "1px solid var(--color-border-hover)",
              color: "var(--color-text-primary)",
            }}
            required
          />

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[12px] text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: loading
                ? "rgba(59,130,246,0.1)"
                : "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "로그인"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
