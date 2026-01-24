/**
 * 客户端认证实例
 *
 * 创建 better-auth 的 React 客户端实例，用于前端组件中的认证操作
 * 自动检测运行环境获取正确的 baseURL
 *
 * @path /lib/auth-client.ts
 * @author Auto-generated
 */
import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
