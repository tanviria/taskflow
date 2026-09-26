import React, { useState } from 'react';
import {
   Check,
   Calendar,
   Clock,
   Pin,
   Timer,
   Edit2,
   Trash2,
   ChevronDown,
   ChevronRight,
   Plus,
   X,
   CheckCheck,
   CalendarDays,
 } from 'lucide-react';
import { Priority, Project, SubTask, Task } from '../types/todo';
import { formatDateLabel, getPriorityColorClasses, getPriorityLabel } from '../utils/formatters';
import { getTodayDateString } from '../utils/initialData';
import { sounds } from '../utils/audio';

interface TaskItemProps {
  task: Task;
  project?: Project;
  isSelected: boolean;
  onToggleSelect: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onReschedule?: (taskId: string, date: string) => void;
  onChangePriority?: (taskId: string, priority: Priority) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  project,
  isSelected,
  onToggleSelect,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  onStartFocus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onReschedule,
  onChangePriority,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showRescheduleMenu, setShowRescheduleMenu] = useState(false);

  const dateInfo = formatDateLabel(task.dueDate, task.dueTime);
  const priorityColors = getPriorityColorClasses(task.priority);
  const priorityName = getPriorityLabel(task.priority);

  const completedSubtasksCount = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasksCount = task.subtasks.length;
  const allSubtasksDone = totalSubtasksCount > 0 && completedSubtasksCount === totalSubtasksCount;

  const handleSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  return (
    <div
      className={`group relative bg-white border rounded-xl transition-all ${
        isSelected
          ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
          : task.completed
          ? 'border-slate-200/70 bg-slate-50/50 opacity-75'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3 p-3.5 sm:p-4">
        {/* Selection Checkbox (for batch actions) */}
        <div className="pt-0.5 shrink-0 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            aria-label={`Select task ${task.title}`}
            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
          />
        </div>

        {/* Task Completion Checkbox */}
        <div className="pt-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
              task.completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onEdit(task)}
              className={`text-sm font-semibold cursor-pointer select-none transition-colors ${
                task.completed
                  ? 'line-through text-slate-400'
                  : 'text-slate-900 hover:text-indigo-600'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Action Buttons (pinned, reschedule, edit, focus, delete) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity relative">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onTogglePin(task.id);
                }}
                title={task.isPinned ? 'Unpin task' : 'Pin to top'}
                aria-label={task.isPinned ? 'Unpin task' : 'Pin to top'}
                className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                  task.isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              {!task.completed && onReschedule && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleMenu(!showRescheduleMenu)}
                    title="Reschedule task"
                    aria-label="Reschedule task"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                  </button>

                  {showRescheduleMenu && (
                    <div
                      className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 min-w-[140px] text-xs space-y-1 animate-in fade-in duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onReschedule(task.id, getTodayDateString(0));
                          setShowRescheduleMenu(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                      >
                        📅 Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onReschedule(task.id, getTodayDateString(1));
                          setShowRescheduleMenu(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                      >
                        🌅 Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onReschedule(task.id, getTodayDateString(7));
                          setShowRescheduleMenu(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                      >
                        🗓️ Next Week
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!task.completed && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onStartFocus(task);
                  }}
                  title="Start Focus Timer for this task"
                  aria-label="Start Focus Timer for this task"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onEdit(task);
                }}
                title="Edit Task Details"
                aria-label="Edit Task Details"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onDelete(task.id);
                }}
                title="Delete Task"
                aria-label="Delete Task"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description snippet if present */}
          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Clean, Zero-Pill Unboxed Metadata with Typographic Separator (·) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
            {/* Project */}
            {project && (
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span>{project.name}</span>
              </span>
            )}

            {/* Separator */}
            {project && <span className="text-slate-300" aria-hidden="true">·</span>}

            {/* Due Date & Time */}
            {task.dueDate && (
              <>
                <span
                  className={`flex items-center gap-1 tabular-nums ${
                    dateInfo.isOverdue && !task.completed
                      ? 'text-rose-600 font-semibold'
                      : dateInfo.isToday && !task.completed
                      ? 'text-amber-700 font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{dateInfo.label}</span>
                  {dateInfo.isOverdue && !task.completed && (
                    <span className="text-[11px] font-bold text-rose-600">(Overdue)</span>
                  )}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
              </>
            )}

            {/* Priority (Text paired with subtle dot + fast changer) */}
            {onChangePriority && !task.completed ? (
              <div className="relative group/priority">
                <select
                  value={task.priority}
                  onChange={(e) => {
                    sounds.playClick();
                    onChangePriority(task.id, e.target.value as Priority);
                  }}
                  className={`bg-transparent text-xs font-semibold cursor-pointer focus:outline-none appearance-none pr-3 ${priorityColors.text}`}
                  title="Click to change priority"
                  aria-label="Change priority"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-400">▾</span>
              </div>
            ) : (
              <span className={`flex items-center gap-1 font-medium ${priorityColors.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColors.dot}`} />
                <span>{priorityName}</span>
              </span>
            )}

            {/* Estimated / Tracked focus time */}
            {(task.estimatedMinutes || (task.focusMinutesSpent && task.focusMinutesSpent > 0)) && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="flex items-center gap-1 tabular-nums text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {task.focusMinutesSpent ? `${task.focusMinutesSpent}m spent` : ''}
                    {task.focusMinutesSpent && task.estimatedMinutes ? ' / ' : ''}
                    {task.estimatedMinutes ? `${task.estimatedMinutes}m est` : ''}
                  </span>
                </span>
              </>
            )}

            {/* Tags (clean unboxed inline text) */}
            {task.tags && task.tags.length > 0 && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-slate-400">
                  {task.tags.map((t) => `#${t}`).join(' ')}
                </span>
              </>
            )}

            {/* Subtasks Accordion Toggle */}
            {totalSubtasksCount > 0 && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {allSubtasksDone && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                  <span className="tabular-nums">
                    {completedSubtasksCount}/{totalSubtasksCount} subtasks
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Subtasks Expansion Panel */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="space-y-1.5">
                {task.subtasks.map((st: SubTask) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between group/sub px-2 py-1 rounded-md hover:bg-slate-50 transition-colors text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => onToggleSubtask(task.id, st.id)}
                        className="w-3.5 h-3.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                      />
                      <span
                        className={`truncate ${
                          st.completed ? 'line-through text-slate-400' : 'text-slate-700'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onDeleteSubtask(task.id, st.id)}
                      className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Add Subtask Input */}
              {isAddingSubtask ? (
                <form onSubmit={handleSubtaskSubmit} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Subtask title..."
                    autoFocus
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium px-1 py-1 rounded transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add subtask</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

