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
