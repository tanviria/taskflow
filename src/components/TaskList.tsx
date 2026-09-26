import React, { useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle,
  Inbox,
  Calendar,
  Sparkles,
  Pin,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { FilterState, Priority, Project, SortField, Task } from '../types/todo';
import { TaskItem } from './TaskItem';
import { getTodayDateString } from '../utils/initialData';
import { sounds } from '../utils/audio';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  viewTitle: string;
  viewDescription?: string;
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  selectedTaskIds: string[];
  onToggleSelectTask: (taskId: string) => void;
  onToggleSelectAll: () => void;
  onToggleCompleteTask: (taskId: string) => void;
  onTogglePinTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onOpenCreateTask: () => void;
  onRescheduleTask?: (taskId: string, date: string) => void;
  onRescheduleAllOverdue?: () => void;
  onChangePriority?: (taskId: string, priority: Priority) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  viewTitle,
  viewDescription,
  filterState,
  onUpdateFilter,
  selectedTaskIds,
  onToggleSelectTask,
  onToggleSelectAll,
  onToggleCompleteTask,
  onTogglePinTask,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onOpenCreateTask,
  onRescheduleTask,
  onRescheduleAllOverdue,
  onChangePriority,
}) => {
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const todayStr = getTodayDateString(0);

  // Filter tasks based on search & priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesTags = task.tags.some((t) => t.toLowerCase().includes(query));
        const matchesSubtasks = task.subtasks.some((st) => st.title.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesSubtasks) {
          return false;
        }
      }

      // Priority filter
      if (filterState.priorityFilter !== 'all') {
        if (task.priority !== filterState.priorityFilter) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filterState.searchQuery, filterState.priorityFilter]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    const priorityWeight: Record<Priority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    list.sort((a, b) => {
      // Pinned tasks always on top if incomplete
      if (a.isPinned !== b.isPinned) {
        if (a.isPinned && !a.completed) return -1;
        if (b.isPinned && !b.completed) return 1;
      }

      // Incomplete before completed
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (filterState.sortBy === 'priority') {
        const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        return filterState.sortOrder === 'asc' ? -pDiff : pDiff;
      }

      if (filterState.sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const comp = a.dueDate.localeCompare(b.dueDate);
        return filterState.sortOrder === 'asc' ? comp : -comp;
      }

      if (filterState.sortBy === 'title') {
        const comp = a.title.localeCompare(b.title);
        return filterState.sortOrder === 'asc' ? comp : -comp;
      }

      // Default: createdAt
      const comp = b.createdAt.localeCompare(a.createdAt);
      return filterState.sortOrder === 'asc' ? -comp : comp;
    });

    return list;
  }, [filteredTasks, filterState.sortBy, filterState.sortOrder]);

  // Split into sections: Incomplete vs Completed
  const activeTasks = sortedTasks.filter((t) => !t.completed);
  const completedTasks = sortedTasks.filter((t) => t.completed);

  // Overdue count among active
  const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
  const overdueCount = overdueTasks.length;

  const totalTasksCount = sortedTasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  const isAllSelected =
    sortedTasks.length > 0 && selectedTaskIds.length === sortedTasks.length;

  return (
    <div className="space-y-5">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{viewTitle}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {viewDescription ? (
              <span>{viewDescription}</span>
            ) : (
              <>
                <span className="tabular-nums">{activeTasks.length} active</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{completedTasks.length} completed</span>
                {overdueCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-600 font-semibold tabular-nums">
                      {overdueCount} overdue
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="main-task-search-input"
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
              placeholder="Search tasks... (/)"
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-36 sm:w-44 placeholder-slate-400"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterState.priorityFilter}
              onChange={(e) =>
                onUpdateFilter({ priorityFilter: e.target.value as Priority | 'all' })
              }
              aria-label="Filter by priority"
              className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${filterState.sortBy}-${filterState.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [SortField, 'asc' | 'desc'];
                onUpdateFilter({ sortBy, sortOrder });
              }}
              aria-label="Sort tasks by"
              className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="createdAt-desc">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Bar for Today / Active List */}
      {totalTasksCount > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Progress: <strong className="text-slate-900 font-semibold">{completedTasks.length} of {totalTasksCount}</strong> tasks finished
            </span>
            <span className="tabular-nums font-semibold text-slate-900">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Overdue Alert Banner if overdue tasks exist */}
      {overdueCount > 0 && onRescheduleAllOverdue && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>{overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}</strong> scheduled before today.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onRescheduleAllOverdue();
            }}
            className="flex items-center gap-1 px-3 py-1 font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reschedule all to Today</span>
          </button>
        </div>
      )}

      {/* Select All Row if items present */}
      {sortedTasks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onToggleSelectAll}
              aria-label="Select all tasks in current view"
              className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
            />
            <span>Select all ({sortedTasks.length})</span>
          </label>
        </div>
      )}

      {/* Empty State */}
      {sortedTasks.length === 0 && (
        <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mb-3">
            {filterState.searchQuery ? (
              <Search className="w-6 h-6" />
            ) : (
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {filterState.searchQuery
              ? `No tasks matching "${filterState.searchQuery}"`
              : 'All clear! No tasks here.'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {filterState.searchQuery
              ? 'Try modifying your search or priority filter settings.'
              : 'Add a new task to organize your day and get into flow.'}
          </p>
          <div className="mt-4">
            <button
              onClick={onOpenCreateTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              + Create New Task
            </button>
          </div>
        </div>
      )}

      {/* Active Tasks List */}
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          {activeTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              project={projectMap.get(task.projectId)}
              isSelected={selectedTaskIds.includes(task.id)}
              onToggleSelect={onToggleSelectTask}
              onToggleComplete={onToggleCompleteTask}
              onTogglePin={onTogglePinTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStartFocus={onStartFocus}
              onToggleSubtask={onToggleSubtask}
              onAddSubtask={onAddSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onReschedule={onRescheduleTask}
              onChangePriority={onChangePriority}
            />
          ))}
        </div>
      )}

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Completed ({completedTasks.length})
          </div>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                project={projectMap.get(task.projectId)}
                isSelected={selectedTaskIds.includes(task.id)}
                onToggleSelect={onToggleSelectTask}
                onToggleComplete={onToggleCompleteTask}
                onTogglePin={onTogglePinTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStartFocus={onStartFocus}
                onToggleSubtask={onToggleSubtask}
                onAddSubtask={onAddSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onReschedule={onRescheduleTask}
                onChangePriority={onChangePriority}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

