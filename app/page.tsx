/**
 * 首页组件
 *
 * 应用的入口页面，根据用户认证状态进行重定向
 * 已登录用户跳转到仪表板，未登录用户跳转到登录页
 *
 * @path /app/page.tsx
 * @author Auto-generated
 */
"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    } else if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">加载中...</div>
    </div>
  );
}
