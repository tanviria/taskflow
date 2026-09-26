import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  CheckCircle2,
  Timer,
  TrendingUp,
  Flame,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FocusSession, Project, Task } from '../types/todo';
import { calculateAchievements } from '../utils/achievements';
import { AchievementsModule } from './AchievementsModule';

interface ProductivityInsightsProps {
  tasks: Task[];
  projects: Project[];
  focusSessions: FocusSession[];
  onStartFocusWithTask?: (task: Task) => void;
  onNavigateToView?: (view: 'today' | 'focus') => void;
}

type TimeRange = '7days' | '14days' | '30days';

export const ProductivityInsights: React.FC<ProductivityInsightsProps> = ({
  tasks,
  projects,
  focusSessions,
  onStartFocusWithTask,
  onNavigateToView,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [chartType, setChartType] = useState<'stacked' | 'line'>('stacked');

  const daysCount = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;

  const projectMap = useMemo(() => {
    return new Map<string, Project>(projects.map((p) => [p.id, p]));
  }, [projects]);

  // Generate date series for the selected time range
  const dateSeries = useMemo(() => {
    const list: { key: string; label: string; dateObj: Date }[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      let label = '';
      if (daysCount <= 7) {
        label = d.toLocaleDateString(undefined, { weekday: 'short' });
      } else if (daysCount <= 14) {
        label = d.toLocaleDateString(undefined, { weekday: 'narrow', month: 'numeric', day: 'numeric' });
      } else {
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      list.push({ key, label, dateObj: d });
    }
    return list;
  }, [daysCount]);

  // Aggregate Daily Task Completion Data
  const dailyTaskData = useMemo(() => {
    return dateSeries.map(({ key, label }) => {
      // Completed on this day
      const completedOnDay = tasks.filter((t) => {
        if (!t.completed || !t.completedAt) return false;
        return t.completedAt.startsWith(key);
      }).length;

      // Created on this day
      const createdOnDay = tasks.filter((t) => {
        return t.createdAt.startsWith(key);
      }).length;

      // Focus minutes on this day
      const focusMinutes = focusSessions
        .filter((s) => s.completedAt.startsWith(key))
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);

      // Sessions count
      const sessionsCount = focusSessions.filter((s) => s.completedAt.startsWith(key)).length;

      const completionRate = createdOnDay > 0
        ? Math.min(100, Math.round((completedOnDay / createdOnDay) * 100))
        : completedOnDay > 0 ? 100 : 0;

      return {
        dateKey: key,
        displayDate: label,
        completed: completedOnDay,
        created: createdOnDay,
        focusMinutes,
        sessionsCount,
        completionRate,
      };
    });
  }, [dateSeries, tasks, focusSessions]);

  // Overall KPIs calculation
  const kpis = useMemo(() => {
    const totalCompletedAllTime = tasks.filter((t) => t.completed).length;
    const totalActive = tasks.filter((t) => !t.completed).length;
    const totalTasks = tasks.length;
    const overallRate = totalTasks > 0 ? Math.round((totalCompletedAllTime / totalTasks) * 100) : 0;

    // Range-specific totals
    const rangeKeys = new Set(dateSeries.map((d) => d.key));
    const rangeCompleted = tasks.filter((t) => t.completed && t.completedAt && rangeKeys.has(t.completedAt.slice(0, 10))).length;
    const rangeCreated = tasks.filter((t) => rangeKeys.has(t.createdAt.slice(0, 10))).length;
    const rangeFocusMinutes = focusSessions
      .filter((s) => rangeKeys.has(s.completedAt.slice(0, 10)))
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const rangeSessionsCount = focusSessions.filter((s) => rangeKeys.has(s.completedAt.slice(0, 10))).length;

    // Daily average focus hours
    const avgFocusHours = (rangeFocusMinutes / daysCount / 60).toFixed(1);
    const avgCompletedDaily = (rangeCompleted / daysCount).toFixed(1);

    // Productivity Streak (consecutive days with at least 1 completed task)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dKey = `${year}-${month}-${day}`;

      const hasActivity = tasks.some((t) => t.completed && t.completedAt && t.completedAt.startsWith(dKey)) ||
        focusSessions.some((s) => s.completedAt.startsWith(dKey));

      if (hasActivity) {
        currentStreak++;
      } else {
        // If today has no activity yet, allow checking yesterday before breaking streak
        if (i === 0) continue;
        break;
      }
    }

    return {
      totalCompletedAllTime,
      totalActive,
      overallRate,
      rangeCompleted,
      rangeCreated,
      rangeFocusMinutes,
      rangeSessionsCount,
      avgFocusHours,
      avgCompletedDaily,
      currentStreak,
    };
  }, [tasks, focusSessions, dateSeries, daysCount]);

  // Project Distribution Data (Tasks and Focus Hours)
  const projectDistribution = useMemo(() => {
    const data = projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = projectTasks.filter((t) => t.completed).length;
      const total = projectTasks.length;
      const focusMinutes = focusSessions
        .filter((s) => s.projectId === p.id)
        .reduce((sum, curr) => sum + curr.durationMinutes, 0);

      return {
        id: p.id,
        name: p.name,
        color: p.color,
        tasksCount: total,
        completedCount: completed,
        activeCount: total - completed,
        focusMinutes,
        focusHours: Number((focusMinutes / 60).toFixed(1)),
      };
    });

    return data.filter((d) => d.tasksCount > 0 || d.focusMinutes > 0);
  }, [projects, tasks, focusSessions]);

  // Priority Breakdown Data
  const priorityDistribution = useMemo(() => {
    const priorities: { key: string; name: string; color: string }[] = [
      { key: 'urgent', name: 'Urgent', color: '#f43f5e' },
      { key: 'high', name: 'High', color: '#f59e0b' },
      { key: 'medium', name: 'Medium', color: '#0ea5e9' },
      { key: 'low', name: 'Low', color: '#94a3b8' },
    ];

    return priorities.map((p) => {
      const pTasks = tasks.filter((t) => t.priority === p.key);
      const completed = pTasks.filter((t) => t.completed).length;
      return {
        name: p.name,
        total: pTasks.length,
        completed,
        active: pTasks.length - completed,
        color: p.color,
      };
    });
  }, [tasks]);

  // Recent Focus Session History (last 8 sessions)
  const recentSessions = useMemo(() => {
    return [...focusSessions]
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, 8);
  }, [focusSessions]);

  // Top focus tasks
  const topFocusTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => (t.focusMinutesSpent || 0) > 0)
      .sort((a, b) => (b.focusMinutesSpent || 0) - (a.focusMinutesSpent || 0))
      .slice(0, 5);
  }, [tasks]);

  // Compute Achievements dynamically
  const achievements = useMemo(() => {
    return calculateAchievements(tasks, focusSessions);
  }, [tasks, focusSessions]);

  return (
    <div className="space-y-7 animate-in fade-in duration-200 pb-12">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Productivity Insights</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Live Analytics
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time visual analysis of your daily completion velocity, focus session volume, and project distribution.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === '7days' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('14days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === '14days' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === '30days' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Tasks Completed in Range */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed in Range</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {kpis.rangeCompleted}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold tabular-nums">+{kpis.avgCompletedDaily}</span>
            <span>daily avg</span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums font-medium text-slate-700">{kpis.totalCompletedAllTime} all-time</span>
          </div>
        </div>

        {/* KPI 2: Total Focus Time in Range */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deep Work Time</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Timer className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {(kpis.rangeFocusMinutes / 60).toFixed(1)} <span className="text-base font-medium text-slate-400">hrs</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-indigo-600 font-semibold tabular-nums">{kpis.rangeSessionsCount}</span>
            <span>sessions</span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums font-medium text-slate-700">{kpis.avgFocusHours}h / day</span>
          </div>
        </div>

        {/* KPI 3: Velocity & Completion Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace Health</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {kpis.overallRate}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-700 font-medium tabular-nums">{kpis.totalActive} active</span>
            <span className="text-slate-300">·</span>
            <span>{tasks.length} total tasks</span>
          </div>
        </div>

        {/* KPI 4: Productivity Streak */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Streak</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Flame className="w-4.5 h-4.5 fill-rose-500/20" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums flex items-baseline gap-1.5">
            {kpis.currentStreak} <span className="text-base font-medium text-slate-400">{kpis.currentStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-700 font-medium">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Keep your momentum going!</span>
          </div>
        </div>
      </div>

      {/* Main Chart Section 1: Daily Task Completion Rates */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              Daily Task Throughput & Completion Velocity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing tasks completed versus tasks newly created across the selected period.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
            <button
              onClick={() => setChartType('stacked')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                chartType === 'stacked' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bar Comparison
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                chartType === 'line' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trend Line
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'stacked' ? (
              <BarChart data={dailyTaskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3.5 py-2.5 text-xs space-y-1">
                          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                            {data.dateKey} ({label})
                          </div>
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>Completed:</span>
                            <span className="font-mono font-bold tabular-nums">{data.completed}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-indigo-300">
                            <span>Created:</span>
                            <span className="font-mono font-bold tabular-nums">{data.created}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-amber-300 pt-1 border-t border-slate-800">
                            <span>Focus Time:</span>
                            <span className="font-mono font-bold tabular-nums">{data.focusMinutes}m</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  iconType="circle"
                />
                <Bar
                  name="Tasks Completed"
                  dataKey="completed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  name="Tasks Created"
                  dataKey="created"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            ) : (
              <LineChart data={dailyTaskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3.5 py-2.5 text-xs space-y-1">
                          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                            {data.dateKey} ({label})
                          </div>
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>Completed:</span>
                            <span className="font-mono font-bold tabular-nums">{data.completed}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-indigo-300">
                            <span>Created:</span>
                            <span className="font-mono font-bold tabular-nums">{data.created}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="circle" />
                <Line
                  name="Tasks Completed"
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="Tasks Created"
                  type="monotone"
                  dataKey="created"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#6366f1' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Chart Section 2: Focus Session Volume & Minutes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Timer className="w-4.5 h-4.5 text-indigo-600" />
              Focus Session History (Minutes of Deep Work)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative minutes logged during dedicated Pomodoro focus intervals per day.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Deep Work Minutes</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTaskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="focusColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                unit="m"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3.5 py-2.5 text-xs space-y-1">
                        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                          {data.dateKey} ({label})
                        </div>
                        <div className="flex items-center justify-between gap-4 text-indigo-300">
                          <span>Focus Time:</span>
                          <span className="font-mono font-bold tabular-nums">{data.focusMinutes} minutes</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-400">
                          <span>Sessions:</span>
                          <span className="font-mono font-bold tabular-nums">{data.sessionsCount}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                name="Focus Minutes"
                type="monotone"
                dataKey="focusMinutes"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#focusColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Project Distribution & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-slate-700" />
              Focus Time by Project
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of logged deep work across active workspace projects.
            </p>

            {projectDistribution.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectDistribution}
                        dataKey="focusMinutes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {projectDistribution.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3 py-2 text-xs">
                                <div className="font-semibold">{data.name}</div>
                                <div className="text-slate-300">{data.focusMinutes}m ({data.focusHours}h)</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 w-full space-y-2">
                  {projectDistribution.map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="truncate text-slate-700 font-medium">{proj.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="tabular-nums font-semibold text-slate-900">{proj.focusHours}h</span>
                        <span className="text-[11px] text-slate-400 tabular-nums">({proj.completedCount}/{proj.tasksCount} done)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No project focus history recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Priority Completion Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-slate-700" />
            Task Resolution by Priority
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Total active vs. resolved tasks categorized by priority tier.
          </p>

          <div className="space-y-3.5">
            {priorityDistribution.map((p) => {
              const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-semibold text-slate-800">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="tabular-nums font-medium text-slate-900">{p.completed} of {p.total} resolved</span>
                      <span className="text-slate-300">·</span>
                      <span className="tabular-nums font-semibold text-slate-700">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Focus Session Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              Recent Focus Log & Milestones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed chronological timeline of recent Pomodoro blocks.
            </p>
          </div>

          {onNavigateToView && (
            <button
              onClick={() => onNavigateToView('focus')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span>Open Focus Timer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentSessions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentSessions.map((session) => {
              const sessionDate = new Date(session.completedAt);
              const dateFormatted = sessionDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              const timeFormatted = sessionDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });
              const proj = session.projectId ? projectMap.get(session.projectId) : undefined;

              return (
                <div
                  key={session.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/80 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                      <Timer className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {session.taskTitle || 'General Deep Focus Interval'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                        <span>{dateFormatted} at {timeFormatted}</span>
                        {proj && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: proj.color }}
                              />
                              {proj.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      +{session.durationMinutes}m
                    </span>
                    <div className="text-[10px] text-emerald-600 font-medium">Logged</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No focus intervals recorded yet. Complete a Pomodoro session to see your activity here!
          </div>
        )}
      </div>

      {/* Achievements Module */}
      <AchievementsModule achievements={achievements} />
    </div>
  );
};
