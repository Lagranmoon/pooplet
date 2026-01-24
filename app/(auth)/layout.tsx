/**
 * 认证页面布局组件
 *
 * 登录和注册页面的共享布局
 * 提供统一的背景和样式
 *
 * @path /app/(auth)/layout.tsx
 * @author Auto-generated
 */
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

export const metadata = {
  title: "登录 - Pooplet",
};
