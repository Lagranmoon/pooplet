export type Difficulty = 'easy' | 'normal' | 'hard' | 'very_hard';

export interface PoopLog {
  id: string;
  userId: string;
  timestamp: Date;
  difficulty: Difficulty;
  note: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Family {
  id: string;
  name: string;
  members: User[];
}

export const DIFFICULTY_CONFIG = {
  easy: { emoji: '💩', label: '顺畅', color: 'text-green-500', bg: 'bg-green-100' },
  normal: { emoji: '😐', label: '正常', color: 'text-yellow-500', bg: 'bg-yellow-100' },
  hard: { emoji: '😣', label: '困难', color: 'text-orange-500', bg: 'bg-orange-100' },
  very_hard: { emoji: '😫', label: '艰辛', color: 'text-red-500', bg: 'bg-red-100' },
} as const;
