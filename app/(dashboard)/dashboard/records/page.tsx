"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { deleteRecord } from "../../../actions/recordActions";

const qualityOptions = [
  { value: 1, label: "很差", color: "bg-red-500", textColor: "text-red-500" },
  { value: 2, label: "较差", color: "bg-orange-500", textColor: "text-orange-500" },
  { value: 3, label: "一般", color: "bg-yellow-500", textColor: "text-yellow-500" },
  { value: 4, label: "还好", color: "bg-lime-500", textColor: "text-lime-500" },
  { value: 5, label: "良好", color: "bg-green-400", textColor: "text-green-400" },
  { value: 6, label: "很好", color: "bg-green-500", textColor: "text-green-500" },
  { value: 7, label: "完美", color: "bg-emerald-500", textColor: "text-emerald-500" },
];

export default function RecordsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchRecords();
    }
  }, [session, page]);

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/records?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("获取记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    setDeleting(id);
    const result = await deleteRecord(id);
    if (result.success) {
      fetchRecords();
    }
    setDeleting(null);
  };

  const getQualityInfo = (value: number) => {
    return qualityOptions.find((o) => o.value === value) || qualityOptions[0];
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">所有记录</h1>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : records.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">还没有任何记录</p>
          <a
            href="/dashboard"
            className="text-primary hover:underline"
          >
            去添加记录
          </a>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">质量</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">备注</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record) => {
                  const quality = getQualityInfo(record.qualityRating);
                  return (
                    <tr key={record.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {format(new Date(record.occurredAt), "yyyy年M月d日")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(record.occurredAt), "HH:mm")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${quality.color}`}>
                          {quality.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-muted-foreground truncate max-w-xs block">
                          {record.notes || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deleting === record.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 text-sm"
                        >
                          {deleting === record.id ? "删除中..." : "删除"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-input bg-transparent rounded-lg disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-input bg-transparent rounded-lg disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
