"use client";

import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "确认",
  cancelText = "取消",
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md mx-4 transform transition-all">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 mb-6">{description}</p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}