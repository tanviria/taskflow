import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  CheckCheck,
  ShieldAlert,
  Sparkles,
  Timer,
  Check,
  Lock,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Achievement, AchievementCategory, AchievementTier } from '../types/achievement';

interface AchievementsModuleProps {
  achievements: Achievement[];
}

export const AchievementsModule: React.FC<AchievementsModuleProps> = ({ achievements }) => {
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | 'all'>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const overallUnlockedPct = Math.round((unlockedCount / totalCount) * 100);

  const filtered = achievements.filter((a) => {
    if (filterCategory === 'all') return true;
    return a.category === filterCategory;
  });

  const getIcon = (iconName: string, unlocked: boolean) => {
    const className = `w-5 h-5 ${unlocked ? '' : 'text-slate-400'}`;
    switch (iconName) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Timer':
        return <Timer className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'CheckCheck':
        return <CheckCheck className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  const getTierBadge = (tier: AchievementTier) => {
    switch (tier) {
      case 'platinum':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
            Platinum
          </span>
        );
      case 'gold':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Gold
          </span>
        );
      case 'silver':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Silver
          </span>
        );
      case 'bronze':
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
            Bronze
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header with Title and Level Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Milestones & Achievements</h2>
              <p className="text-xs text-slate-500">
                Earn badges as you maintain focus streaks, clear batches, and reach deep work goals.
              </p>
            </div>
          </div>
        </div>

        {/* Progress summary pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-900">
              <span className="tabular-nums font-bold text-amber-600">{unlockedCount}</span> of {totalCount} Unlocked
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums">{overallUnlockedPct}% completed</div>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500"
                strokeWidth="3.5"
                strokeDasharray={`${overallUnlockedPct}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-800 tabular-nums">
              {overallUnlockedPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'focus', label: 'Focus Sessions' },
          { id: 'completion', label: 'Task Streaks' },
          { id: 'consistency', label: 'Daily Habits' },
          { id: 'organization', label: 'Subtasks & Depth' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as AchievementCategory | 'all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((achievement) => {
          const isUnlocked = achievement.unlocked;

          return (
            <div
              key={achievement.id}
              className={`relative border rounded-xl p-4 transition-all ${
                isUnlocked
                  ? 'bg-white border-amber-200/80 shadow-xs hover:border-amber-300'
                  : 'bg-slate-50/70 border-slate-200/70 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Badge Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-300/80 shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {isUnlocked ? (
                    getIcon(achievement.icon, true)
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {achievement.title}
                    </h3>
                    {getTierBadge(achievement.tier)}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {achievement.description}
                  </p>

                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        {isUnlocked ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Unlocked
                          </span>
                        ) : (
                          <span>Progress:</span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums text-slate-700">
                        {achievement.currentValue} / {achievement.targetValue} {achievement.unit}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isUnlocked ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${achievement.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
