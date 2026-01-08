import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface AddLogPageProps {
  onComplete: () => void;
}

export function AddLogPage({ onComplete }: AddLogPageProps) {
  const { showError } = useToast();
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'very_hard'>('easy');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.createLog({
        timestamp: date.toISOString(),
        difficulty,
        note,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setNote('');
        setDifficulty('easy');
        setDate(new Date());
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Failed to create log:', err);
      showError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const difficulties = [
    { value: 'easy' as const, label: '顺畅', emoji: '💩' },
    { value: 'normal' as const, label: '正常', emoji: '😐' },
    { value: 'hard' as const, label: '困难', emoji: '😣' },
    { value: 'very_hard' as const, label: '艰辛', emoji: '😫' },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-1">记录排便</h2>
        <p className="text-gray-500">记录今天的排便情况</p>
      </motion.div>

      {showSuccess ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="text-7xl mb-4 animate-bounce-subtle">💩</div>
          <p className="text-2xl font-bold text-primary">记录成功！</p>
        </motion.div>
      ) : (
        <>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  时间
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(date, 'yyyy年M月d日', { locale: zhCN })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={format(date, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(date);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setDate(newDate);
                    }}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-lg">💩</span>
                  排便感受
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        difficulty === d.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{d.emoji}</span>
                      <span className={`text-sm font-medium ${
                        difficulty === d.value ? 'text-primary' : 'text-gray-600'
                      }`}>
                        {d.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  备注（可选）
                </label>
                <Textarea
                  placeholder="记录一下今天的饮食或感受..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              onClick={handleSubmit}
              className="w-full h-14 text-lg"
              size="xl"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存记录'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
