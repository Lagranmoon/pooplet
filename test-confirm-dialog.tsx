"use client";

import { useState } from "react";
import { ConfirmDialog } from "./src/components/ui/confirm-dialog";

export default function TestConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTest = () => {
    setOpen(true);
  };

  const confirm = () => {
    setResult("确认删除！");
    setOpen(false);
  };

  const cancel = () => {
    setResult("取消删除！");
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">确认对话框测试</h1>
        
        <button
          onClick={handleTest}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mb-4"
        >
          测试删除确认
        </button>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg">结果: {result}</p>
        </div>
        
        <ConfirmDialog
          open={open}
          title="删除记录"
          description="确定要删除这条记录吗？此操作无法撤销。"
          onConfirm={confirm}
          onCancel={cancel}
          confirmText="删除"
          cancelText="取消"
        />
      </div>
    </div>
  );
}