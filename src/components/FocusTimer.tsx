import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles, ChevronRight, ListTodo, ArrowLeft } from 'lucide-react';
import { Task } from '../types/todo';
import { sounds } from '../utils/audio';

interface FocusTimerProps {
  tasks: Task[];
  activeTaskId?: string;
  onSelectActiveTask: (taskId: string) => void;
  onLogFocusMinutes: (taskId: string, minutes: number, taskTitle?: string, projectId?: string) => void;
  onCompleteTask: (taskId: string) => void;
  onBackToTasks: () => void;
}

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export const FocusTimer: React.FC<FocusTimerProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onLogFocusMinutes,
  onCompleteTask,
  onBackToTasks,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [pomodoroDurationMins, setPomodoroDurationMins] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const incompleteTasks = tasks.filter((t) => !t.completed);

  // Switch timer mode
  const handleSwitchMode = (newMode: TimerMode) => {
    sounds.playClick();
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'pomodoro') {
      setTimeLeft(pomodoroDurationMins * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const handleSelectPomodoroDuration = (mins: number) => {
    sounds.playClick();
    setPomodoroDurationMins(mins);
    if (mode === 'pomodoro') {
      setTimeLeft(mins * 60);
      setIsRunning(false);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed!
      sounds.playTimerDone();
      setIsRunning(false);

      if (mode === 'pomodoro') {
        setSessionsCompleted((prev) => prev + 1);
        if (activeTaskId) {
          onLogFocusMinutes(activeTaskId, pomodoroDurationMins, activeTask?.title, activeTask?.projectId);
        }
      }
      // Reset timer
      if (mode === 'pomodoro') {
        setTimeLeft(pomodoroDurationMins * 60);
      } else if (mode === 'shortBreak') {
        setTimeLeft(5 * 60);
      } else {
        setTimeLeft(15 * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, activeTaskId, pomodoroDurationMins, onLogFocusMinutes]);

  const toggleRunning = () => {
    sounds.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sounds.playClick();
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTimeLeft(pomodoroDurationMins * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentDurationTotal =
    mode === 'pomodoro' ? pomodoroDurationMins * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((currentDurationTotal - timeLeft) / currentDurationTotal) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToTasks();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tasks</span>
        </button>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="tabular-nums font-semibold text-slate-800">{sessionsCompleted}</span>
          <span>completed today</span>
        </div>
      </div>

      {/* Mode selection tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => handleSwitchMode('pomodoro')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'shortBreak'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'longBreak'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Duration presets for Focus Mode */}
        {mode === 'pomodoro' && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectPomodoroDuration(mins)}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  pomodoroDurationMins === mins
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Circular Timer Visualizer */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-200"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className={mode === 'pomodoro' ? 'text-indigo-600' : 'text-emerald-500'}
              strokeWidth="4"
              strokeDasharray={283}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formattedTime}
            </span>
            <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {mode === 'pomodoro' ? `${pomodoroDurationMins}m Deep Work` : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={toggleRunning}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset timer"
            aria-label="Reset timer"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Focus Task Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ListTodo className="w-4 h-4" />
            Active Focus Goal
          </span>
          {activeTask && !activeTask.completed && (
            <button
              onClick={() => {
                sounds.playComplete();
                onCompleteTask(activeTask.id);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          )}
        </div>

        {activeTask ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">{activeTask.title}</h4>
            {activeTask.description && (
              <p className="text-xs text-slate-600 leading-relaxed">{activeTask.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span>{activeTask.focusMinutesSpent || 0}m logged</span>
              {activeTask.estimatedMinutes && (
                <>
                  <span>·</span>
                  <span>{activeTask.estimatedMinutes}m target</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-500">
            No task selected. Choose one below to bind your focus session.
          </div>
        )}

        {/* Incomplete Task Selector */}
        {incompleteTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">Switch Target Task:</div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {incompleteTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectActiveTask(t.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    t.id === activeTaskId
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{t.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

