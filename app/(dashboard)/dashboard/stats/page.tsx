"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState, useCallback } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6"];

export default function StatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats/overview?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("获取统计失败:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session, fetchStats]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  const qualityDistribution = stats?.qualityDistribution?.map((item: any) => ({
    name: ["很差", "较差", "一般", "还好", "良好", "很好", "完美"][item.qualityRating - 1],
    value: item.count,
  })) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">健康统计</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-input bg-transparent rounded-lg"
        >
          <option value="7">最近7天</option>
          <option value="14">最近14天</option>
          <option value="30">最近30天</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">总记录数</p>
          <p className="text-3xl font-bold">{stats?.totalRecords || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">日均排便</p>
          <p className="text-3xl font-bold">
            {stats?.dailyAverage ? stats.dailyAverage.toFixed(1) : "0"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">平均质量</p>
          <p className="text-3xl font-bold">
            {stats?.averageQuality ? stats.averageQuality.toFixed(1) : "0"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">排便频率</h2>
        {stats?.frequencyData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "M/d")}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(value as string), "M月d日")}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">暂无数据</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">质量分布</h2>
          {qualityDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">暂无数据</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">质量趋势</h2>
          {stats?.qualityTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "M/d")}
                />
                <YAxis domain={[1, 7]} />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value as string), "M月d日")}
                  formatter={(value: number) => [
                    ["很差", "较差", "一般", "还好", "良好", "很好", "完美"][value - 1] || value,
                    "质量",
                  ]}
                />
                <Bar dataKey="avgQuality" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
