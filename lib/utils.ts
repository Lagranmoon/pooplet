import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getBristolTypeInfo(type: number) {
  const types: Record<number, { label: string; desc: string; color: string }> = {
    1: { label: '坚果状', desc: '严重便秘', color: 'bg-red-100 text-red-700 border-red-200' },
    2: { label: '硬块状', desc: '轻度便秘', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    3: { label: '有裂纹', desc: '正常', color: 'bg-green-100 text-green-700 border-green-200' },
    4: { label: '香蕉状', desc: '理想', color: 'bg-green-100 text-green-700 border-green-200' },
    5: { label: '软块状', desc: '理想', color: 'bg-green-100 text-green-700 border-green-200' },
    6: { label: '边缘毛糙', desc: '轻度腹泻', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    7: { label: '水样', desc: '腹泻', color: 'bg-red-100 text-red-700 border-red-200' },
  };
  return types[type] || types[4];
}

export function getBristolColorClass(type: number): string {
  if (type >= 3 && type <= 5) return 'bg-green-500';
  if (type === 2 || type === 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getBristolEmoji(type: number): string {
  const emojis = ['', '💩', '💩', '✅', '✅', '✅', '⚠️', '🚨'];
  return emojis[type] || '💩';
}
