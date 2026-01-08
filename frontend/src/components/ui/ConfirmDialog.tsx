import { Card, CardContent } from './card';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>

          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
            >
              {loading ? '删除中...' : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
