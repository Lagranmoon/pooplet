'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  validateUsername,
  validatePassword,
  validatePasswordMatch,
  VALIDATION_RULES,
} from '@/lib/validation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>创建新账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
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
              />
              {usernameError && (
                <p id="username-error" className="text-sm text-red-500">
                  {usernameError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={VALIDATION_RULES.PASSWORD.MIN_LENGTH}
                maxLength={VALIDATION_RULES.PASSWORD.MAX_LENGTH}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={VALIDATION_RULES.PASSWORD.MIN_LENGTH}
                maxLength={VALIDATION_RULES.PASSWORD.MAX_LENGTH}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号？{' '}
              <a href="/login" className="text-primary hover:underline">
                立即登录
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
