/**
 * 核心类型定义
 *
 * 定义应用中使用的核心数据类型，包括用户、记录、会话等
 * 提供类型安全和 IntelliSense 支持
 *
 * @path /types/index.ts
 * @author Auto-generated
 */
export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

export type Record = {
  id: string;
  userId: string;
  occurredAt: string;
  qualityRating: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
};

export type Account = {
  id: string;
  accountId: string;
  userId: string;
  providerId: string;
  providerUserId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type CreateRecordRequest = {
  occurredAt: string;
  qualityRating: number;
  notes?: string;
};

export type UpdateRecordRequest = Partial<CreateRecordRequest>;
