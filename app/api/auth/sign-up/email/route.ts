import { auth } from "@/lib/auth";
import { rateLimiter, getClientIP } from "@/lib/rate-limiter";
import { NextRequest } from "next/server";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).trim(),
});

export async function POST(request: NextRequest) {
  if (process.env.DISABLE_REGISTRATION === "true") {
    return new Response(JSON.stringify({ 
      error: "注册功能已禁用，请联系管理员" 
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = getClientIP(request.headers);
  await rateLimiter.consumeStrict(ip);

  try {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);
    
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
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
      console.error("Signup error:", error);
    }
    
    return new Response(JSON.stringify({ error: error.message || "注册失败" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
