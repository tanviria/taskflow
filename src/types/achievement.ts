export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type AchievementCategory = 'focus' | 'completion' | 'consistency' | 'organization';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  unit: string;
}
