import { FocusSession, Project, Task } from '../types/todo';
import { DEFAULT_PROJECTS, INITIAL_FOCUS_SESSIONS, INITIAL_TASKS } from './initialData';

const TASKS_STORAGE_KEY = 'taskflow_tasks_v1';
const PROJECTS_STORAGE_KEY = 'taskflow_projects_v1';
const SESSIONS_STORAGE_KEY = 'taskflow_sessions_v1';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TASKS;
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PROJECTS;
  } catch (err) {
    console.error('Failed to load projects from localStorage', err);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
}

export function loadFocusSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      saveFocusSessions(INITIAL_FOCUS_SESSIONS);
      return INITIAL_FOCUS_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FOCUS_SESSIONS;
  } catch (err) {
    console.error('Failed to load focus sessions from localStorage', err);
    return INITIAL_FOCUS_SESSIONS;
  }
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save focus sessions to localStorage', err);
  }
}
