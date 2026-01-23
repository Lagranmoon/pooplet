"use client";

import { useState, useOptimistic } from "react";
import { format } from "date-fns";
import { createRecord, deleteRecord } from "@/app/actions/recordActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecordItem {
  id: string;
  occurredAt: Date;
  qualityRating: number;
  notes?: string;
}

export function RecordList({ initialRecords }: { initialRecords: RecordItem[] }) {
  const [records, setRecords] = useState<RecordItem[]>(initialRecords);

  const [optimisticRecords] = useOptimistic(
    records,
    (state, newItem: RecordItem) => [...state, newItem]
  );

  const handleSubmit = async (formData: FormData) => {
    const result = await createRecord(formData);
    if (result.success && result.data) {
      const newItem: RecordItem = {
        id: result.data.id,
        occurredAt: result.data.occurredAt,
        qualityRating: result.data.qualityRating,
        notes: result.data.notes,
      };
      setRecords([...records, newItem]);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRecord(id);
    if (result.success) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="occurredAt" className="block text-sm font-medium mb-2">
              发生时间
            </label>
            <input
              id="occurredAt"
              name="occurredAt"
              type="datetime-local"
              required
              className="w-full px-3 py-2 border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring-offset-2"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label htmlFor="qualityRating" className="block text-sm font-medium mb-2">
              质量评级 (1-7)
            </label>
            <input
              id="qualityRating"
              name="qualityRating"
              type="number"
              min="1"
              max="7"
              required
              placeholder="1-7"
              className="w-full px-3 py-2 border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring-offset-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            备注
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            placeholder="可选备注"
            className="w-full px-3 py-2 border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring-offset-2"
          />
        </div>

        <Button type="submit">
          添加记录
        </Button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>质量评级</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(record.occurredAt, "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{record.qualityRating}</Badge>
                </TableCell>
                <TableCell>{record.notes || "-"}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    disabled={record.id.startsWith("temp")}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {records.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无记录，开始添加第一条记录
          </div>
        )}
      </div>
    </div>
  );
}
