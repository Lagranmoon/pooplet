import { NextResponse } from "next/server";

export async function GET() {
  const isDisabled = process.env.DISABLE_REGISTRATION === "true";
  
  return NextResponse.json({
    disabled: isDisabled,
    message: isDisabled ? "注册功能已禁用" : "注册功能正常"
  });
}