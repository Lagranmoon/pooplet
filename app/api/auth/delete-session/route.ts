/**
 * 删除会话端点
 *
 * 删除当前用户的认证会话（登出）
 * 清除服务器端的会话数据
 *
 * @path /app/api/auth/delete-session/route.ts
 * @author Auto-generated
 */
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const result = await auth.api.signOut();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Delete session error:", error);
    }
    
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "删除会话失败" 
      : error.message || "删除会话失败";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
