"use client"

import { useState } from "react";
import { createRecord, deleteRecord } from "@/app/actions/recordActions";

interface RecordData {
  id: string;
  occurredAt: Date;
  qualityRating: number;
  notes?: string;
}

export function RecordForm() {
  const [isPending, setIsPending] = useState(false);
  const [optimisticRecords, setOptimisticRecords] = useState<RecordData[]>([]);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    const tempRecord: RecordData = {
      id: `temp-${Date.now()}`,
      occurredAt: new Date(formData.get("occurredAt") as string),
      qualityRating: parseInt(formData.get("qualityRating") as string),
      notes: formData.get("notes") as string,
    };
    setOptimisticRecords([...optimisticRecords, tempRecord]);

    const result = await createRecord(formData);
    setIsPending(false);
    
    if (result.success && result.data) {
      setOptimisticRecords([...optimisticRecords, result.data]);
    }
  };

  const handleDelete = async (id: string) => {
    setIsPending(true);
    const result = await deleteRecord(id);
    setIsPending(false);
    
    if (result.success) {
      alert("删除成功");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
        <div>
          <label htmlFor="occurredAt" className="block text-sm font-medium mb-2">发生时间</label>
          <input
            id="occurredAt"
            name="occurredAt"
            type="datetime-local"
            required
            className="w-full px-3 py-2 border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="qualityRating" className="block text-sm font-medium mb-2">质量评级</label>
          <input
            id="qualityRating"
            name="qualityRating"
            type="number"
            min="1"
            max="7"
            required
            className="w-full px-3 py-2 border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">备注</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full px-3 py-2 border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring-offset-2"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
      </form>

      {optimisticRecords.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">最近记录</h3>
          {optimisticRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">
                  {record.occurredAt.toLocaleString("zh-CN")}
                </div>
                <div className="font-medium">质量: {record.qualityRating}/7</div>
                {record.notes && <div className="text-sm">{record.notes}</div>}
              </div>
              <button
                onClick={() => handleDelete(record.id)}
                disabled={isPending}
                className="text-destructive hover:text-destructive/90 px-3 py-1 rounded disabled:opacity-50"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
