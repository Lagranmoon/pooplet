"use client"

import { useState, useEffect, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Plus, Trash2, Edit2, Calendar, TrendingUp, Award } from "lucide-react"
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

interface PoopRecord {
  id: number
  date: string
  time: string | null
  type: number
  notes: string | null
  created_at: string
}

interface DaySummary {
  totalCount: number
  uniqueDays: number
  idealPercentage: number
  currentStreak: number
}

export default function HomePage() {
  const [records, setRecords] = useState<PoopRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PoopRecord | null>(null)
  const [summary, setSummary] = useState<DaySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), "yyyy-MM"))

  const fetchRecords = useCallback(async (month: string) => {
    try {
      const response = await fetch(`/api/records?month=${month}`)
      const data = await response.json()
      setRecords(data.records)
    } catch (error) {
      console.error("Error fetching records:", error)
    }
  }, [])

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/stats?period=month")
      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error("Error fetching summary:", error)
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchRecords(currentMonth), fetchSummary()]).finally(() => {
      setIsLoading(false)
    })
  }, [currentMonth, fetchRecords, fetchSummary])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddRecord = () => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }

  const handleEditRecord = (record: PoopRecord) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  const handleSubmitRecord = async (data: { date: string; time?: string; type: number; notes?: string }) => {
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
      await Promise.all([fetchRecords(currentMonth), fetchSummary()])

      // Update selected date to show the new record
      const date = parseISO(data.date)
      if (!selectedDate || !isSameDay(selectedDate, date)) {
        setSelectedDate(date)
      }
    }
  }

  const handleDeleteRecord = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return

    const response = await fetch(`/api/records/${id}`, { method: "DELETE" })

    if (response.ok) {
      await Promise.all([fetchRecords(currentMonth), fetchSummary()])
    }
  }

  const selectedDateRecords = selectedDate
    ? records.filter((r) => r.date === format(selectedDate, "yyyy-MM-dd"))
    : []

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month)
  }

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
              <span className="text-lg">🔥</span>
              <span className="text-sm text-muted-foreground">连续记录</span>
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.currentStreak || 0}天</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
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
              <div className="space-y-3">
                {selectedDateRecords.map((record) => {
                  const typeInfo = getBristolTypeInfo(record.type)
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        "p-3 rounded-lg border flex items-start justify-between",
                        typeInfo.color
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            类型 {record.type}
                          </Badge>
                          {record.time && (
                            <span className="text-xs opacity-75">{record.time}</span>
                          )}
                        </div>
                        {record.notes && (
                          <p className="text-sm mt-1 opacity-80">{record.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditRecord(record)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
