export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: Priority;
  projectId: string;
  tags: string[];
  subtasks: SubTask[];
  estimatedMinutes?: number;
  focusMinutesSpent?: number;
  isPinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string; // Tailwind color token or hex
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  durationMinutes: number;
  completedAt: string; // ISO date string
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'completed' | 'all' | 'project' | 'tag' | 'focus' | 'insights';

export type SortField = 'dueDate' | 'priority' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  priorityFilter: Priority | 'all';
  sortBy: SortField;
  sortOrder: SortOrder;
}
