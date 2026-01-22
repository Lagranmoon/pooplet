import { useState, useEffect, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  clearError: () => void;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // 清除错误信息
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 注册新用户
  const signUp = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      return { error };
    }

    // 注册成功后，用户状态会通过 onAuthStateChange 更新
    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  }, []);

  // 用户登录
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      return { error };
    }

    // 登录成功后，用户状态会通过 onAuthStateChange 更新
    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  }, []);

  // 用户登出
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      return { error };
    }

    // 登出成功后，用户状态会通过 onAuthStateChange 更新
    return { error: null };
  }, []);

  // 监听认证状态变化
  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    };

    getSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          // 清除错误信息（除非是错误事件）
          error: event === 'SIGNED_OUT' ? null : prev.error,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    clearError,
  };
};