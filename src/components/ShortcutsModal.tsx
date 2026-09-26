import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'N', description: 'Create a new task' },
    { key: '/', description: 'Focus search bar in task list' },
    { key: '1 - 6', description: 'Switch views (Today, Upcoming, Inbox, All, Focus, Insights)' },
    { key: 'M', description: 'Mute / Unmute audio sound effects' },
    { key: '?', description: 'Open this keyboard shortcuts menu' },
    { key: 'Esc', description: 'Close any open modal or clear selection' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs text-slate-600">{sc.description}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
