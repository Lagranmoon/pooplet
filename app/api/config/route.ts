import { NextResponse } from 'next/server';

/**
 * 获取系统公共配置
 * Get public system configuration
 *
 * 此端点返回不需要认证的公共配置信息
 * This endpoint returns public configuration that doesn't require authentication
 */
export async function GET() {
  const config = {
    // 是否禁用注册 / Whether registration is disabled
    registrationDisabled: process.env.DISABLE_REGISTRATION === 'true',
  };

  return NextResponse.json(config);
}
