/**
 * 用户登录页面
 *
 * 用户登录界面，支持邮箱密码登录
 * 包含表单验证、错误提示和成功重定向
 * 
 * @path /app/(auth)/login/page.tsx
 * @author Auto-generated
 */

"use client";

import { signIn } from "../../../lib/auth-client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("Submitting login form with:", { email });

    try {
      await signIn.email(
        { email, password },
        {
          onSuccess: () => {
            console.log("Login successful");
            window.location.href = "/dashboard";
          },
          onError: (ctx) => {
            console.error("Login failed:", ctx);
            setError(ctx.error.message || "登录失败");
            setLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error("Network error:", err);
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">欢迎回来</h1>
            <p className="text-slate-600">登录您的账户继续记录健康数据</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 placeholder-slate-400"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 placeholder-slate-400"
                placeholder="•••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
            >
              {loading ? "登录中..." : "登录"}
            </button>

            <div className="text-center pt-4">
              <Link href="/register" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                还没有账户？立即注册
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
