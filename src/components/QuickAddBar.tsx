import React, { useState } from 'react';
import { Plus, Calendar, Flag, Folder, Clock, Hash } from 'lucide-react';
import { Priority, Project, Task } from '../types/todo';
import { getTodayDateString } from '../utils/initialData';
import { sounds } from '../utils/audio';

interface QuickAddBarProps {
  projects: Project[];
  defaultProjectId?: string;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  projects,
  defaultProjectId,
  onAddTask,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(getTodayDateString(0));
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || projects[0]?.id || 'inbox');
  const [tagsInput, setTagsInput] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);

  const handleTitleChange = (val: string) => {
    setTitle(val);

    // Natural language quick tags auto-detection
    const lower = val.toLowerCase();

    // Priority detection: !urgent, !high, !med, !low
    if (lower.includes('!urgent') || lower.includes('!p1')) {
      setPriority('urgent');
    } else if (lower.includes('!high') || lower.includes('!p2')) {
      setPriority('high');
    } else if (lower.includes('!med') || lower.includes('!medium') || lower.includes('!p3')) {
      setPriority('medium');
    } else if (lower.includes('!low') || lower.includes('!p4')) {
      setPriority('low');
    }

    // Date detection: "today", "tomorrow", "next week"
    if (/\btoday\b/i.test(lower)) {
      setDueDate(getTodayDateString(0));
    } else if (/\btomorrow\b/i.test(lower)) {
      setDueDate(getTodayDateString(1));
    } else if (/\bnext week\b/i.test(lower)) {
      setDueDate(getTodayDateString(7));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playClick();

    // Clean shortcut tokens from title if desired
    let cleanedTitle = title.trim();
    cleanedTitle = cleanedTitle.replace(/!(urgent|high|med|medium|low|p[1-4])\b/gi, '').trim();

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onAddTask({
      title: cleanedTitle || title.trim(),
      description: description.trim() || undefined,
      completed: false,
      dueDate: dueDate || undefined,
      priority,
      projectId: projectId || projects[0]?.id || 'inbox',
      tags: parsedTags,
      subtasks: [],
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      focusMinutesSpent: 0,
    });

    setTitle('');
    setDescription('');
    setTagsInput('');
    setEstimatedMinutes(undefined);
    setIsOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden transition-all">
      <form onSubmit={handleSubmit}>
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={title}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Add a new task... (try 'Ship report tomorrow !urgent')"
              className="w-full text-sm font-medium placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {isOpen && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description or notes (optional)"
                className="w-full text-xs text-slate-600 placeholder-slate-400 focus:outline-none bg-transparent"
              />

              {/* Action row with controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Due Date Shortcut Buttons */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
                    <button
                      type="button"
                      onClick={() => setDueDate(getTodayDateString(0))}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        dueDate === getTodayDateString(0)
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueDate(getTodayDateString(1))}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        dueDate === getTodayDateString(1)
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tomorrow
                    </button>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="px-1 text-[11px] text-slate-600 bg-transparent border-0 focus:outline-none"
                    />
                  </div>

                  {/* Priority selector */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                    <Flag className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Project selector */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer max-w-[120px] truncate"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="tags (comma-sep)"
                      className="bg-transparent text-slate-700 text-xs focus:outline-none w-24 placeholder-slate-400"
                    />
                  </div>

                  {/* Est. Minutes */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={estimatedMinutes || ''}
                      onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="mins"
                      className="bg-transparent text-slate-700 text-xs focus:outline-none w-12 placeholder-slate-400 tabular-nums"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setTitle('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
