import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Clock, ChevronRight, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, type StatsResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  const weekDayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {user ? `${user.name}，` : ''}早上好！
            </h2>
            <p className="text-gray-500 mt-1">{format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhCN })}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => onNavigate('calendar')}
            className="hidden sm:flex items-center gap-2"
          >
            <Calendar size={18} />
            日历视图
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-green-50 border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                {stats && stats.streak > 0 && (
                  <Badge variant="success" className="gap-1">
                    <Flame size={14} className="text-orange-500" />
                    连续{stats.streak}天
                  </Badge>
                )}
              </div>
              <div className="text-center py-2">
                <p className="text-4xl md:text-5xl font-bold text-primary">
                  {stats?.today_count || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">今日记录</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-semibold text-gray-800">周均</span>
              </div>
              <div className="text-center py-2">
                <p className="text-4xl md:text-5xl font-bold text-gray-700">
                  {stats ? Math.round(stats.week_avg * 10) / 10 : 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">次/天</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-semibold text-gray-800">本周</span>
              </div>
              <div className="text-center py-2">
                <p className="text-4xl md:text-5xl font-bold text-gray-700">
                  {stats?.week_count || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">次总计</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-gray-100/50">
          <TabsTrigger value="today">今日详情</TabsTrigger>
          <TabsTrigger value="week">本周趋势</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-4 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                今日排便分布
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!stats || stats.today_count === 0) ? (
                <div className="text-center py-8 text-gray-400">
                  <p>今天还没有记录</p>
                  <Button
                    onClick={() => onNavigate('add')}
                    className="mt-4"
                    size="lg"
                  >
                    <Plus size={18} className="mr-2" />
                    立即记录
                  </Button>
                </div>
              ) : stats?.difficulty_map && (
                <>
                  {stats.difficulty_map.easy > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">顺畅 💩</span>
                        <span className="font-medium">{stats.difficulty_map.easy}次</span>
                      </div>
                      <Progress value={(stats.difficulty_map.easy / stats.today_count) * 100} />
                    </div>
                  )}
                  
                  {stats.difficulty_map.normal > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">正常 😐</span>
                        <span className="font-medium">{stats.difficulty_map.normal}次</span>
                      </div>
                      <Progress value={(stats.difficulty_map.normal / stats.today_count) * 100} />
                    </div>
                  )}
                  
                  {(stats.difficulty_map.hard + stats.difficulty_map.very_hard) > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">困难 😣/😫</span>
                        <span className="font-medium">{stats.difficulty_map.hard + stats.difficulty_map.very_hard}次</span>
                      </div>
                      <Progress value={((stats.difficulty_map.hard + stats.difficulty_map.very_hard) / stats.today_count) * 100} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {stats && stats.today_count > 0 && (
            <div className="bg-green-50 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors" onClick={() => onNavigate('logs')}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-800 font-medium">排便健康</p>
                  <p className="text-xs text-green-600">继续保持良好的排便习惯！</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-green-400" />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="week" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                本周排便趋势
              </h3>
              <div className="flex items-end justify-between gap-3 px-2">
                {weekDayLabels.map((day, index) => {
                  const date = new Date();
                  const dayOfWeek = (date.getDay() + 6) % 7;
                  const currentDate = new Date(date);
                  currentDate.setDate(date.getDate() - dayOfWeek + index);
                  const dateKey = currentDate.toISOString().split('T')[0];
                  const count = stats?.date_logs?.[dateKey] || 0;
                  const isToday = index === dayOfWeek;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="w-full max-w-[40px] flex flex-col items-center"
                          style={{ transformOrigin: 'bottom' }}
                        >
                          {[0, 1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`w-full h-7 rounded-lg transition-all ${
                                level < count
                                  ? 'bg-primary'
                                  : 'bg-gray-100'
                              } ${level === 0 ? 'rounded-t-lg' : ''} ${level === 3 ? 'rounded-b-lg' : ''}`}
                              style={{ 
                                opacity: level < count ? 1 : 0.3
                              }}
                            />
                          ))}
                        </motion.div>
                        
                        <span className={`text-2xl font-bold ${
                          count > 0 ? 'text-primary' : 'text-gray-300'
                        }`}>
                          {count}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-center">
                        <span className={`text-sm ${isToday ? 'text-primary font-medium' : 'text-gray-400'}`}>
                          周{day}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center gap-4 text-xs text-gray-400 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded" />
                  <span>有记录</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded" />
                  <span>无记录</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded ring-2 ring-yellow-400" />
                  <span>今天</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">本周总计</span>
                  <span className="font-medium text-gray-700">{stats?.week_count || 0}次</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
