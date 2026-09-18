import { Habit, HabitLogs, HabitBadge, GamificationState } from '../types/habit';
import { calculateHabitStats } from './streakUtils';
import { getTodayString } from './dateUtils';

export function calculateGamification(habits: Habit[], logs: HabitLogs): {
  state: GamificationState;
  badges: HabitBadge[];
} {
  let totalCompletions = 0;
  let maxStreak = 0;
  const todayStr = getTodayString();
  let todayCompleted = 0;
  let timerCompletions = 0;
  let waterCompletions = 0;

  for (const habit of habits) {
    const stats = calculateHabitStats(habit, logs);
    totalCompletions += stats.totalCompletions;
    if (stats.longestStreak > maxStreak) {
      maxStreak = stats.longestStreak;
    }
    const habitLogs = logs[habit.id] || {};
    if ((habitLogs[todayStr] || 0) >= (habit.targetValue || 1)) {
      todayCompleted++;
    }
    if (habit.type === 'timer') {
      timerCompletions += stats.totalCompletions;
    }
    if (habit.category === 'health' || habit.name.includes('ماء')) {
      waterCompletions += stats.totalCompletions;
    }
  }

  const allCompletedToday = habits.length > 0 && todayCompleted === habits.length;

  const badges: HabitBadge[] = [
    {
      id: 'b-first',
      title: 'الخطوة الأولى',
      description: 'أكملت أول إنجاز لك في التطبيق',
      icon: 'sparkles',
      color: '#06B6D4',
      unlocked: totalCompletions >= 1,
      progress: Math.min(1, totalCompletions),
      maxProgress: 1,
      rewardXP: 100,
    },
    {
      id: 'b-week',
      title: 'الأسبوع الفولاذي',
      description: 'حققت ستريك 7 أيام متتالية في أي عادة',
      icon: 'flame',
      color: '#F59E0B',
      unlocked: maxStreak >= 7,
      progress: Math.min(7, maxStreak),
      maxProgress: 7,
      rewardXP: 250,
    },
    {
      id: 'b-month',
      title: 'بطل الشهر',
      description: 'استمريت لـ 30 يوماً متواصلاً دون انقطاع',
      icon: 'trophy',
      color: '#10B981',
      unlocked: maxStreak >= 30,
      progress: Math.min(30, maxStreak),
      maxProgress: 30,
      rewardXP: 600,
    },
    {
      id: 'b-century',
      title: 'نادي المائة',
      description: 'أنجزت 100 عادة إجمالياً',
      icon: 'ribbon',
      color: '#8B5CF6',
      unlocked: totalCompletions >= 100,
      progress: Math.min(100, totalCompletions),
      maxProgress: 100,
      rewardXP: 800,
    },
    {
      id: 'b-perfect-day',
      title: 'يوم الإنتاجية الخارقة',
      description: 'أنجزت جميع عاداتك المحددة لليوم بنسبة 100%',
      icon: 'flash',
      color: '#EC4899',
      unlocked: allCompletedToday,
      progress: allCompletedToday ? 1 : 0,
      maxProgress: 1,
      rewardXP: 200,
    },
    {
      id: 'b-focus',
      title: 'سيد التركيز',
      description: 'أكملت 5 جلسات مؤقت تركيز بنجاح',
      icon: 'timer',
      color: '#3B82F6',
      unlocked: timerCompletions >= 5,
      progress: Math.min(5, timerCompletions),
      maxProgress: 5,
      rewardXP: 300,
    },
  ];

  // Calculate total XP: 10 XP per completion + badges XP
  let totalXP = totalCompletions * 15;
  for (const b of badges) {
    if (b.unlocked) {
      totalXP += b.rewardXP;
    }
  }

  // Level thresholds
  const levelThresholds = [0, 300, 800, 1600, 3000, 6000];
  const levelTitles = [
    'مبتدئ العادات',
    'ممارس ملتزم',
    'محارب الانضباط',
    'سيد العادات',
    'أسطورة الإتقان',
  ];

  let level = 1;
  let nextLevelXP = 300;
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalXP >= levelThresholds[i]) {
      level = i + 1;
      nextLevelXP = levelThresholds[i + 1] || levelThresholds[i] * 1.5;
      break;
    }
  }

  const title = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  return {
    state: {
      xp: totalXP,
      level,
      title,
      nextLevelXP,
    },
    badges,
  };
}
