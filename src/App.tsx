/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FocusSession, FilterState, Priority, Project, Task, ViewType } from './types/todo';
import { ToastMessage } from './types/toast';
import { loadFocusSessions, loadProjects, loadTasks, saveFocusSessions, saveProjects, saveTasks } from './utils/storage';
import { getTodayDateString, INITIAL_FOCUS_SESSIONS, INITIAL_TASKS } from './utils/initialData';
import { sounds } from './utils/audio';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuickAddBar } from './components/QuickAddBar';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { ExportModal } from './components/ExportModal';
import { FocusTimer } from './components/FocusTimer';
import { BatchActionBar } from './components/BatchActionBar';
import { Toast } from './components/Toast';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ProductivityInsights } from './components/ProductivityInsights';
import { calculateAchievements } from './utils/achievements';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => loadFocusSessions());
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sound muted state
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // Toast system state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Keyboard shortcuts modal
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    setToast({
      ...msg,
      id: `toast-${Date.now()}`,
    });
  }, []);

  const handleToggleSound = () => {
    const next = sounds.toggleMuted();
    setIsMuted(next);
    showToast({
      message: next ? 'Sound muted' : 'Sound enabled',
      duration: 2500,
    });
  };

  // Filter & Sort State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    priorityFilter: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Selected Tasks for batch operations
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Focus Timer active task
  const [focusActiveTaskId, setFocusActiveTaskId] = useState<string | undefined>(undefined);

  // Persist tasks on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Persist projects on change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Persist focus sessions on change
  useEffect(() => {
    saveFocusSessions(focusSessions);
  }, [focusSessions]);

  // Track Unlocked Achievements & Celebrate Newly Unlocked
  const prevUnlockedIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const currentAchievements = calculateAchievements(tasks, focusSessions);
    const currentUnlockedIds = new Set(
      currentAchievements.filter((a) => a.unlocked).map((a) => a.id)
    );

    if (prevUnlockedIdsRef.current !== null) {
      // Find newly unlocked achievements
      const newlyUnlocked = currentAchievements.filter(
        (a) => a.unlocked && !prevUnlockedIdsRef.current?.has(a.id)
      );

      if (newlyUnlocked.length > 0) {
        sounds.playAchievement();
        const first = newlyUnlocked[0];
        showToast({
          message: `🏆 Achievement Unlocked: ${first.title}!`,
          actionText: 'View Badges',
          duration: 5500,
          onAction: () => {
            handleSelectView('insights');
          },
        });
      }
    }

    prevUnlockedIdsRef.current = currentUnlockedIds;
  }, [tasks, focusSessions, showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('main-task-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key === '1') {
        e.preventDefault();
        sounds.playClick();
        handleSelectView('today');
      } else if (e.key === '2') {
        e.preventDefault();
        sounds.playClick();
        handleSelectView('upcoming');
      } else if (e.key === '3') {
        e.preventDefault();
        sounds.playClick();
        handleSelectView('inbox');
      } else if (e.key === '4') {
        e.preventDefault();
        sounds.playClick();
        handleSelectView('all');
      } else if (e.key === '5') {
        e.preventDefault();
        sounds.playClick();
        handleSelectView('focus');
      } else if (e.key === '6') {
        e.preventDefault();
        sounds.playClick();
        handleSelectView('insights');
      } else if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsProjectModalOpen(false);
        setIsExportModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsMobileSidebarOpen(false);
        setSelectedTaskIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // View selection
  const handleSelectView = (view: ViewType, projectId?: string, tag?: string) => {
    setCurrentView(view);
    setSelectedProjectId(projectId);
    setSelectedTag(tag);
    setSelectedTaskIds([]);
    setIsMobileSidebarOpen(false);
  };

  // Task Mutations
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast({
      message: `Task "${newTask.title.slice(0, 24)}${newTask.title.length > 24 ? '...' : ''}" created`,
      duration: 3000,
    });
  };

  const handleSaveModalTask = (
    taskData: Omit<Task, 'id' | 'createdAt'>,
    taskId?: string
  ) => {
    if (taskId) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...taskData } : t))
      );
      showToast({ message: 'Task updated successfully', duration: 2500 });
    } else {
      // Create new
      handleAddTask(taskData);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleCompleteTask = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const willComplete = !targetTask.completed;
    if (willComplete) {
      sounds.playComplete();
    } else {
      sounds.playClick();
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            completed: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );

    // Provide immediate Undo action via toast
    showToast({
      message: willComplete ? 'Task marked as completed' : 'Task marked as active',
      actionText: 'Undo',
      duration: 5000,
      onAction: () => {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                completed: !willComplete,
                completedAt: !willComplete ? new Date().toISOString() : undefined,
              };
            }
            return t;
          })
        );
      },
    });
  };

  const handleTogglePinTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    if (focusActiveTaskId === taskId) {
      setFocusActiveTaskId(undefined);
    }

    // Provide immediate Undo action
    showToast({
      message: 'Task deleted',
      actionText: 'Undo',
      duration: 5000,
      onAction: () => {
        setTasks((prev) => [taskToDelete, ...prev]);
      },
    });
  };

  const handleRescheduleTask = (taskId: string, date: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: date } : t))
    );
    showToast({ message: 'Task rescheduled', duration: 2500 });
  };

  const handleRescheduleAllOverdue = () => {
    const today = getTodayDateString(0);
    const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
    if (overdueCount === 0) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed && t.dueDate && t.dueDate < today) {
          return { ...t, dueDate: today };
        }
        return t;
      })
    );
    showToast({
      message: `${overdueCount} overdue tasks rescheduled to Today`,
      duration: 3500,
    });
  };

  const handleChangePriority = (taskId: string, priority: Priority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority } : t))
    );
  };

  const handleStartFocus = (task: Task) => {
    setFocusActiveTaskId(task.id);
    setCurrentView('focus');
  };

  // Subtasks
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    sounds.playClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updated };
        }
        return t;
      })
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    const newSt = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSt] } : t
      )
    );
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
          : t
      )
    );
  };

  // Project Mutations
  const handleSaveProject = (project: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      if (exists) {
        return prev.map((p) => (p.id === project.id ? project : p));
      } else {
        return [...prev, project];
      }
    });
    handleSelectView('project', project.id);
    showToast({
      message: `Project "${project.name}" saved`,
      duration: 3000,
    });
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const affectedTasks = tasks.filter((t) => t.projectId === projectId);

    const proceed = window.confirm(
      `Are you sure you want to delete "${proj?.name || 'this project'}"? ${
        affectedTasks.length > 0 ? `${affectedTasks.length} tasks will be moved to Inbox.` : ''
      }`
    );
    if (!proceed) return;

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Move tasks in this project to inbox
    setTasks((prev) =>
      prev.map((t) => (t.projectId === projectId ? { ...t, projectId: 'inbox' } : t))
    );
    if (selectedProjectId === projectId) {
      handleSelectView('inbox');
    }
    showToast({
      message: `Project "${proj?.name || 'project'}" deleted`,
      duration: 3000,
    });
  };

  // Batch actions
  const handleToggleSelectTask = (taskId: string) => {
    sounds.playClick();
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBatchComplete = () => {
    const idsToComplete = [...selectedTaskIds];
    const prevTasks = [...tasks];

    setTasks((prev) =>
      prev.map((t) =>
        idsToComplete.includes(t.id)
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      )
    );
    setSelectedTaskIds([]);

    showToast({
      message: `${idsToComplete.length} tasks marked as completed`,
      actionText: 'Undo',
      duration: 5000,
      onAction: () => {
        setTasks(prevTasks);
      },
    });
  };

  const handleBatchDelete = () => {
    const idsToDelete = [...selectedTaskIds];
    const prevTasks = [...tasks];

    setTasks((prev) => prev.filter((t) => !idsToDelete.includes(t.id)));
    setSelectedTaskIds([]);

    showToast({
      message: `${idsToDelete.length} tasks deleted`,
      actionText: 'Undo',
      duration: 5000,
      onAction: () => {
        setTasks(prevTasks);
      },
    });
  };

  const handleBatchReschedule = (date: string) => {
    setTasks((prev) =>
      prev.map((t) => (selectedTaskIds.includes(t.id) ? { ...t, dueDate: date } : t))
    );
    setSelectedTaskIds([]);
    showToast({ message: 'Selected tasks rescheduled', duration: 2500 });
  };

  const handleBatchSetPriority = (priority: Priority) => {
    setTasks((prev) =>
      prev.map((t) => (selectedTaskIds.includes(t.id) ? { ...t, priority } : t))
    );
    setSelectedTaskIds([]);
    showToast({ message: 'Priority updated for selected tasks', duration: 2500 });
  };

  // Focus minutes log
  const handleLogFocusMinutes = useCallback((taskId: string, minutes: number, taskTitle?: string, projectId?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, focusMinutesSpent: (t.focusMinutesSpent || 0) + minutes }
          : t
      )
    );

    const newSession: FocusSession = {
      id: `fs-${Date.now()}`,
      taskId,
      taskTitle: taskTitle || tasks.find((t) => t.id === taskId)?.title,
      projectId: projectId || tasks.find((t) => t.id === taskId)?.projectId,
      durationMinutes: minutes,
      completedAt: new Date().toISOString(),
      mode: 'pomodoro',
    };

    setFocusSessions((prev) => [newSession, ...prev]);

    showToast({
      message: `🎉 Great work! Logged ${minutes} minutes of deep focus.`,
      duration: 4000,
    });
  }, [tasks, showToast]);

  // Filter tasks strictly for current active view
  const currentViewTasks = useMemo(() => {
    const todayStr = getTodayDateString(0);

    switch (currentView) {
      case 'today':
        return tasks.filter(
          (t) =>
            (!t.completed && t.dueDate && t.dueDate <= todayStr) ||
            (t.completed && t.completedAt && t.completedAt.startsWith(todayStr))
        );
      case 'upcoming':
        return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr);
      case 'inbox':
        return tasks.filter((t) => !t.dueDate || t.projectId === 'inbox');
      case 'completed':
        return tasks.filter((t) => t.completed);
      case 'project':
        return selectedProjectId
          ? tasks.filter((t) => t.projectId === selectedProjectId)
          : tasks;
      case 'tag':
        return selectedTag ? tasks.filter((t) => t.tags.includes(selectedTag)) : tasks;
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, currentView, selectedProjectId, selectedTag]);

  // View title
  const currentViewDetails = useMemo(() => {
    switch (currentView) {
      case 'today':
        return {
          title: 'Today',
          description: 'Focus on today’s scheduled commitments and pending deadlines.',
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          description: 'Planned milestones and future tasks on your schedule.',
        };
      case 'inbox':
        return {
          title: 'Inbox',
          description: 'Quick-captured items waiting to be organized.',
        };
      case 'completed':
        return {
          title: 'Completed',
          description: 'Review your finished tasks and accomplishments.',
        };
      case 'all':
        return {
          title: 'All Tasks',
          description: 'Full workspace archive across all categories.',
        };
      case 'project': {
        const proj = projects.find((p) => p.id === selectedProjectId);
        return {
          title: proj?.name || 'Project',
          description: `All tasks assigned to ${proj?.name || 'this project'}.`,
        };
      }
      case 'tag':
        return {
          title: `#${selectedTag}`,
          description: `Tasks filtered by tag #${selectedTag}.`,
        };
      case 'focus':
        return {
          title: 'Focus Timer',
          description: 'Pomodoro-based deep work timer.',
        };
      case 'insights':
        return {
          title: 'Productivity Insights',
          description: 'Visualize your daily task completion rates and focus session history.',
        };
      default:
        return {
          title: 'Tasks',
          description: '',
        };
    }
  }, [currentView, selectedProjectId, selectedTag, projects]);

  const handleToggleSelectAll = () => {
    if (selectedTaskIds.length === currentViewTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(currentViewTasks.map((t) => t.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Header with Integrated Mobile Menu Toggle */}
      <Header
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isMobileMenuOpen={isMobileSidebarOpen}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1500px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentView={currentView}
            selectedProjectId={selectedProjectId}
            selectedTag={selectedTag}
            projects={projects}
            tasks={tasks}
            onSelectView={handleSelectView}
            onOpenNewProjectModal={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            onEditProject={(project) => {
              setEditingProject(project);
              setIsProjectModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              className="w-72 bg-white h-full shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                currentView={currentView}
                selectedProjectId={selectedProjectId}
                selectedTag={selectedTag}
                projects={projects}
                tasks={tasks}
                onSelectView={handleSelectView}
                onOpenNewProjectModal={() => {
                  setIsMobileSidebarOpen(false);
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                onEditProject={(project) => {
                  setIsMobileSidebarOpen(false);
                  setEditingProject(project);
                  setIsProjectModalOpen(true);
                }}
                onDeleteProject={handleDeleteProject}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 md:py-8 max-w-4xl mx-auto w-full">
          {currentView === 'focus' ? (
            <FocusTimer
              tasks={tasks}
              activeTaskId={focusActiveTaskId || tasks.find((t) => !t.completed)?.id}
              onSelectActiveTask={(id) => setFocusActiveTaskId(id)}
              onLogFocusMinutes={handleLogFocusMinutes}
              onCompleteTask={handleToggleCompleteTask}
              onBackToTasks={() => setCurrentView('today')}
            />
          ) : currentView === 'insights' ? (
            <ProductivityInsights
              tasks={tasks}
              projects={projects}
              focusSessions={focusSessions}
              onStartFocusWithTask={(task) => {
                handleStartFocus(task);
              }}
              onNavigateToView={(view) => {
                handleSelectView(view);
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Quick Add Bar */}
              <QuickAddBar
                projects={projects}
                defaultProjectId={selectedProjectId}
                onAddTask={handleAddTask}
              />

              {/* Task List */}
              <TaskList
                tasks={currentViewTasks}
                projects={projects}
                viewTitle={currentViewDetails.title}
                viewDescription={currentViewDetails.description}
                filterState={filterState}
                onUpdateFilter={(updates) => setFilterState((prev) => ({ ...prev, ...updates }))}
                selectedTaskIds={selectedTaskIds}
                onToggleSelectTask={handleToggleSelectTask}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleCompleteTask={handleToggleCompleteTask}
                onTogglePinTask={handleTogglePinTask}
                onEditTask={(t) => {
                  setEditingTask(t);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onStartFocus={handleStartFocus}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                onRescheduleTask={handleRescheduleTask}
                onRescheduleAllOverdue={handleRescheduleAllOverdue}
                onChangePriority={handleChangePriority}
                onOpenCreateTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedTaskIds.length}
        onClearSelection={() => setSelectedTaskIds([])}
        onBatchComplete={handleBatchComplete}
        onBatchDelete={handleBatchDelete}
        onBatchReschedule={handleBatchReschedule}
        onBatchSetPriority={handleBatchSetPriority}
      />

      {/* Floating Toast Notification with Undo Action */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Create / Edit Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          projects={projects}
          defaultProjectId={selectedProjectId}
          onSave={handleSaveModalTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Create / Edit Project Modal */}
      {isProjectModalOpen && (
        <ProjectModal
          project={editingProject}
          onSaveProject={handleSaveProject}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Export / Data Modal */}
      {isExportModalOpen && (
        <ExportModal
          tasks={tasks}
          projects={projects}
          onImportTasks={(importedTasks, importedProjects) => {
            setTasks(importedTasks);
            if (importedProjects && importedProjects.length > 0) {
              setProjects(importedProjects);
            }
            showToast({ message: 'Backup restored successfully', duration: 3000 });
          }}
          onResetTasks={() => {
            setTasks(INITIAL_TASKS);
            setFocusSessions(INITIAL_FOCUS_SESSIONS);
            showToast({ message: 'Reset to demo sample tasks & insights', duration: 3000 });
          }}
          onClearCompleted={() => {
            const count = tasks.filter((t) => t.completed).length;
            setTasks((prev) => prev.filter((t) => !t.completed));
            showToast({ message: `Cleared ${count} completed tasks`, duration: 3000 });
          }}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {isShortcutsModalOpen && (
        <ShortcutsModal onClose={() => setIsShortcutsModalOpen(false)} />
      )}
    </div>
  );
}

