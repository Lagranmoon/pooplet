'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { VALIDATION_RULES } from '@/lib/validation';
import { useConfig } from '@/lib/hooks';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 获取系统配置 / Get system config
  const { isRegistrationDisabled, isLoading: isConfigLoading } = useConfig();

  // 检查表单是否有效（用于禁用提交按钮）
  const isFormValid =
    username.trim().length >= VALIDATION_RULES.USERNAME.MIN_LENGTH &&
    password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 客户端验证 - 检查空值
    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }

    if (!password) {
      setError('密码不能为空');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败');
        return;
      }

      // 使用 window.location 进行完整页面刷新，确保 SWR 数据重新获取
      window.location.href = '/';
    } catch {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-border/50">
        <CardHeader className="text-center space-y-4">
          {/* Brand Icon */}
          <div className="mx-auto">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
            <CardDescription className="text-sm">
              登录账号，继续记录你的便便 💩
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                用户名
              </Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                minLength={VALIDATION_RULES.USERNAME.MIN_LENGTH}
                maxLength={VALIDATION_RULES.USERNAME.MAX_LENGTH}
                autoComplete="username"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={VALIDATION_RULES.PASSWORD.MIN_LENGTH}
                maxLength={VALIDATION_RULES.PASSWORD.MAX_LENGTH}
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
            {!isConfigLoading && !isRegistrationDisabled && (
              <p className="text-center text-sm text-muted-foreground pt-2">
                还没有账号？{' '}
                <a
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  立即注册
                </a>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
