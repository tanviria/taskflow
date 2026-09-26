import React from 'react';
import { CheckCheck, Trash2, Calendar, X, AlertCircle } from 'lucide-react';
import { Priority } from '../types/todo';
import { getTodayDateString } from '../utils/initialData';
import { sounds } from '../utils/audio';

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchComplete: () => void;
  onBatchDelete: () => void;
  onBatchReschedule: (date: string) => void;
  onBatchSetPriority: (priority: Priority) => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBatchComplete,
  onBatchDelete,
  onBatchReschedule,
  onBatchSetPriority,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 flex flex-wrap items-center gap-3 text-xs max-w-[90vw] animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
        <span className="font-semibold tabular-nums">{selectedCount}</span>
        <span className="text-slate-300">selected</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => {
            sounds.playComplete();
            onBatchComplete();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Complete</span>
        </button>

        {/* Reschedule */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => {
              sounds.playClick();
              onBatchReschedule(getTodayDateString(0));
            }}
            className="px-2 py-1 rounded text-[11px] text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onBatchReschedule(getTodayDateString(1));
            }}
            className="px-2 py-1 rounded text-[11px] text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Tomorrow
          </button>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                sounds.playClick();
                onBatchSetPriority(e.target.value as Priority);
                e.target.value = '';
              }
            }}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-800 text-slate-400">
              Priority...
            </option>
            <option value="urgent" className="bg-slate-800 text-rose-300">Urgent</option>
            <option value="high" className="bg-slate-800 text-amber-300">High</option>
            <option value="medium" className="bg-slate-800 text-sky-300">Medium</option>
            <option value="low" className="bg-slate-800 text-slate-300">Low</option>
          </select>
        </div>

        {/* Delete */}
        <button
          onClick={() => {
            sounds.playClick();
            onBatchDelete();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <button
        onClick={onClearSelection}
        title="Deselect all"
        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
