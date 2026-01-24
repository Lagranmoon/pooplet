/**
 * 健康检查端点
 *
 * 提供 API 服务健康状态检查接口
 * 返回服务状态和当前时间戳
 *
 * @path /app/api/health/route.ts
 * @author Auto-generated
 */
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}