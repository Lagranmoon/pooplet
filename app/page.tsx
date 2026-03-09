"use client"

import { useState, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Plus, Trash2, Edit2, Calendar, TrendingUp, Award, Flame, Clock, StickyNote, Circle, CircleDot, CircleDashed, Minus, Waves, Droplets, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PoopCalendar } from "@/components/poop-calendar"
import { RecordForm } from "@/components/record-form"
import { Badge } from "@/components/ui/badge"
import { getBristolTypeInfo } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useRecords, useStats } from "@/lib/hooks"

interface PoopRecord {
  id: number
  user_id: number
  date: string
  time: string | null
  type: number
  notes: string | null
  created_at: string
  updated_at: string
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PoopRecord | null>(null)
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), "yyyy-MM"))

  const { records, isLoading: isRecordsLoading, mutate: mutateRecords } = useRecords(currentMonth)
  const { stats, mutate: mutateStats } = useStats('month')

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const handleAddRecord = useCallback(() => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }, [])

  const handleEditRecord = useCallback((record: PoopRecord) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }, [])

  const handleSubmitRecord = useCallback(async (data: { date: string; time?: string; type: number; notes?: string }) => {
    const url = editingRecord ? `/api/records/${editingRecord.id}` : "/api/records"
    const method = editingRecord ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      setIsFormOpen(false)
      setEditingRecord(null)
      // Optimistic update with SWR
      await Promise.all([mutateRecords(), mutateStats()])

      // Update selected date to show the new record
      const date = parseISO(data.date)
      if (!selectedDate || !isSameDay(selectedDate, date)) {
        setSelectedDate(date)
      }
    }
  }, [editingRecord, selectedDate, mutateRecords, mutateStats])

  const handleDeleteRecord = useCallback(async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return

    const response = await fetch(`/api/records/${id}`, { method: "DELETE" })

    if (response.ok) {
      await Promise.all([mutateRecords(), mutateStats()])
    }
  }, [mutateRecords, mutateStats])

  const handleMonthChange = useCallback((month: string) => {
    setCurrentMonth(month)
  }, [])

  const selectedDateRecords = selectedDate
    ? records.filter((r) => r.date === format(selectedDate, "yyyy-MM-dd"))
    : []

  const summary = stats?.summary

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">本月次数</span>
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.totalCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">记录天数</span>
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.uniqueDays || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">理想比例</span>
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.idealPercentage || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">连续记录</span>
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.currentStreak || 0}天</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pb-6">
        {/* Calendar */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>日历视图</CardTitle>
            <Button onClick={handleAddRecord} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              记录
            </Button>
          </CardHeader>
          <CardContent>
            <PoopCalendar
              records={records}
              onDateClick={handleDateClick}
              onMonthChange={handleMonthChange}
            />
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "M月d日", { locale: zhCN })
                : "选择日期"}
            </CardTitle>
            <CardDescription>
              {selectedDateRecords.length > 0
                ? `${selectedDateRecords.length} 条记录`
                : "没有记录"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">这一天还没有记录</p>
                {selectedDate && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingRecord(null)
                      setIsFormOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加记录
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateRecords.map((record) => {
                  const typeInfo = getBristolTypeInfo(record.type)
                  const TypeIcon = getBristolIcon(record.type)
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        "group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                        "flex items-center gap-4",
                        typeInfo.color.replace('border-', 'border-opacity-50 '),
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      {/* Type Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                        typeInfo.color.split(" ")[0],
                        "shadow-sm"
                      )}>
                        <TypeIcon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-base">
                            {typeInfo.label}
                          </span>
                          <Badge variant="secondary" className="text-xs font-medium">
                            类型 {record.type}
                          </Badge>
                        </div>
                        {record.time && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{record.time}</span>
                          </div>
                        )}
                        {record.notes && (
                          <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
                            <StickyNote className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{record.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg border-border/60 hover:border-primary hover:text-primary transition-colors"
                          onClick={() => handleEditRecord(record)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg border-border/60 hover:border-destructive hover:text-destructive transition-colors"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setEditingRecord(null)}>
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "编辑记录" : "添加记录"}
            </DialogTitle>
            <DialogDescription>
              记录今天的排便情况
            </DialogDescription>
          </DialogHeader>
          <RecordForm
            initialData={
              editingRecord
                ? {
                    id: editingRecord.id,
                    date: editingRecord.date,
                    time: editingRecord.time || undefined,
                    type: editingRecord.type,
                    notes: editingRecord.notes || undefined,
                  }
                : selectedDate
                ? {
                    date: format(selectedDate, "yyyy-MM-dd"),
                    type: 4,
                  }
                : undefined
            }
            onSubmit={handleSubmitRecord}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingRecord(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// 布里斯托类型图标映射
function getBristolIcon(type: number) {
  switch (type) {
    case 1: return Circle
    case 2: return CircleDot
    case 3: return CircleDashed
    case 4: return Minus
    case 5: return Waves
    case 6: return Droplets
    case 7: return AlertCircle
    default: return Circle
  }
}
