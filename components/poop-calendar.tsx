"use client"

import { useState, useMemo, memo } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  eachDayOfInterval,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, getBristolColorClass } from "@/lib/utils"

interface PoopRecord {
  id: number
  date: string
  time: string | null
  type: number
  notes: string | null
}

interface PoopCalendarProps {
  records: PoopRecord[]
  onDateClick?: (date: Date) => void
  onMonthChange?: (month: string) => void
}

const weekDays = ["一", "二", "三", "四", "五", "六", "日"]

function PoopCalendarComponent({ records, onDateClick, onMonthChange }: PoopCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const recordsByDate = useMemo(() => {
    const map = new Map<string, PoopRecord[]>()
    records.forEach((record) => {
      const existing = map.get(record.date) || []
      existing.push(record)
      map.set(record.date, existing)
    })
    return map
  }, [records])

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(format(newMonth, "yyyy-MM"))
  }

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(format(newMonth, "yyyy-MM"))
  }

  const getDayRecords = (date: Date): PoopRecord[] => {
    const dateStr = format(date, "yyyy-MM-dd")
    return recordsByDate.get(dateStr) || []
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "yyyy年 M月", { locale: zhCN })}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayRecords = getDayRecords(date)
          const hasRecords = dayRecords.length > 0
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isToday = isSameDay(date, new Date())
          const avgType = hasRecords
            ? Math.round(dayRecords.reduce((sum, r) => sum + r.type, 0) / dayRecords.length)
            : 0

          return (
            <button
              key={index}
              onClick={() => onDateClick?.(date)}
              className={cn(
                "relative aspect-square rounded-lg p-1 flex flex-col items-center justify-center transition-colors",
                !isCurrentMonth && "text-muted-foreground/50",
                isCurrentMonth && !hasRecords && "hover:bg-muted",
                hasRecords && "bg-primary/5 hover:bg-primary/10",
                isToday && "ring-2 ring-primary ring-offset-1"
              )}
            >
              <span className={cn("text-sm font-medium", isToday && "text-primary")}>
                {format(date, "d")}
              </span>

              {hasRecords && (
                <div className="flex items-center gap-0.5 mt-1">
                  {dayRecords.slice(0, 3).map((record, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        getBristolColorClass(record.type)
                      )}
                    />
                  ))}
                  {dayRecords.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+</span>
                  )}
                </div>
              )}

              {hasRecords && dayRecords.length > 1 && (
                <span className="absolute top-1 right-1 text-[10px] font-bold text-primary">
                  {dayRecords.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const PoopCalendar = memo(PoopCalendarComponent)
