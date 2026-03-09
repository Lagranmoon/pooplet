'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, ShieldCheck, Ban } from 'lucide-react';
import {
  validateUsername,
  validatePassword,
  validatePasswordMatch,
  VALIDATION_RULES,
} from '@/lib/validation';
import { useConfig } from '@/lib/hooks';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 获取系统配置 / Get system config
  const { isRegistrationDisabled, isLoading: isConfigLoading } = useConfig();

  // 检查表单是否有效（用于禁用提交按钮）
  const isFormValid =
    username.trim().length >= VALIDATION_RULES.USERNAME.MIN_LENGTH &&
    username.trim().length <= VALIDATION_RULES.USERNAME.MAX_LENGTH &&
    VALIDATION_RULES.USERNAME.PATTERN.test(username.trim()) &&
    password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
    confirmPassword.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;

  // 实时验证用户名
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // 实时验证（仅在输入后）
    if (value) {
      const result = validateUsername(value);
      setUsernameError(result.valid ? '' : result.error || '');
    } else {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUsernameError('');

    // 客户端验证 - 检查空值
    if (!username.trim()) {
      setUsernameError('用户名不能为空');
      return;
    }

    if (!password) {
      setError('密码不能为空');
      return;
    }

    if (!confirmPassword) {
      setError('请确认密码');
      return;
    }

    // 客户端验证
    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) {
      setUsernameError(usernameResult.error || '');
      return;
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      setError(passwordResult.error || '');
      return;
    }

    const matchResult = validatePasswordMatch(password, confirmPassword);
    if (!matchResult.valid) {
      setError(matchResult.error || '');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败');
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

  // 如果注册被禁用，显示提示信息
  // Show disabled message if registration is disabled
  if (!isConfigLoading && isRegistrationDisabled) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 text-gray-500">
                <Ban className="h-7 w-7" />
              </div>
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold">注册已禁用</CardTitle>
              <CardDescription className="text-sm">
                系统当前不接受新用户注册
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                如果您已有账号，请直接登录
              </p>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full"
              >
                前往登录
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-border/50">
        <CardHeader className="text-center space-y-4">
          {/* Brand Icon */}
          <div className="mx-auto">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg">
              <UserPlus className="h-7 w-7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
            <CardDescription className="text-sm">
              注册新账号，开始记录你的便便 💩
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
                onChange={handleUsernameChange}
                required
                autoFocus
                minLength={VALIDATION_RULES.USERNAME.MIN_LENGTH}
                maxLength={VALIDATION_RULES.USERNAME.MAX_LENGTH}
                pattern={VALIDATION_RULES.USERNAME.PATTERN.source}
                title={VALIDATION_RULES.USERNAME.PATTERN_MESSAGE}
                aria-invalid={!!usernameError}
                aria-describedby={usernameError ? 'username-error' : undefined}
                className="h-11"
              />
              {usernameError && (
                <p id="username-error" className="text-sm text-red-500 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {usernameError}
                </p>
              )}
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
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={VALIDATION_RULES.PASSWORD.MIN_LENGTH}
                maxLength={VALIDATION_RULES.PASSWORD.MAX_LENGTH}
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
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              已有账号？{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                立即登录
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
