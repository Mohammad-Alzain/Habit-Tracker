export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ...

export type HabitMode = 'build' | 'quit'; // بناء عادة أم إقلاع عن عادة
export type HabitType = 'boolean' | 'numeric' | 'timer';
export type TrackingType = 'step_by_step' | 'custom_value'; // خطوة بخطوة أم قيمة مخصصة
export type HabitCategory = 'health' | 'fitness' | 'mind' | 'work' | 'learning' | 'lifestyle';
export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening';
export type ViewMode = 'heatmap' | 'checklist' | 'compact';

export type HabitGoalType = 'days' | 'months' | 'streak' | 'total_count' | 'frequency';

export interface HabitGoal {
  type: HabitGoalType;
  targetValue: number; // number of days (e.g. 66), months (e.g. 3), streak (e.g. 100), or count
  title?: string;
  startDate?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  customDays?: DayOfWeek[];
  mode: HabitMode; // 'build' (بناء عادة) or 'quit' (إقلاع عن عادة)
  type: HabitType;
  trackingType?: TrackingType;
  targetValue: number;
  targetPerDay?: number;
  unit?: string;
  category: HabitCategory;
  timeOfDay: TimeOfDay;
  pinned?: boolean;
  goal?: HabitGoal;
  goalFrequency?: string; // e.g. '4 / شهر'
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g. '08:00'
  restDays?: DayOfWeek[]; // Days where missing does not break streak
  streakFreezeDays?: string[]; // "YYYY-MM-DD"
  notes?: Record<string, string>; // "YYYY-MM-DD" -> note text
  createdAt: string;
  archived?: boolean;
}

// Key is Habit ID, value is dictionary of "YYYY-MM-DD" -> current logged value (number)
export type HabitLogs = Record<string, Record<string, number>>;

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate30Days: number;
  completionRateAllTime: number;
  last30DaysCount: number;
  goalProgressPercent?: number;
  goalAchieved?: boolean;
  daysRemaining?: number;
  goalTargetLabel?: string;
  habitStrengthScore?: number; // 0 - 100% smart score
  missedYesterday?: boolean; // for Two-Day Rule
}

export interface HabitBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardXP: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  title: string;
  nextLevelXP: number;
}

export interface AppExportData {
  version: string;
  exportedAt: string;
  habits: Habit[];
  logs: HabitLogs;
  theme?: 'dark' | 'light';
}

export type ActiveTab = 'habits' | 'analytics' | 'badges' | 'settings';

export interface HabitStack {
  id: string;
  title: string;
  triggerHabitId: string; // The anchor habit that starts the stack
  cueText?: string; // Optional cue, e.g. "بعد الانتهاء من..."
  habitIds: string[]; // Sequential habits to complete
  createdAt: string;
}

export interface ScientificStudy {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  institution: string;
  year: string;
  icon: string;
  color: string;
  keyTakeaway: string;
  practicalRule: string;
  detailedAnalysis: string;
  tags: string[];
}

export interface WeekdayStat {
  dayIndex: number;
  name: string;
  completionRate: number;
  completionsCount: number;
  totalOpportunities: number;
}

export interface BehavioralAnalyticsData {
  weekdayBreakdown: WeekdayStat[];
  goldenDay: WeekdayStat | null;
  criticalDay: WeekdayStat | null;
  bounceBackRate: number; // 0 - 100%
  resilienceRating: 'steel' | 'excellent' | 'moderate' | 'needs_focus';
  persona: {
    title: string;
    description: string;
    icon: string;
    badgeColor: string;
  };
  keystoneHabit: {
    habit: Habit;
    boostPercent: number;
  } | null;
}
