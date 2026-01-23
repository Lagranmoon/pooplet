"use client";

import { signIn } from "../../../lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      const data = await res.json();
      setError(data.error || "登录失败");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce text-6xl mb-4">💩</div>
          <h1 className="text-4xl font-bold text-primary mb-2">欢迎回来！</h1>
          <p className="text-muted-foreground">开始记录你的健康吧</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-8 border-4 border-primary/20">
          <h2 className="text-2xl font-bold text-center mb-8 text-primary flex items-center justify-center gap-2">
            <span>🔐</span> 登录
          </h2>

          {error && (
            <div className="bg-rose-100 dark:bg-rose-900 border-2 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">😢</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                <span className="mr-2">📧</span> 邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all text-lg"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                <span className="mr-2">🔑</span> 密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all text-lg"
                placeholder="••••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">🔄</span>
                  登录中...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  登录
                </>
              )}
            </button>

            <div className="text-center space-y-4">
              <Link href="/register" className="text-primary hover:underline font-medium">
                还没有账户？
                <span className="ml-2">✨</span> 立即注册
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          💡 小提示：请使用注册时的邮箱和密码
        </p>
      </div>
    </div>
  );
}
