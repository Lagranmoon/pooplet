# (auth) 路由组

认证相关页面的路由组，包含登录和注册页面。

## 目录说明

`(auth)` 是 Next.js 路由组，括号表示该目录名不会出现在 URL 路径中。例如：
- `app/(auth)/login/page.tsx` → `/login`
- `app/(auth)/register/page.tsx` → `/register`

## 文件列表

| 文件 | 功能 | 类型 |
|------|------|------|
| `layout.tsx` | 认证页面的公共布局（背景样式） | 服务端组件 |
| `login/page.tsx` | 登录页面 | 客户端组件 |
| `register/page.tsx` | 注册页面 | 客户端组件 |

## 公共布局

`layout.tsx` 为认证页面提供统一的视觉样式：

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <main>{children}</main>
    </div>
  );
}
```

特点：
- 渐变背景样式
- 仅包裹认证相关页面
- 导出元数据：`{ title: "登录 - Pooplet" }`

## 登录页面

### 文件位置
`app/(auth)/login/page.tsx`

### 核心功能

1. **表单状态管理**
```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

2. **登录处理**
```typescript
await signIn.email(
  { email, password },
  {
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (ctx) => {
      setError(ctx.error.message || "登录失败");
      setLoading(false);
    },
  }
);
```

3. **UI 特点**
- 渐变背景：`bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30`
- 毛玻璃效果：`backdrop-blur-xl`
- 响应式设计：移动优先
- 错误提示：红色警示框

## 注册页面

### 文件位置
`app/(auth)/register/page.tsx`

### 核心功能

1. **注册状态检查**
```typescript
useEffect(() => {
  fetch('/api/auth/check-registration-status')
    .then(res => res.json())
    .then(data => {
      setIsDisabled(data.disabled || false);
    });
}, []);
```

2. **注册处理**
```typescript
await signUp.email(
  { email, password, name },
  {
    onSuccess: () => {
      router.push("/login?registered=true");
    },
    onError: (ctx) => {
      setError(ctx.error.message || "注册失败，请重试");
      setLoading(false);
    },
  }
);
```

3. **注册禁用功能**
- 当 `DISABLE_REGISTRATION=true` 时，注册功能被禁用
- 显示"注册已禁用"提示
- 隐藏注册表单，只显示"前往登录"按钮

### UI 特点
- 与登录页面一致的设计风格
- 动态显示/隐藏注册表单
- 可选昵称字段

## 认证流程

### 登录流程
```
1. 用户输入邮箱和密码
2. 点击"登录"按钮
3. 调用 signIn.email()
4. 成功 → 跳转到 /dashboard
5. 失败 → 显示错误信息
```

### 注册流程
```
1. 页面加载时检查注册状态
2. 用户填写邮箱、密码、昵称
3. 调用 signUp.email()
4. 成功 → 跳转到 /login?registered=true
5. 失败 → 显示错误信息
```

## 技术点说明

### 1. 路由组 (Route Groups)
- 用途：组织相关页面，不影响 URL 路径
- 命名规范：使用括号 `(name)` 标记路由组
- 优势：共享布局、代码组织清晰

### 2. 客户端组件
```typescript
"use client";  // 标记为客户端组件
```

需要使用客户端组件的原因：
- 交互式表单（状态管理）
- 事件处理（`onSubmit`, `onClick`）
- 浏览器 API（`window.location`）

### 3. 认证客户端
```typescript
import { signIn, signUp } from "../../../lib/auth-client";
```

`better-auth` 提供的客户端方法：
- `signIn.email()` - 邮箱登录
- `signUp.email()` - 邮箱注册
- 支持成功/失败回调

### 4. 表单验证
- HTML5 表单验证（`required` 属性）
- 客户端错误提示
- 服务端验证通过 better-auth 自动处理

## 样式规范

### 颜色方案
- 主色调：`emerald-500` → `teal-600`（绿色渐变）
- 错误色：`red-50` 背景，`red-700` 文字
- 警告色：`amber-50` 背景，`amber-700` 文字

### 间距
- 内边距：`p-8` (2rem)
- 间距：`space-y-5` (1.25rem 垂直间距)

### 圆角
- 容器：`rounded-2xl` (1rem)
- 按钮：`rounded-xl` (0.75rem)

## 错误处理

### 网络错误
```typescript
catch (err: any) {
  console.error("Network error:", err);
  setError("网络错误，请重试");
  setLoading(false);
}
```

### 验证错误
```typescript
onError: (ctx) => {
  setError(ctx.error.message || "登录失败");
  setLoading(false);
}
```

## 安全措施

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **密码哈希**: better-auth 自动处理密码加密
3. **CSRF 保护**: better-auth 内置 CSRF 保护
4. **输入清理**: 客户端验证 + 服务端验证

## 未来扩展

- 添加第三方登录（Google、GitHub）
- 添加"忘记密码"功能
- 添加邮箱验证功能
- 添加 OAuth 社交登录
