"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatsCharts } from "@/components/stats-charts"
import { getBristolTypeInfo } from "@/lib/utils"
import { Calendar, Activity, Target, TrendingUp } from "lucide-react"

interface StatsData {
  period: string
  summary: {
    totalCount: number
    uniqueDays: number
    avgType: number | null
    idealPercentage: number
    currentStreak: number
  }
  comparison: {
    totalCountChange: number
  }
  typeDistribution: { type: number; count: number }[]
  dailyCounts: { date: string; count: number }[]
}

export default function StatsPage() {
  const [period, setPeriod] = useState("month")
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/stats?period=${period}`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [period])

  const periodLabel = {
    week: "本周",
    month: "本月",
    year: "本年",
  }[period]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">统计数据</h1>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="week">本周</TabsTrigger>
            <TabsTrigger value="month">本月</TabsTrigger>
            <TabsTrigger value="year">本年</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{periodLabel}次数</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold">{stats?.summary.totalCount || 0}</p>
              {stats?.comparison.totalCountChange !== 0 && (
                <span
                  className={`text-xs mb-1 ${
                    (stats?.comparison.totalCountChange || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(stats?.comparison.totalCountChange || 0) > 0 ? "+" : ""}
                  {stats?.comparison.totalCountChange}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">记录天数</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.summary.uniqueDays || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">理想比例</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.summary.idealPercentage || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">平均类型</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {stats?.summary.avgType ? stats.summary.avgType.toFixed(1) : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {stats && <StatsCharts data={stats} period={period} />}

      {/* Type Distribution Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">类型详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((type) => {
              const count =
                stats?.typeDistribution.find((d) => d.type === type)?.count || 0
              const typeInfo = getBristolTypeInfo(type)
              const percentage =
                stats?.summary.totalCount && stats.summary.totalCount > 0
                  ? Math.round((count / stats.summary.totalCount) * 100)
                  : 0

              return (
                <div
                  key={type}
                  className={`p-3 rounded-lg border text-center ${typeInfo.color}`}
                >
                  <p className="font-bold text-lg">{type}</p>
                  <p className="text-xs">{typeInfo.label}</p>
                  <p className="text-lg font-semibold mt-1">{count}</p>
                  <p className="text-xs opacity-75">{percentage}%</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">布里斯托大便分类说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium">正常 (类型 3-5):</span>
              <span className="text-muted-foreground">健康的便便，保持当前习惯</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="font-medium">轻微异常 (类型 2,6):</span>
              <span className="text-muted-foreground">注意调整饮食和水分摄入</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium">需要关注 (类型 1,7):</span>
              <span className="text-muted-foreground">建议咨询医生或调整生活习惯</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
