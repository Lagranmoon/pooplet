import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { validateRegisterBody, validateUsername } from '@/lib/validation';

// 检查是否禁用注册
// Check if registration is disabled
const isRegistrationDisabled = process.env.DISABLE_REGISTRATION === 'true';

export async function POST(request: NextRequest) {
  try {
    // 如果禁用注册，直接返回错误
    // Return error if registration is disabled
    if (isRegistrationDisabled) {
      return NextResponse.json(
        { error: '注册已禁用' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 统一验证请求体
    const validation = validateRegisterBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { username, password } = body;

    // 再次验证用户名格式（白名单）
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }

    // 使用 trim 后的用户名检查是否存在
    const trimmedUsername = username.trim();
    const existingUser = userOperations.getUserByUsername(trimmedUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 409 }
      );
    }

    // Create user with trimmed username
    const passwordHash = await hashPassword(password);
    const user = userOperations.createUser(trimmedUsername, passwordHash);

    // Create session
    await createSession(user.id, user.username);

    return NextResponse.json(
      { user: { id: user.id, username: user.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
