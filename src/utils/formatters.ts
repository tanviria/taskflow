import { Priority } from '../types/todo';

export function formatDateLabel(dueDateStr?: string, dueTimeStr?: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!dueDateStr) {
    return { label: 'No date', isOverdue: false, isToday: false };
  }

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let dateText = '';
  const isToday = diffDays === 0;
  const isOverdue = diffDays < 0;

  if (diffDays === 0) {
    dateText = 'Today';
  } else if (diffDays === 1) {
    dateText = 'Tomorrow';
  } else if (diffDays === -1) {
    dateText = 'Yesterday';
  } else if (diffDays > 1 && diffDays < 7) {
    dateText = targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } else {
    dateText = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  if (dueTimeStr) {
    dateText += ` at ${dueTimeStr}`;
  }

  return {
    label: dateText,
    isOverdue,
    isToday,
  };
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Normal';
  }
}

export function getPriorityColorClasses(priority: Priority): {
  text: string;
  dot: string;
  border: string;
} {
  switch (priority) {
    case 'urgent':
      return {
        text: 'text-rose-700',
        dot: 'bg-rose-500',
        border: 'border-rose-200',
      };
    case 'high':
      return {
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        border: 'border-amber-200',
      };
    case 'medium':
      return {
        text: 'text-sky-700',
        dot: 'bg-sky-500',
        border: 'border-sky-200',
      };
    case 'low':
      return {
        text: 'text-slate-600',
        dot: 'bg-slate-400',
        border: 'border-slate-200',
      };
  }
}
