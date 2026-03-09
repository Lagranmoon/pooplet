'use client';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export function Nav() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <nav className="ml-auto flex items-center gap-4">
        <a
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          登录
        </a>
        <a
          href="/register"
          className="text-sm font-medium text-primary hover:underline"
        >
          注册
        </a>
      </nav>
    );
  }

  return (
    <nav className="ml-auto flex items-center gap-4">
      <a
        href="/"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        日历
      </a>
      <a
        href="/stats"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        统计
      </a>
      <div className="flex items-center gap-2 pl-4 border-l">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{user.username}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={logout}
          title="退出"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
