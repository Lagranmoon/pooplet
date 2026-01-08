import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, type LogResponse } from '@/lib/api';
import { DIFFICULTY_CONFIG } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export function CalendarPage() {
  const { confirm, showSuccess, showError } = useToast();
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const dayLogs: Record<string, LogResponse[]> = {};
    logs.forEach(log => {
      const key = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dayLogs[key]) dayLogs[key] = [];
      dayLogs[key].push(log);
    });

    return { days, dayLogs, start, end };
  }, [logs, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayCount = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return monthData.dayLogs[key]?.length || 0;
  };

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = monthData.dayLogs[todayKey] || [];

  const handleDelete = async (id: string) => {
    const confirmed = await confirm('确定要删除这条记录吗？', '确认删除');
    if (confirmed) {
      try {
        await api.deleteLog(id);
        setLogs(logs.filter(l => l.id !== id));
        showSuccess('记录删除成功');
      } catch (err) {
        console.error('Failed to delete log:', err);
        showError(err instanceof Error ? err.message : '删除失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4 animate-bounce-subtle">📅</div>
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-1">日历视图</h2>
        <p className="text-gray-500">查看每日的排便记录</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(currentMonth, 'yyyy年M月')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft size={18} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    今天
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: monthData.start.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {monthData.days.map((day) => {
                  const count = getDayCount(day);
                  const isCurrentDay = isToday(day);
                  const primaryColor = 'hsl(142 76% 36%)';
                  const primaryLight = 'hsl(142 76% 36% / 0.1)';
                  const primaryShadow = 'hsl(142 76% 36% / 0.3)';

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                        isCurrentDay
                          ? 'text-white shadow-lg'
                          : count > 0
                            ? 'hover:opacity-80'
                            : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: isCurrentDay ? primaryColor : (count > 0 ? primaryLight : undefined),
                        boxShadow: isCurrentDay ? `0 4px 12px ${primaryShadow}` : undefined,
                      }}
                    >
                      <span className={`text-sm font-medium ${isCurrentDay ? 'text-white' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </span>
                      {count > 0 && (
                        <span className={`text-[10px] ${isCurrentDay ? 'text-white/80' : 'text-gray-400'}`}>
                          {count}次
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10" />
                  <span className="text-xs text-gray-500">有记录</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-50" />
                  <span className="text-xs text-gray-500">无记录</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary text-white" />
                  <span className="text-xs text-gray-500">今天</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                今日记录
                <Badge variant="secondary">{format(new Date(), 'M月d日')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-400">今天还没有记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                        DIFFICULTY_CONFIG[log.difficulty as keyof typeof DIFFICULTY_CONFIG]?.bg || 'bg-gray-100'
                      }`}>
                        {DIFFICULTY_CONFIG[log.difficulty as keyof typeof DIFFICULTY_CONFIG]?.emoji || '💩'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className="text-xs">
                            {DIFFICULTY_CONFIG[log.difficulty as keyof typeof DIFFICULTY_CONFIG]?.label || log.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {format(new Date(log.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-sm text-gray-600 truncate">{log.note}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-800 mb-3">今日统计</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-primary">{todayLogs.length}</p>
                    <p className="text-xs text-gray-400">记录次数</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-700">
                      {todayLogs.length > 0 ? Math.round(todayLogs.length * 100 / 7) : 0}%
                    </p>
                    <p className="text-xs text-gray-400">周完成度</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">本年记录概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 12 }).map((_, monthIndex) => {
              const monthLogs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.getMonth() === monthIndex && logDate.getFullYear() === new Date().getFullYear();
              });
              const hasRecord = monthLogs.length > 0;
              
              return (
                <div key={monthIndex} className="text-center">
                  <div 
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      hasRecord 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-50 text-gray-300'
                    }`}
                  >
                    {monthLogs.length}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{monthIndex + 1}月</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
