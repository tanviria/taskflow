import React from 'react';
import {
  Calendar,
  Clock,
  Inbox,
  CheckCircle2,
  ListTodo,
  Timer,
  FolderKanban,
  Tag,
  Plus,
  Trash2,
  Edit2,
  LineChart,
} from 'lucide-react';
import { Project, Task, ViewType } from '../types/todo';
import { getTodayDateString } from '../utils/initialData';
import { sounds } from '../utils/audio';

interface SidebarProps {
  currentView: ViewType;
  selectedProjectId?: string;
  selectedTag?: string;
  projects: Project[];
  tasks: Task[];
  onSelectView: (view: ViewType, projectId?: string, tag?: string) => void;
  onOpenNewProjectModal: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedProjectId,
  selectedTag,
  projects,
  tasks,
  onSelectView,
  onOpenNewProjectModal,
  onEditProject,
  onDeleteProject,
}) => {
  const todayStr = getTodayDateString(0);

  // Compute counts
  const todayTasksCount = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate <= todayStr
  ).length;

  const upcomingTasksCount = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate > todayStr
  ).length;

  const inboxTasksCount = tasks.filter(
    (t) => !t.completed && (!t.dueDate || t.projectId === 'inbox')
  ).length;

  const completedCount = tasks.filter((t) => t.completed).length;
  const allActiveCount = tasks.filter((t) => !t.completed).length;

  // Completed today count
  const completedTodayCount = tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)
  ).length;

  // Extract all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags))).filter(Boolean);

  const mainNavItems = [
    {
      id: 'today' as ViewType,
      label: 'Today',
      icon: Calendar,
      count: todayTasksCount,
      badgeColor: todayTasksCount > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100',
    },
    {
      id: 'upcoming' as ViewType,
      label: 'Upcoming',
      icon: Clock,
      count: upcomingTasksCount,
      badgeColor: 'text-slate-500 bg-slate-100',
    },
    {
      id: 'inbox' as ViewType,
      label: 'Inbox',
      icon: Inbox,
      count: inboxTasksCount,
      badgeColor: 'text-slate-500 bg-slate-100',
    },
    {
      id: 'all' as ViewType,
      label: 'All Tasks',
      icon: ListTodo,
      count: allActiveCount,
      badgeColor: 'text-slate-500 bg-slate-100',
    },
    {
      id: 'completed' as ViewType,
      label: 'Completed',
      icon: CheckCircle2,
      count: completedCount,
      badgeColor: 'text-emerald-700 bg-emerald-50',
    },
    {
      id: 'focus' as ViewType,
      label: 'Focus Timer',
      icon: Timer,
      count: null,
      badgeColor: '',
    },
    {
      id: 'insights' as ViewType,
      label: 'Productivity Insights',
      icon: LineChart,
      count: null,
      badgeColor: '',
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200 bg-white h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Main Navigation Views */}
        <div>
          <div className="px-2 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Views
          </div>
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive =
                currentView === item.id && !selectedProjectId && !selectedTag;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectView(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span
                      className={`tabular-nums text-[11px] px-1.5 py-0.2 rounded font-medium ${
                        isActive ? 'text-slate-200 bg-slate-800' : item.badgeColor
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" />
              Projects
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenNewProjectModal();
              }}
              title="Add New Project"
              aria-label="Add New Project"
              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {projects.map((project) => {
              const isActive = currentView === 'project' && selectedProjectId === project.id;
              const projectTaskCount = tasks.filter(
                (t) => !t.completed && t.projectId === project.id
              ).length;

              return (
                <div
                  key={project.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    sounds.playClick();
                    onSelectView('project', project.id);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`tabular-nums text-[11px] mr-1 ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {projectTaskCount}
                    </span>

                    {/* Edit Project Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        onEditProject(project);
                      }}
                      title={`Edit ${project.name}`}
                      aria-label={`Edit ${project.name}`}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity ${
                        isActive ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          onDeleteProject(project.id);
                        }}
                        title={`Delete ${project.name}`}
                        aria-label={`Delete ${project.name}`}
                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-rose-600 transition-opacity ${
                          isActive ? 'text-slate-300 hover:text-white' : 'text-slate-400'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div className="px-2 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map((tag) => {
                const isActive = currentView === 'tag' && selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      sounds.playClick();
                      onSelectView('tag', undefined, tag);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-medium shadow-2xs'
                        : 'text-slate-600 bg-slate-100/70 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Productivity Stats (Clean zero-pill metadata) */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Completed today</span>
          <span className="font-semibold text-slate-800 tabular-nums">{completedTodayCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Active queue</span>
          <span className="font-semibold text-slate-800 tabular-nums">{allActiveCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total completed</span>
          <span className="font-semibold text-slate-800 tabular-nums">{completedCount}</span>
        </div>
      </div>
    </aside>
  );
};

