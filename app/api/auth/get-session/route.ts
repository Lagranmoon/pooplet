import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const headers = new Headers(request.headers);
    
    const result = await auth.api.getSession({
      headers,
    });
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Get session error:", error);
    }
    
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "获取会话失败" 
      : error.message || "获取会话失败";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
