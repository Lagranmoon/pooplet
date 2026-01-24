/**
 * 邮箱登录端点
 *
 * 处理用户邮箱密码登录请求
 * 包含速率限制和输入验证
 *
 * @path /app/api/auth/sign-in/email/route.ts
 * @author Auto-generated
 */
import { auth } from "@/lib/auth";
import { rateLimiter, getClientIP } from "@/lib/rate-limiter";
import { NextRequest } from "next/server";
import { z } from "zod";

const signinSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  await rateLimiter.consumeStrict(ip);

  try {
    const body = await request.json();
    const { email, password } = signinSchema.parse(body);

    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      asResponse: true,
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "输入数据格式不正确" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error("Login error:", error);
    }
    
    return new Response(JSON.stringify({ error: error.message || "登录失败" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
