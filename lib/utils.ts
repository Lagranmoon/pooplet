/**
 * 通用工具函数
 *
 * 提供 Tailwind CSS 类名合并工具，确保类名不会冲突
 * 使用 clsx 和 tailwind-merge 实现智能类名合并
 *
 * @path /lib/utils.ts
 * @author Auto-generated
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
