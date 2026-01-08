import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, type LogResponse } from '@/lib/api';
import { DIFFICULTY_CONFIG } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export function LogsPage() {
  const { confirm, showSuccess, showError } = useToast();
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="text-5xl mb-4 animate-bounce-subtle">💩</div>
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-7xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无记录</h3>
        <p className="text-gray-400">开始记录你的排便情况吧！</p>
      </div>
    );
  }

  const groupedLogs = useMemo(() => {
    return logs.reduce((acc, log) => {
      const dateKey = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    }, {} as Record<string, LogResponse[]>);
  }, [logs]);

  const sortedGroups = Object.entries(groupedLogs).map(([date, logs]) => ({
    date,
    displayDate: format(new Date(date), 'M月d日'),
    logs,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">历史记录</h2>
        <p className="text-gray-500">查看所有排便记录</p>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {sortedGroups.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm font-medium text-gray-500 px-4">
                  {group.displayDate}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  {group.logs.map((log, logIndex) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: logIndex * 0.03 }}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group ${
                        logIndex !== group.logs.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <span className="text-lg font-semibold text-gray-800">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        DIFFICULTY_CONFIG[log.difficulty as keyof typeof DIFFICULTY_CONFIG]?.bg || 'bg-gray-100'
                      }`}>
                        {DIFFICULTY_CONFIG[log.difficulty as keyof typeof DIFFICULTY_CONFIG]?.emoji || '💩'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {DIFFICULTY_CONFIG[log.difficulty as keyof typeof DIFFICULTY_CONFIG]?.label || log.difficulty}
                          </Badge>
                        </div>
                        {log.note && (
                          <p
                            className="text-sm text-gray-600 truncate"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.note) }}
                          />
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
