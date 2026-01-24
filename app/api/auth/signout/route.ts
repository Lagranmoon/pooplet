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
