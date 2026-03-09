"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBristolTypeInfo, getBristolColorClass } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface StatsData {
  typeDistribution: { type: number; count: number }[]
  dailyCounts: { date: string; count: number }[]
}

interface StatsChartsProps {
  data: StatsData
  period: string
}

const COLORS = ["#EF4444", "#F59E0B", "#22C55E", "#22C55E", "#22C55E", "#F59E0B", "#EF4444"]

export function StatsCharts({ data, period }: StatsChartsProps) {
  const typeChartData = useMemo(() => {
    return data.typeDistribution.map((item) => ({
      ...item,
      name: getBristolTypeInfo(item.type).label,
    }))
  }, [data.typeDistribution])

  const dailyChartData = useMemo(() => {
    return data.dailyCounts.map((item) => ({
      ...item,
      displayDate: item.date.slice(5), // MM-DD
    }))
  }, [data.dailyCounts])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">类型分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.type - 1]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const typeInfo = getBristolTypeInfo(props.payload.type)
                    return [`${value}次`, `${typeInfo.label} (${typeInfo.desc})`]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {typeChartData.map((item) => (
              <div key={item.type} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[item.type - 1] }}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">每日次数趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [`${value}次`, "次数"]}
                  labelFormatter={(label: string) => `${label}`}
                />
                <Bar dataKey="count" fill="#8B5A2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
