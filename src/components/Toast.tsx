import React, { useEffect, useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { ToastMessage } from '../types/toast';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const duration = toast.duration || 4500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/80 px-4 py-3 min-w-[280px] max-w-sm overflow-hidden flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-100 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">{toast.message}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toast.actionText && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss();
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{toast.actionText}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close notification"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress line */}
        <div className="w-full bg-slate-800 h-0.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-400 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
