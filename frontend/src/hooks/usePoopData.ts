import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, isToday, isYesterday } from 'date-fns';
import type { PoopLog } from '@/types';
import useLocalStorage from './useLocalStorage';

const MOCK_LOGS: PoopLog[] = [
  { id: 'log-1', userId: 'default', timestamp: new Date(Date.now() - 1000 * 60 * 30), difficulty: 'easy', note: '早安排便' },
  { id: 'log-2', userId: 'default', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), difficulty: 'normal', note: '' },
  { id: 'log-3', userId: 'default', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), difficulty: 'hard', note: '有点干' },
  { id: 'log-4', userId: 'default', timestamp: subDays(new Date(), 1), difficulty: 'easy', note: '' },
  { id: 'log-5', userId: 'default', timestamp: subDays(new Date(), 1), difficulty: 'normal', note: '' },
  { id: 'log-6', userId: 'default', timestamp: subDays(new Date(), 2), difficulty: 'easy', note: '' },
  { id: 'log-7', userId: 'default', timestamp: subDays(new Date(), 2), difficulty: 'easy', note: '' },
  { id: 'log-8', userId: 'default', timestamp: subDays(new Date(), 3), difficulty: 'normal', note: '' },
];

export function usePoopData() {
  const [logs, setLogs] = useLocalStorage<PoopLog[]>('pooplet-logs', MOCK_LOGS);
  const [reminderEnabled, setReminderEnabled] = useLocalStorage<boolean>('pooplet-reminder', false);

  const addLog = (log: Omit<PoopLog, 'id'>) => {
    const newLog: PoopLog = {
      ...log,
      id: `log-${Date.now()}`,
    };
    setLogs(prev => [...prev, newLog]);
    return newLog;
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const getTodayStats = () => {
    const todayLogs = logs.filter(log => isToday(new Date(log.timestamp)));
    return {
      count: todayLogs.length,
      easy: todayLogs.filter(l => l.difficulty === 'easy').length,
      normal: todayLogs.filter(l => l.difficulty === 'normal').length,
      hard: todayLogs.filter(l => l.difficulty === 'hard' || l.difficulty === 'very_hard').length,
    };
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    
    const weekLogs = logs.filter(log => 
      new Date(log.timestamp) >= start &&
      new Date(log.timestamp) <= end
    );

    const days = eachDayOfInterval({ start, end });
    return days.map(day => ({
      date: day,
      count: weekLogs.filter(l => isSameDay(new Date(l.timestamp), day)).length,
    }));
  };

  const getGroupedLogs = () => {
    const sortedLogs = logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const grouped: Record<string, PoopLog[]> = {};
    
    sortedLogs.forEach(log => {
      const dateKey = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    });

    return Object.entries(grouped).map(([date, logs]) => ({
      date,
      displayDate: isToday(new Date(date)) ? '今天' : isYesterday(new Date(date)) ? '昨天' : format(new Date(date), 'M月d日'),
      logs,
    }));
  };

  const getStreak = () => {
    const sortedLogs = logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (sortedLogs.length === 0) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const dayLogs = sortedLogs.filter(log => 
        isSameDay(new Date(log.timestamp), checkDate)
      );
      
      if (dayLogs.length > 0) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    logs,
    reminderEnabled,
    setReminderEnabled,
    addLog,
    deleteLog,
    getTodayStats,
    getWeeklyStats,
    getGroupedLogs,
    getStreak,
  };
}
