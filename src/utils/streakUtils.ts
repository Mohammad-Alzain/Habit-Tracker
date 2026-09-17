import { Habit, HabitLogs, HabitStats } from '../types/habit';
import { formatDateToISO, getTodayString, parseISODate, getLastNDays } from './dateUtils';

/**
 * Calculates current streak, longest streak, completion statistics, and goal progress for a habit.
 */
export function calculateHabitStats(habit: Habit, logs: HabitLogs): HabitStats {
  const habitLogs = logs[habit.id] || {};
  const todayStr = getTodayString();
  const todayDate = parseISODate(todayStr);
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;

  // Check completions for all days backwards from today with Streak Freeze protection
  let currentStreak = 0;
  let checkDate = new Date(todayDate);
  const frozenSet = new Set(habit.streakFreezeDays || []);

  const todayCompleted = (habitLogs[todayStr] || 0) >= targetThreshold;
  const todayFrozen = frozenSet.has(todayStr);

  if (!todayCompleted && !todayFrozen) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = formatDateToISO(checkDate);
    const count = habitLogs[dStr] || 0;
    const isFrozen = frozenSet.has(dStr);

    if (count >= targetThreshold) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (isFrozen) {
      // Day is protected by freeze - streak doesn't increase but doesn't break
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Longest Streak
  const validDates = Object.keys(habitLogs)
    .filter((d) => (habitLogs[d] || 0) >= targetThreshold)
    .concat(habit.streakFreezeDays || []);
  const completedDates = Array.from(new Set(validDates)).sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of completedDates) {
    const currDate = parseISODate(dateStr);
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    prevDate = currDate;
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Total completions
  const totalCompletions = completedDates.length;

  // Last 30 days
  const last30 = getLastNDays(30);
  let last30DaysCount = 0;
  for (const day of last30) {
    if ((habitLogs[day] || 0) >= targetThreshold) {
      last30DaysCount++;
    }
  }
  const completionRate30Days = Math.round((last30DaysCount / 30) * 100);

  // All time completion rate
  const createdDate = parseISODate(habit.createdAt.split('T')[0] || todayStr);
  const diffAllTime = Math.max(1, Math.round((todayDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)) + 1);
  const completionRateAllTime = Math.min(100, Math.round((totalCompletions / diffAllTime) * 100));

  // Goal Progress Calculation
  let goalProgressPercent: number | undefined = undefined;
  let goalAchieved = false;
  let daysRemaining: number | undefined = undefined;
  let goalTargetLabel: string | undefined = undefined;

  if (habit.goal) {
    const { type, targetValue } = habit.goal;
    if (type === 'days') {
      goalTargetLabel = `${totalCompletions} / ${targetValue} يوماً`;
      daysRemaining = Math.max(0, targetValue - totalCompletions);
      goalAchieved = totalCompletions >= targetValue;
      goalProgressPercent = Math.min(100, Math.round((totalCompletions / targetValue) * 100));
    } else if (type === 'months') {
      const targetDays = targetValue * 30;
      const monthsElapsed = Math.min(targetValue, Math.round((totalCompletions / 30) * 10) / 10);
      goalTargetLabel = `${monthsElapsed} / ${targetValue} أشهر`;
      daysRemaining = Math.max(0, targetDays - totalCompletions);
      goalAchieved = totalCompletions >= targetDays;
      goalProgressPercent = Math.min(100, Math.round((totalCompletions / targetDays) * 100));
    } else if (type === 'streak') {
      const current = Math.max(currentStreak, longestStreak);
      goalTargetLabel = `${current} / ${targetValue} يوم ستريك`;
      daysRemaining = Math.max(0, targetValue - current);
      goalAchieved = current >= targetValue;
      goalProgressPercent = Math.min(100, Math.round((current / targetValue) * 100));
    } else if (type === 'total_count') {
      goalTargetLabel = `${totalCompletions} / ${targetValue}`;
      daysRemaining = Math.max(0, targetValue - totalCompletions);
      goalAchieved = totalCompletions >= targetValue;
      goalProgressPercent = Math.min(100, Math.round((totalCompletions / targetValue) * 100));
    } else if (type === 'frequency') {
      goalTargetLabel = `${last30DaysCount} / ${targetValue} هذا الشهر`;
      goalAchieved = last30DaysCount >= targetValue;
      goalProgressPercent = Math.min(100, Math.round((last30DaysCount / targetValue) * 100));
    }
  } else if (habit.goalFrequency) {
    const match = habit.goalFrequency.match(/\d+/);
    const freqNum = match ? parseInt(match[0], 10) : 4;
    goalTargetLabel = `${last30DaysCount} / ${freqNum} شهرياً`;
    goalAchieved = last30DaysCount >= freqNum;
    goalProgressPercent = Math.min(100, Math.round((last30DaysCount / Math.max(1, freqNum)) * 100));
    daysRemaining = Math.max(0, freqNum - last30DaysCount);
  }

  // Habit Strength Score (Exponential Moving Average decay model)
  const last60 = getLastNDays(60);
  let weightSum = 0;
  let scoreSum = 0;
  for (let i = 0; i < last60.length; i++) {
    const day = last60[i];
    const weight = Math.pow(0.96, i); // Recent days have exponentially higher weight
    weightSum += weight;
    if ((habitLogs[day] || 0) >= targetThreshold) {
      scoreSum += weight;
    }
  }
  const habitStrengthScore = weightSum > 0 ? Math.round((scoreSum / weightSum) * 100) : 0;

  // Two-Day Rule (Atomic Habits) - Did the user miss yesterday?
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterdayDate);
  const yesterdayCompleted = (habitLogs[yesterdayStr] || 0) >= targetThreshold;
  const missedYesterday = !yesterdayCompleted && !todayCompleted;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate30Days,
    completionRateAllTime,
    last30DaysCount,
    goalProgressPercent,
    goalAchieved,
    daysRemaining,
    goalTargetLabel,
    habitStrengthScore,
    missedYesterday,
  };
}

export function calculateGlobalStats(habits: Habit[], logs: HabitLogs) {
  const activeHabits = habits.filter((h) => !h.archived);
  let totalCompletionsAll = 0;
  let bestStreakAll = 0;
  let bestHabit: Habit | null = null;

  const todayStr = getTodayString();
  let todayCompletedCount = 0;

  const weekdayDistribution = [0, 0, 0, 0, 0, 0, 0];

  for (const habit of activeHabits) {
    const stats = calculateHabitStats(habit, logs);
    totalCompletionsAll += stats.totalCompletions;
    if (stats.longestStreak > bestStreakAll) {
      bestStreakAll = stats.longestStreak;
      bestHabit = habit;
    }

    const habitLogs = logs[habit.id] || {};
    const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
    if ((habitLogs[todayStr] || 0) >= targetThreshold) {
      todayCompletedCount++;
    }

    for (const dStr of Object.keys(habitLogs)) {
      if ((habitLogs[dStr] || 0) >= targetThreshold) {
        const d = parseISODate(dStr);
        weekdayDistribution[d.getDay()]++;
      }
    }
  }

  const todayCompletionRate = activeHabits.length > 0
    ? Math.round((todayCompletedCount / activeHabits.length) * 100)
    : 0;

  return {
    totalHabits: activeHabits.length,
    todayCompletedCount,
    todayCompletionRate,
    totalCompletionsAll,
    bestStreakAll,
    bestHabit,
    weekdayDistribution,
  };
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  targetCount: number;
  currentCount: number;
  unlocked: boolean;
  category: 'streak' | 'total' | 'consistency' | 'mastery';
}

export function calculateMilestones(habits: Habit[], logs: HabitLogs): MilestoneBadge[] {
  const global = calculateGlobalStats(habits, logs);
  const activeHabits = habits.filter((h) => !h.archived);

  // Max total completions for any single habit
  let maxSingleHabitTotal = 0;
  let anyGoalAchieved = false;

  for (const h of activeHabits) {
    const s = calculateHabitStats(h, logs);
    if (s.totalCompletions > maxSingleHabitTotal) {
      maxSingleHabitTotal = s.totalCompletions;
    }
    if (s.goalAchieved) {
      anyGoalAchieved = true;
    }
  }

  // Calculate max completions on any single calendar day
  const dayCounts: Record<string, number> = {};
  for (const h of activeHabits) {
    const hLogs = logs[h.id] || {};
    const threshold = h.targetValue || h.targetPerDay || 1;
    for (const dStr of Object.keys(hLogs)) {
      if ((hLogs[dStr] || 0) >= threshold) {
        dayCounts[dStr] = (dayCounts[dStr] || 0) + 1;
      }
    }
  }
  let maxCompletionsInOneDay = 0;
  for (const count of Object.values(dayCounts)) {
    if (count > maxCompletionsInOneDay) {
      maxCompletionsInOneDay = count;
    }
  }

  return [
    {
      id: 'first_step',
      title: 'أول خطوة 🌟',
      description: 'إكمال أول عادة وتسجيل أول إنجاز لك في التطبيق',
      icon: 'sparkles',
      color: '#F1C40F',
      targetCount: 1,
      currentCount: Math.min(1, global.totalCompletionsAll),
      unlocked: global.totalCompletionsAll >= 1,
      category: 'total',
    },
    {
      id: 'week_warrior',
      title: 'شعلة الأسبوع 🔥',
      description: 'المحافظة على ستريك 7 أيام متواصلة في أي عادة',
      icon: 'flame',
      color: '#E67E22',
      targetCount: 7,
      currentCount: Math.min(7, global.bestStreakAll),
      unlocked: global.bestStreakAll >= 7,
      category: 'streak',
    },
    {
      id: 'habit_formed',
      title: 'ترسيخ أولي ⚡',
      description: 'الاستمرار 21 يوماً متواصلة (المرحلة الأولى في بناء مسار العادة)',
      icon: 'flash',
      color: '#7C83FD',
      targetCount: 21,
      currentCount: Math.min(21, global.bestStreakAll),
      unlocked: global.bestStreakAll >= 21,
      category: 'streak',
    },
    {
      id: 'neuro_wiring',
      title: 'المسار العصبي 🧠',
      description: 'الوصول لـ 66 يوماً (المتوسط العلمي الدقيق لترسيخ العادة التلقائية)',
      icon: 'bulb',
      color: '#9B59B6',
      targetCount: 66,
      currentCount: Math.min(66, global.bestStreakAll),
      unlocked: global.bestStreakAll >= 66,
      category: 'streak',
    },
    {
      id: 'century_club',
      title: 'نادي المئة 💯',
      description: 'تسجيل 100 إنجاز في عادة واحدة وتحقيق الاستدامة الحقيقية',
      icon: 'trophy',
      color: '#00CEC9',
      targetCount: 100,
      currentCount: Math.min(100, maxSingleHabitTotal),
      unlocked: maxSingleHabitTotal >= 100,
      category: 'mastery',
    },
    {
      id: 'daily_master',
      title: 'سيد الروتين 🎯',
      description: 'إنجاز 5 عادات مختلفة بنجاح في نفس اليوم',
      icon: 'checkmark-done-circle',
      color: '#2ECC71',
      targetCount: 5,
      currentCount: Math.min(5, maxCompletionsInOneDay),
      unlocked: maxCompletionsInOneDay >= 5,
      category: 'consistency',
    },
    {
      id: 'goal_crusher',
      title: 'قاهر الأهداف 🏁',
      description: 'تحقيق هدف العادة المخصص بالكامل بنسبة 100%',
      icon: 'ribbon',
      color: '#E056FD',
      targetCount: 1,
      currentCount: anyGoalAchieved ? 1 : 0,
      unlocked: anyGoalAchieved,
      category: 'mastery',
    },
    {
      id: 'titan_routine',
      title: 'الدرع الذهبي 🛡️',
      description: 'تسجيل 200 إنجاز إجمالي تراكمي عبر جميع عاداتك',
      icon: 'shield-checkmark',
      color: '#FF7675',
      targetCount: 200,
      currentCount: Math.min(200, global.totalCompletionsAll),
      unlocked: global.totalCompletionsAll >= 200,
      category: 'total',
    },
  ];
}
