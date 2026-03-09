"use client"

import { cn, getBristolTypeInfo } from "@/lib/utils"

interface PoopTypeSelectorProps {
  value: number
  onChange: (type: number) => void
}

const bristolTypes = [
  { type: 1, icon: "🌰", name: "坚果状", desc: "严重便秘" },
  { type: 2, icon: "🌽", name: "硬块状", desc: "轻度便秘" },
  { type: 3, icon: "🥖", name: "有裂纹", desc: "正常" },
  { type: 4, icon: "🍌", name: "香蕉状", desc: "理想" },
  { type: 5, icon: "🥞", name: "软块状", desc: "理想" },
  { type: 6, icon: "🍦", name: "边缘毛糙", desc: "轻度腹泻" },
  { type: 7, icon: "💧", name: "水样", desc: "腹泻" },
]

export function PoopTypeSelector({ value, onChange }: PoopTypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {bristolTypes.map((t) => {
        const isSelected = value === t.type
        const info = getBristolTypeInfo(t.type)

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
            <span className="text-2xl mb-1">{t.icon}</span>
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
