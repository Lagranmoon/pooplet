import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度需在 3-20 个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少 6 个字符' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = userOperations.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = userOperations.createUser(username, passwordHash);

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
