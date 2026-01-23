"use client";

import { signUp } from "../../../lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp.email(
        { email, password, name },
        {
          onSuccess: () => {
            router.push("/login");
          },
          onError: (ctx) => {
            setError(ctx.error.message || "注册失败，请重试");
          },
        }
      );
    } catch (err: any) {
      setError("注册失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-primary mb-2">欢迎加入！</h1>
          <p className="text-muted-foreground">创建账户开始记录健康</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-8 border-4 border-primary/20">
          {error && (
            <div className="bg-rose-100 dark:bg-rose-900 border-2 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">😢</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 text-center text-primary flex items-center justify-center gap-2">
            <span>✨</span> 创建新账户
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                <span>📧</span> 邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all text-lg disabled:opacity-50"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                <span>📛</span> 昵称（可选）
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all text-lg"
                placeholder="张三"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                <span>🔐</span> 密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all text-lg"
                placeholder="••••••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">🔄</span>
                  创建中...
                </>
              ) : (
                <>
                  <span className="mr-2">🎉</span>
                  立即创建
                </>
              )}
            </button>

            <div className="text-center space-y-4 mt-6">
              <Link href="/login" className="text-primary hover:underline font-medium">
                已经有账户？<span className="ml-2">😊</span> 立即登录
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <span>🏠</span>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
