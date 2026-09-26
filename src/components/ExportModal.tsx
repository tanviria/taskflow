import React, { useRef } from 'react';
import { X, FileJson, FileSpreadsheet, Upload, RotateCcw, Trash2 } from 'lucide-react';
import { Project, Task } from '../types/todo';
import { sounds } from '../utils/audio';

interface ExportModalProps {
  tasks: Task[];
  projects: Project[];
  onImportTasks: (tasks: Task[], projects?: Project[]) => void;
  onResetTasks: () => void;
  onClearCompleted: () => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  tasks,
  projects,
  onImportTasks,
  onResetTasks,
  onClearCompleted,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    sounds.playClick();
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    sounds.playClick();
    const headers = ['Title', 'Completed', 'Priority', 'Project', 'DueDate', 'DueTime', 'EstimatedMinutes', 'Tags'];
    const projectMap = new Map(projects.map((p) => [p.id, p.name]));

    const rows = tasks.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.completed ? 'Yes' : 'No',
      t.priority,
      `"${(projectMap.get(t.projectId) || t.projectId).replace(/"/g, '""')}"`,
      t.dueDate || '',
      t.dueTime || '',
      t.estimatedMinutes || '',
      `"${t.tags.join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportTasks(parsed);
          sounds.playComplete();
          onClose();
        } else if (parsed && Array.isArray(parsed.tasks)) {
          onImportTasks(parsed.tasks, parsed.projects);
          sounds.playComplete();
          onClose();
        } else {
          alert('Invalid backup file format');
        }
      } catch {
        alert('Could not parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Data & Backup Options</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Export Data
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700 cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-indigo-600" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Import & Restore
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Restore from JSON backup file</span>
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Maintenance
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  onClearCompleted();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clear completed tasks</span>
                </div>
                <span className="tabular-nums text-slate-400 text-[11px]">
                  {tasks.filter((t) => t.completed).length} items
                </span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  if (confirm('Reset to sample demo tasks? Your custom tasks will be replaced.')) {
                    onResetTasks();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-rose-50 text-xs text-rose-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Reset to demo sample tasks</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
