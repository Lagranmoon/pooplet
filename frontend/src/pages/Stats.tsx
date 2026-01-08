import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { api, type StatsResponse } from '@/lib/api';
import { DIFFICULTY_CONFIG } from '@/types';

export function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    return {
      days,
      start,
      end,
    };
  }, [currentMonth]);

  const weeklyStats = useMemo(() => {
    if (!stats) return [];
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => ({
      date: day,
      logs: stats.date_logs?.[format(day, 'yyyy-MM-dd')] || 0,
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4 animate-bounce-subtle">📊</div>
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-1">统计分析</h2>
        <p className="text-gray-500">查看你的排便记录统计</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber/5 to-orange-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-gray-800">连续记录</span>
            </div>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-amber-500">{stats?.streak || 0}</p>
              <p className="text-sm text-gray-500 mt-2">天</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold text-gray-800">本月记录</span>
            </div>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-gray-700">
                {Object.values(stats?.date_logs || {}).filter(Boolean).length}
              </p>
              <p className="text-sm text-gray-500 mt-2">天</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold text-gray-800">总记录数</span>
            </div>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-gray-700">{stats?.total_count || 0}</p>
              <p className="text-sm text-gray-500 mt-2">次</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.difficulty_map && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">难度分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.difficulty_map).map(([key, count]) => {
              const total = Object.values(stats.difficulty_map!).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const config = DIFFICULTY_CONFIG[key as keyof typeof DIFFICULTY_CONFIG];
              
              if (count === 0) return null;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{config?.emoji || '💩'}</span>
                      <span className="text-sm text-gray-600">{config?.label || key}</span>
                    </div>
                    <span className="font-medium text-gray-700">{count}次 ({Math.round(percentage)}%)</span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>本月日历</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                ←
              </Button>
              <span className="text-sm font-normal">{format(currentMonth, 'yyyy年M月')}</span>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                →
              </Button>
            </div>
          </CardTitle>
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
            {Array.from({ length: monthlyData.start.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {monthlyData.days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const hasRecord = (stats?.date_logs?.[dateKey] || 0) > 0;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                    isToday
                      ? 'bg-primary text-white font-bold'
                      : hasRecord
                        ? 'bg-primary/20 text-primary'
                        : 'bg-gray-50 text-gray-300'
                  }`}
                  style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span className="text-xs text-gray-500">有记录</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-50" />
              <span className="text-xs text-gray-500">无记录</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary text-white" />
              <span className="text-xs text-gray-500">今天</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">最近一周</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {weeklyStats.map((day, index) => {
              const isToday = isSameDay(day.date, new Date());
              
              return (
                <div key={index} className="text-center">
                  <p className={`text-xs mb-2 ${isToday ? 'text-primary font-medium' : 'text-gray-400'}`}>
                    {dayNames[index]}
                  </p>
                  <div 
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                      day.logs > 0 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <span className="font-bold">{day.logs}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
