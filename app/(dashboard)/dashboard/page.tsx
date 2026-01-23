"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../../lib/auth-client";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const qualityOptions = [
  { value: 1, label: "很差", emoji: "😢", color: "bg-rose-300 dark:bg-rose-600", bg: "bg-rose-100 dark:bg-rose-800", text: "text-rose-700 dark:text-rose-300" },
  { value: 2, label: "较差", emoji: "😔", color: "bg-orange-300 dark:bg-orange-600", bg: "bg-orange-100 dark:bg-orange-800", text: "text-orange-700 dark:text-orange-300" },
  { value: 3, label: "一般", emoji: "😐", color: "bg-yellow-300 dark:bg-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-800", text: "text-yellow-700 dark:text-yellow-300" },
  { value: 4, label: "还好", emoji: "🙂", color: "bg-lime-300 dark:bg-lime-600", bg: "bg-lime-100 dark:bg-lime-800", text: "text-lime-700 dark:text-lime-300" },
  { value: 5, label: "良好", emoji: "😊", color: "bg-emerald-300 dark:bg-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-800", text: "text-emerald-700 dark:text-emerald-300" },
  { value: 6, label: "很好", emoji: "😄", color: "bg-teal-300 dark:bg-teal-600", bg: "bg-teal-100 dark:bg-teal-800", text: "text-teal-700 dark:text-teal-300" },
  { value: 7, label: "完美", emoji: "🥳", color: "bg-sky-300 dark:bg-sky-600", bg: "bg-sky-100 dark:bg-sky-800", text: "text-sky-700 dark:text-sky-300" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    occurredAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    qualityRating: 4,
    notes: "",
  });

  useEffect(() => {
    if (session) {
      fetchRecords();
    }
  }, [session]);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/records?limit=10");
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
      }
    } catch (error) {
      console.error("获取记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        setShowForm(false);
        setFormData({
          occurredAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          qualityRating: 4,
          notes: "",
        });
        await fetchRecords();
      } else {
        alert(result.error || "保存失败，请重试");
      }
    } catch (error) {
      console.error("保存记录失败:", error);
      alert("保存失败，请检查网络连接");
    } finally {
      setSubmitting(false);
    }
  };

  const getQualityInfo = (value: number) => {
    return qualityOptions.find((o) => o.value === value) || qualityOptions[0];
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-bounce text-4xl">💗</div>
          <p className="mt-4 text-lg text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const todayRecords = records.filter((r) => {
    const recordDate = new Date(r.occurredAt).toDateString();
    const today = new Date().toDateString();
    return recordDate === today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">📋 健康记录</h1>
            <p className="text-muted-foreground">
              {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN })}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full shadow-md hover:shadow-lg"
          >
            {showForm ? "✕" : "➕ 添加记录"}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border-4 border-primary/20">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
              <span>✨</span> 添加新记录
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-primary">
                  <span>⏰</span> 发生时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.occurredAt}
                  onChange={(e) =>
                    setFormData({ ...formData, occurredAt: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-primary">
                  <span>💩</span> 排便质量
                </label>
                <div className="flex flex-wrap gap-3">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, qualityRating: option.value })
                      }
                      className={`flex-1 min-w-[80px] py-4 px-6 rounded-2xl text-xl font-bold transition-all duration-200 hover:scale-110 ${
                        formData.qualityRating === option.value
                          ? option.color + " shadow-lg scale-105 ring-4 ring-primary"
                          : "bg-white/50 hover:bg-white border-2 border-muted hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-muted-foreground">
                  {getQualityInfo(formData.qualityRating).label}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-primary">
                  <span>📝</span> 备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all resize-none"
                  rows={3}
                  placeholder="可选..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full shadow-lg hover:shadow-xl py-4 text-lg"
              >
                {submitting ? "💫 保存中..." : "✅ 保存记录"}
              </Button>
            </form>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border-4 border-primary/20">
          <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
            <span>🌟</span> 今日记录 <span className="text-xl">{todayRecords.length}</span>
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-block animate-spin text-2xl">🔄</div>
              <p className="mt-4">加载中...</p>
            </div>
          ) : todayRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">今日还没有记录</p>
              <Button
                onClick={() => setShowForm(true)}
                className="rounded-full shadow-lg hover:shadow-xl mt-4"
              >
                ➕ 添加第一条记录
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayRecords.map((record) => {
                const quality = getQualityInfo(record.qualityRating);
                return (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${quality.bg}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{quality.emoji}</span>
                      <div>
                        <p className="font-semibold text-lg">
                          {format(new Date(record.occurredAt), "HH:mm")}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${quality.text}`}
                    >
                      {quality.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-4 border-primary/20">
          <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
            <span>📊</span> 最近记录
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-block animate-spin text-2xl">🔄</div>
              <p className="mt-4">加载中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">还没有任何记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 5).map((record) => {
                const quality = getQualityInfo(record.qualityRating);
                return (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between p-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${quality.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{quality.emoji}</span>
                      <div>
                        <p className="font-medium">
                          {format(new Date(record.occurredAt), "M月d日 HH:mm")}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${quality.text}`}
                    >
                      {quality.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
