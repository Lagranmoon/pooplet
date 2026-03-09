"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PoopTypeSelector } from "./poop-type-selector"
import { Loader2 } from "lucide-react"

interface RecordFormProps {
  initialData?: {
    id?: number
    date: string
    time?: string
    type: number
    notes?: string
  }
  onSubmit: (data: { date: string; time?: string; type: number; notes?: string }) => Promise<void>
  onCancel?: () => void
}

export function RecordForm({ initialData, onSubmit, onCancel }: RecordFormProps) {
  const today = new Date().toISOString().split("T")[0]
  const now = new Date().toTimeString().slice(0, 5)

  const [date, setDate] = useState(initialData?.date || today)
  const [time, setTime] = useState(initialData?.time || now)
  const [type, setType] = useState(initialData?.type || 4)
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ date, time, type, notes })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>便便类型 (布里斯托分类)</Label>
        <PoopTypeSelector value={type} onChange={setType} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">时间</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">备注 (可选)</Label>
        <Textarea
          id="notes"
          placeholder="添加备注..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : initialData?.id ? (
            "更新记录"
          ) : (
            "添加记录"
          )}
        </Button>
      </div>
    </form>
  )
}
