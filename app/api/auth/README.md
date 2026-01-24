# Auth API

认证相关 API 端点，提供用户会话管理和注册状态检查。

## 目录说明

`app/api/auth/` 目录存放认证相关的 API Routes。

## 目录结构

```
app/api/auth/
├── check-registration-status/
│   └── route.ts      # 检查注册是否禁用
├── delete-session/
│   └── route.ts      # 删除会话
├── get-session/
│   └── route.ts      # 获取当前会话
├── sign-in/
│   └── email/
│       └── route.ts  # 邮箱登录
├── sign-out/
│   └── route.ts      # 退出登录
└── sign-up/
    └── email/
        └── route.ts  # 邮箱注册
```

## API 端点

### 1. GET /api/auth/check-registration-status

**功能：** 检查注册功能是否被禁用

**请求：**
```http
GET /api/auth/check-registration-status
```

**响应：**
```json
{
  "disabled": false,
  "message": "注册功能正常"
}
```

**实现：**
```typescript
export async function GET() {
  const isDisabled = process.env.DISABLE_REGISTRATION === "true";

  return NextResponse.json({
    disabled: isDisabled,
    message: isDisabled ? "注册功能已禁用" : "注册功能正常"
  });
}
```

**环境变量：**
```env
DISABLE_REGISTRATION=true  # 禁用公开注册
```

**使用场景：**
- 前端注册页面加载时检查
- 动态显示/隐藏注册表单
- 内测阶段控制注册入口

---

### 2. GET /api/auth/get-session

**功能：** 获取当前用户会话信息

**请求：**
```http
GET /api/auth/get-session
```

**请求头：**
```http
Authorization: Bearer <token>
Cookie: session=<session_id>
```

**响应：**
```json
{
  "user": {
    "id": "user_123",
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "session": {
    "id": "session_456",
    "expiresAt": "2024-02-14T10:30:00Z"
  }
}
```

**实现：**
```typescript
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
    const errorMessage = process.env.NODE_ENV === 'production'
      ? "获取会话失败"
      : error.message || "获取会话失败";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

**使用场景：**
- 页面加载时检查登录状态
- 获取用户信息
- 验证会话有效性

---

### 3. POST /api/auth/sign-out

**功能：** 退出登录，删除当前会话

**请求：**
```http
POST /api/auth/sign-out
```

**请求头：**
```http
Content-Type: application/json
Cookie: session=<session_id>
```

**响应：**
```json
{
  "success": true
}
```

**实现：**
```typescript
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
    const errorMessage = process.env.NODE_ENV === 'production'
      ? "登出失败"
      : error.message || "登出失败";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

**使用场景：**
- 用户点击退出按钮
- 会话过期时强制登出
- 安全退出操作

---

### 4. POST /api/auth/sign-in/email

**功能：** 使用邮箱和密码登录

**请求：**
```http
POST /api/auth/sign-in/email
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "user": {
    "id": "user_123",
    "name": "张三",
    "email": "user@example.com"
  },
  "session": {
    "id": "session_456",
    "token": "jwt_token_here"
  }
}
```

**实现：**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await auth.api.signIn.email({
      body: {
        email,
        password,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "登录失败" },
      { status: 400 }
    );
  }
}
```

**使用场景：**
- 用户登录表单提交
- 自动登录功能
- 第三方集成

---

### 5. POST /api/auth/sign-up/email

**功能：** 使用邮箱注册新账户

**请求：**
```http
POST /api/auth/sign-up/email
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}
```

**响应：**
```json
{
  "user": {
    "id": "user_123",
    "name": "张三",
    "email": "user@example.com"
  },
  "session": {
    "id": "session_456"
  }
}
```

**实现：**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const result = await auth.api.signUp.email({
      body: {
        email,
        password,
        name,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "注册失败" },
      { status: 400 }
    );
  }
}
```

**使用场景：**
- 新用户注册
- 邀请注册
- 批量创建账户

---

### 6. POST /api/auth/delete-session

**功能：** 删除指定会话

**请求：**
```http
POST /api/auth/delete-session
```

**请求体：**
```json
{
  "sessionToken": "session_token_here"
}
```

**响应：**
```json
{
  "success": true
}
```

**使用场景：**
- 强制用户登出
- 管理员删除会话
- 会话管理

## 认证流程

### 登录流程
```
1. 用户输入邮箱和密码
2. POST /api/auth/sign-in/email
3. better-auth 验证凭证
4. 创建会话
5. 返回用户信息和会话
6. 前端保存会话到 Cookie
7. 跳转到仪表板
```

### 注册流程
```
1. 用户填写注册信息
2. 检查 /api/auth/check-registration-status
3. 如果允许注册，POST /api/auth/sign-up/email
4. better-auth 创建用户
5. 创建会话
6. 返回用户信息和会话
7. 跳转到登录或仪表板
```

### 退出流程
```
1. 用户点击退出
2. POST /api/auth/sign-out
3. better-auth 删除会话
4. 清除前端 Cookie
5. 跳转到登录页
```

### 会话验证流程
```
1. 页面加载
2. GET /api/auth/get-session
3. better-auth 验证会话
4. 返回用户信息
5. 前端更新状态
```

## better-auth 集成

### 获取会话
```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: request.headers });
```

### 登录
```typescript
const result = await auth.api.signIn.email({
  body: {
    email,
    password,
  },
});
```

### 注册
```typescript
const result = await auth.api.signUp.email({
  body: {
    email,
    password,
    name,
  },
});
```

### 退出
```typescript
const result = await auth.api.signOut({
  headers,
});
```

## 安全措施

### 1. HTTPS
生产环境必须使用 HTTPS

### 2. 密码安全
- better-auth 自动哈希密码
- 使用 bcrypt 或 argon2

### 3. 会话管理
- 会话过期时间
- 会话刷新机制
- 会话加密

### 4. CSRF 保护
better-auth 内置 CSRF 保护

### 5. 速率限制
（建议添加）
```typescript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});
```

## 错误处理

### 错误响应格式
```json
{
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### 常见错误

| 错误 | HTTP 状态 | 说明 |
|------|-----------|------|
| "未认证" | 401 | 会话无效或过期 |
| "无效凭证" | 400 | 邮箱或密码错误 |
| "用户已存在" | 400 | 邮箱已被注册 |
| "密码太弱" | 400 | 密码不符合要求 |
| "注册已禁用" | 403 | 注册功能被禁用 |

## 环境变量

```env
# 禁用公开注册
DISABLE_REGISTRATION=true

# 会话配置（在 lib/auth.ts 中配置）
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

## 测试

### 单元测试
```typescript
describe('Auth API', () => {
  it('should check registration status', async () => {
    const response = await fetch('/api/auth/check-registration-status');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.disabled).toBeDefined();
  });

  it('should get session', async () => {
    const response = await fetch('/api/auth/get-session', {
      headers: {
        Cookie: 'session=valid_session_id'
      }
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
  });
});
```

## 最佳实践

1. **始终使用 HTTPS**：生产环境必须
2. **密码强度要求**：设置最小长度和复杂度
3. **会话过期**：设置合理的过期时间
4. **速率限制**：防止暴力破解
5. **日志记录**：记录登录/注册/退出操作
6. **错误处理**：提供清晰的错误信息
7. **注册控制**：使用 `DISABLE_REGISTRATION` 控制注册

## 未来扩展

- 添加第三方登录（Google、GitHub）
- 添加邮箱验证
- 添加忘记密码功能
- 添加两步验证（2FA）
- 添加设备管理
- 添加登录历史
- 添加 OAuth 2.0 支持
