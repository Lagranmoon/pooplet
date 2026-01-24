/**
 * 用户登出端点
 *
 * 处理用户登出请求，清除客户端和服务端会话
 * 重定向到登录页面
 *
 * @path /app/api/auth/signout/route.ts
 * @author Auto-generated
 */
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    
    const result = await auth.api.signOut({
      headers,
    });
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Signout error:", error);
    }
    
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "登出失败" 
      : error.message || "登出失败";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
