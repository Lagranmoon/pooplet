import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, name } = body;
  
  try {
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
    return new Response(JSON.stringify({ error: error.message || "Signup failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
