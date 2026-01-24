/**
 * 注册状态检查端点
 *
 * 检查注册功能是否已启用或禁用
 * 返回当前注册状态信息
 *
 * @path /app/api/auth/check-registration-status/route.ts
 * @author Auto-generated
 */
import { NextResponse } from "next/server";

export async function GET() {
  const isDisabled = process.env.DISABLE_REGISTRATION === "true";
  
  return NextResponse.json({
    disabled: isDisabled,
    message: isDisabled ? "注册功能已禁用" : "注册功能正常"
  });
}