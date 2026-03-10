'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { User, LogOut, LayoutGrid, BarChart3 } from 'lucide-react';

export function Nav() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <nav className="ml-auto flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          注册
        </Link>
      </nav>
    );
  }

  return (
    <nav className="ml-auto flex items-center gap-1 sm:gap-2">
      {/* Desktop nav links */}
      <Link
        href="/"
        className="hidden sm:inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <LayoutGrid className="h-4 w-4" />
        日历
      </Link>
      <Link
        href="/stats"
        className="hidden sm:inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <BarChart3 className="h-4 w-4" />
        统计
      </Link>

      {/* Mobile nav icons */}
      <Link
        href="/"
        className="sm:hidden inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <LayoutGrid className="h-4 w-4" />
      </Link>
      <Link
        href="/stats"
        className="sm:hidden inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <BarChart3 className="h-4 w-4" />
      </Link>

      <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l">
        <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="max-w-[80px] truncate">{user.username}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={logout}
          title="退出"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
