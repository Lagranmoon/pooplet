// ===================================
// 1. 核心类型定义
// ===================================

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  accountId: string;
  userId: string;
  providerId: string;
  providerUserId?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===================================
// 2. 业务相关类型定义
// ===================================

export interface BowelRecord {
  id: string;
  userId: string;
  occurredAt: string; // ISO 8601 string
  qualityRating: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 限制为1-7的整数
  notes?: string; // 可选，最大500字符
  createdAt: string;
  updatedAt: string;
}

// 质量选项 - 完整的类型定义
export interface QualityOption {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
  color: string; // Tailwind CSS class
  bg: string; // Tailwind CSS class for background
  text: string; // Tailwind CSS class for text
}

// 质量评分的标签映射
export const QUALITY_OPTIONS = {
  1: { label: "很差", color: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400" },
  2: { label: "较差", color: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400" },
  3: { label: "一般", color: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400" },
  4: { label: "还好", color: "bg-lime-500", bg: "bg-lime-50 dark:bg-lime-900/20", text: "text-lime-700 dark:text-lime-400" },
  5: { label: "良好", color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400" },
  6: { label: "很好", color: "bg-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400" },
  7: { label: "完美", color: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-400" },
} as const;

// 表单数据类型
export interface FormData {
  occurredAt: string; // YYYY-MM-DDTHH:mm 格式
  qualityRating: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  notes: string;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应类型
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  records: T[];
  pagination: PaginationMeta;
}

// 记录统计类型
export interface RecordStats {
  totalRecords: number;
  dailyAverage: number;
  averageQuality: number;
  qualityDistribution: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>;
  recordsThisWeek: number;
  recordsThisMonth: number;
  longestStreak: number;
  currentStreak: number;
}

// ===================================
// 3. 组件相关类型
// ===================================

// 组件 Props 类型
export interface RecordItemProps {
  record: BowelRecord;
}

export interface RecordsListProps {
  title: string;
  records: BowelRecord[];
  loading: boolean;
  emptyMessage: string;
  showCount?: boolean;
  onAddRecord?: () => void;
}

export interface RecordFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => Promise<ApiResponse>;
  submitting: boolean;
  onCancel: () => void;
}

// 错误边界相关类型
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: "page" | "component" | "section";
}

// ===================================
// 4. Hooks 返回类型
// ===================================

// useRecords Hook 返回类型
export interface UseRecordsReturn {
  records: BowelRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: (params?: { page?: number; limit?: number }) => Promise<void>;
  addRecord: (formData: FormData) => Promise<ApiResponse<BowelRecord>>;
  deleteRecord: (id: string) => Promise<ApiResponse>;
  todayRecords: BowelRecord[];
  sortedRecords: BowelRecord[];
  setError: (error: string | null) => void;
}

// useFormData Hook 返回类型
export interface UseFormDataReturn {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isSubmitting: boolean;
  showForm: boolean;
  toggleForm: () => void;
  handleSubmit: (e: React.FormEvent, onSubmit: (data: FormData) => Promise<ApiResponse>) => Promise<ApiResponse>;
  resetForm: () => void;
  setIsSubmitting: (value: boolean) => void;
  setShowForm: (value: boolean) => void;
}

// useAuth Hook 返回类型
export interface UseAuthReturn {
  data: { session: Session | null; isPending: boolean };
  isPending: boolean;
  isAuthenticated: boolean;
}

// useLocalStorage Hook 返回类型
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prevValue: T) => T)) => void;
}

// ===================================
// 5. 状态管理类型
// ===================================

// Dashboard 状态类型
export interface DashboardState {
  records: BowelRecord[];
  loading: boolean;
  submitting: boolean;
  showForm: boolean;
  error: string | null;
  initialized: boolean;
}

// Dashboard Action 类型
export type DashboardAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_RECORDS"; payload: BowelRecord[] }
  | { type: "ADD_RECORD"; payload: BowelRecord }
  | { type: "REMOVE_RECORD"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "TOGGLE_FORM" }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_INITIALIZED"; payload: boolean };

// ===================================
// 6. 工具类型
// ===================================

// 辅助类型
export type NonNullable<T> = T extends null | undefined ? never : T;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// 日期工具类型
export type DateString = string; // ISO 8601 format

export interface DateRange {
  start: DateString;
  end: DateString;
}

// 过滤和排序类型
export interface FilterOptions {
  dateRange?: DateRange;
  qualityRating?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  notes?: string; // 搜索关键词
}

export interface SortOptions {
  field: "occurredAt" | "qualityRating" | "createdAt";
  direction: "asc" | "desc";
}

// ===================================
// 7. 常量类型
// ===================================

// 质量评级常量
export const QUALITY_RATING = {
  VERY_POOR: 1,
  POOR: 2,
  AVERAGE: 3,
  FAIR: 4,
  GOOD: 5,
  VERY_GOOD: 6,
  EXCELLENT: 7,
} as const;

// 分页常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

// 表单验证常量
export const VALIDATION = {
  NOTES_MAX_LENGTH: 500,
  DATE_FORMAT: "yyyy-MM-dd'T'HH:mm",
} as const;

// 导出类型别名以便于使用
export type QualityRating = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ApiError = string;
export type LoadingState = boolean;
export type SubmittingState = boolean;