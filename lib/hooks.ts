import useSWR from 'swr';
import { PoopRecord } from './db';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useRecords(month: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/records?month=${month}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    records: (data?.records as PoopRecord[]) || [],
    error,
    isLoading,
    mutate,
  };
}

interface StatsData {
  period: string;
  summary: {
    totalCount: number;
    uniqueDays: number;
    avgType: number | null;
    idealPercentage: number;
    currentStreak: number;
  };
  comparison: {
    totalCountChange: number;
  };
  typeDistribution: { type: number; count: number }[];
  dailyCounts: { date: string; count: number }[];
}

export function useStats(period: string = 'month') {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/stats?period=${period}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    stats: data as StatsData | undefined,
    error,
    isLoading,
    mutate,
  };
}

export function useAuthUser() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/auth/me',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    user: data?.user,
    error,
    isLoading,
    mutate,
  };
}
