import { Achievement } from '../types/achievement';
import { FocusSession, Task } from '../types/todo';

/**
 * Calculates user achievements dynamically based on all-time tasks and focus sessions.
 */
export function calculateAchievements(tasks: Task[], focusSessions: FocusSession[]): Achievement[] {
  const completedTasks = tasks.filter((t) => t.completed);
  const totalCompleted = completedTasks.length;

  // 1. Max focus sessions in a single day
  const sessionsByDay: Record<string, number> = {};
  focusSessions.forEach((s) => {
    const day = s.completedAt.slice(0, 10);
    sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
  });
  const maxSessionsInADay = Object.values(sessionsByDay).reduce((max, val) => Math.max(max, val), 0);

  // 2. Max tasks completed in a row without a deleted/failed task (or consecutive completed tasks)
  // Let's sort completed tasks by completedAt
  const sortedCompleted = [...completedTasks].sort((a, b) =>
    (a.completedAt || a.createdAt).localeCompare(b.completedAt || b.createdAt)
  );

  // Measure completion streak or total completions
  // Also check consecutive completions across consecutive calendar days
  const completedByDay: Record<string, number> = {};
  completedTasks.forEach((t) => {
    if (t.completedAt) {
      const day = t.completedAt.slice(0, 10);
      completedByDay[day] = (completedByDay[day] || 0) + 1;
    }
  });

  // Calculate day streak
  let dayStreak = 0;
  let maxDayStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((completedByDay[key] || 0) > 0 || (sessionsByDay[key] || 0) > 0) {
      dayStreak++;
      if (dayStreak > maxDayStreak) maxDayStreak = dayStreak;
    } else {
      if (i > 0) break;
    }
  }

  // Check 10 tasks completed in a row (total streak of completed tasks)
  const taskRowStreak = totalCompleted;

  // Total deep work minutes
  const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Urgent tasks conquered
  const urgentCompleted = completedTasks.filter((t) => t.priority === 'urgent').length;

  // Subtask master (completed subtasks)
  const subtasksCompleted = tasks.reduce((sum, t) => sum + t.subtasks.filter((st) => st.completed).length, 0);

  const achievements: Achievement[] = [
    {
      id: 'focus_5_in_day',
      title: 'Hyperfocus Dynamo',
      description: 'Complete 5 or more deep focus sessions in a single day.',
      category: 'focus',
      tier: 'gold',
      icon: 'Zap',
      unlocked: maxSessionsInADay >= 5,
      currentValue: maxSessionsInADay,
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((maxSessionsInADay / 5) * 100)),
      unit: 'sessions',
    },
    {
      id: 'tasks_10_in_row',
      title: 'Flawless Flow',
      description: 'Complete 10 tasks in a row.',
      category: 'completion',
      tier: 'silver',
      icon: 'Award',
      unlocked: taskRowStreak >= 10,
      currentValue: taskRowStreak,
      targetValue: 10,
      progressPercent: Math.min(100, Math.round((taskRowStreak / 10) * 100)),
      unit: 'tasks',
    },
    {
      id: 'streak_3_days',
      title: 'Habit Builder',
      description: 'Maintain a 3-day active productivity streak.',
      category: 'consistency',
      tier: 'bronze',
      icon: 'Flame',
      unlocked: maxDayStreak >= 3,
      currentValue: maxDayStreak,
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((maxDayStreak / 3) * 100)),
      unit: 'days',
    },
    {
      id: 'streak_7_days',
      title: 'Momentum Master',
      description: 'Keep a daily task or focus streak alive for 7 consecutive days.',
      category: 'consistency',
      tier: 'platinum',
      icon: 'Trophy',
      unlocked: maxDayStreak >= 7,
      currentValue: maxDayStreak,
      targetValue: 7,
      progressPercent: Math.min(100, Math.round((maxDayStreak / 7) * 100)),
      unit: 'days',
    },
    {
      id: 'deep_work_centurion',
      title: 'Deep Work Century',
      description: 'Accumulate 100 minutes of deep focus intervals.',
      category: 'focus',
      tier: 'bronze',
      icon: 'Timer',
      unlocked: totalFocusMinutes >= 100,
      currentValue: totalFocusMinutes,
      targetValue: 100,
      progressPercent: Math.min(100, Math.round((totalFocusMinutes / 100) * 100)),
      unit: 'mins',
    },
    {
      id: 'deep_work_master',
      title: 'Flow State Virtuoso',
      description: 'Accumulate 300 minutes (5 hours) of focused Pomodoro work.',
      category: 'focus',
      tier: 'gold',
      icon: 'Sparkles',
      unlocked: totalFocusMinutes >= 300,
      currentValue: totalFocusMinutes,
      targetValue: 300,
      progressPercent: Math.min(100, Math.round((totalFocusMinutes / 300) * 100)),
      unit: 'mins',
    },
    {
      id: 'urgent_triage',
      title: 'Crisis Defuser',
      description: 'Conquer 3 Urgent priority tasks without procrastination.',
      category: 'completion',
      tier: 'silver',
      icon: 'ShieldAlert',
      unlocked: urgentCompleted >= 3,
      currentValue: urgentCompleted,
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((urgentCompleted / 3) * 100)),
      unit: 'tasks',
    },
    {
      id: 'checklist_champion',
      title: 'Checklist Champion',
      description: 'Cross off 5 micro-subtasks to break down complex goals.',
      category: 'organization',
      tier: 'bronze',
      icon: 'CheckCheck',
      unlocked: subtasksCompleted >= 5,
      currentValue: subtasksCompleted,
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((subtasksCompleted / 5) * 100)),
      unit: 'subtasks',
    },
  ];

  return achievements;
}
