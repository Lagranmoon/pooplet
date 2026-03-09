"use client"

import { cn, getBristolTypeInfo } from "@/lib/utils"
import { Circle, CircleDot, CircleDashed, Minus, Waves, Droplets, AlertCircle } from "lucide-react"

interface PoopTypeSelectorProps {
  value: number
  onChange: (type: number) => void
}

const bristolTypes = [
  { type: 1, name: "坚果状", desc: "严重便秘", Icon: Circle },
  { type: 2, name: "硬块状", desc: "轻度便秘", Icon: CircleDot },
  { type: 3, name: "有裂纹", desc: "正常", Icon: CircleDashed },
  { type: 4, name: "香蕉状", desc: "理想", Icon: Minus },
  { type: 5, name: "软块状", desc: "理想", Icon: Waves },
  { type: 6, name: "边缘毛糙", desc: "轻度腹泻", Icon: Droplets },
  { type: 7, name: "水样", desc: "腹泻", Icon: AlertCircle },
]

export function PoopTypeSelector({ value, onChange }: PoopTypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {bristolTypes.map((t) => {
        const isSelected = value === t.type
        const info = getBristolTypeInfo(t.type)
        const IconComponent = t.Icon

        return (
          <button
            key={t.type}
            type="button"
            onClick={() => onChange(t.type)}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg border-2 transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-transparent bg-muted hover:bg-muted/80",
              info.color.split(" ")[0].replace("bg-", "text-").replace("100", "700")
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-1",
              info.color.split(" ")[0]
            )}>
              <IconComponent className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">{t.name}</span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              {t.desc}
            </span>
          </button>
        )
      })}
    </div>
  )
}
