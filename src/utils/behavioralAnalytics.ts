import { Habit, HabitLogs, BehavioralAnalyticsData, WeekdayStat } from '../types/habit';
import { getLastNDays, parseISODate, formatDateToISO, getTodayString, getArabicMonth } from './dateUtils';
import { calculateHabitStats } from './streakUtils';

const ARABIC_WEEKDAYS_ORDERED = [
  { dayIndex: 6, name: 'السبت' },
  { dayIndex: 0, name: 'الأحد' },
  { dayIndex: 1, name: 'الاثنين' },
  { dayIndex: 2, name: 'الثلاثاء' },
  { dayIndex: 3, name: 'الأربعاء' },
  { dayIndex: 4, name: 'الخميس' },
  { dayIndex: 5, name: 'الجمعة' },
];

/**
 * Calculates deep behavioral analytics across all habits and logs.
 */
export function calculateBehavioralAnalytics(habits: Habit[], logs: HabitLogs): BehavioralAnalyticsData {
  const activeHabits = habits.filter((h) => !h.archived);
  const last60 = getLastNDays(60);

  // 1. Weekday Breakdown (السبت -> الجمعة)
  const weekdayCounts: Record<number, { completions: number; totalOpportunities: number }> = {
    0: { completions: 0, totalOpportunities: 0 },
    1: { completions: 0, totalOpportunities: 0 },
    2: { completions: 0, totalOpportunities: 0 },
    3: { completions: 0, totalOpportunities: 0 },
    4: { completions: 0, totalOpportunities: 0 },
    5: { completions: 0, totalOpportunities: 0 },
    6: { completions: 0, totalOpportunities: 0 },
  };

  for (const dateStr of last60) {
    const dObj = parseISODate(dateStr);
    const dayOfWeek = dObj.getDay();

    for (const h of activeHabits) {
      weekdayCounts[dayOfWeek].totalOpportunities++;
      const threshold = h.targetValue || h.targetPerDay || 1;
      if ((logs[h.id]?.[dateStr] || 0) >= threshold) {
        weekdayCounts[dayOfWeek].completions++;
      }
    }
  }

  const weekdayBreakdown: WeekdayStat[] = ARABIC_WEEKDAYS_ORDERED.map((w) => {
    const data = weekdayCounts[w.dayIndex];
    const rate = data.totalOpportunities > 0
      ? Math.round((data.completions / data.totalOpportunities) * 100)
      : 0;
    return {
      dayIndex: w.dayIndex,
      name: w.name,
      completionRate: rate,
      completionsCount: data.completions,
      totalOpportunities: data.totalOpportunities,
    };
  });

  // Find Golden Day & Critical Day
  const sortedDays = [...weekdayBreakdown].filter((w) => w.totalOpportunities > 0).sort(
    (a, b) => b.completionRate - a.completionRate
  );

  const goldenDay = sortedDays.length > 0 ? sortedDays[0] : null;
  const criticalDay = sortedDays.length > 1 ? sortedDays[sortedDays.length - 1] : null;

  // 2. Bounce-Back Resilience Rate (Did user recover on Day T after missing on Day T-1?)
  let totalMisses = 0;
  let bounceBackSuccesses = 0;

  for (const h of activeHabits) {
    const hLogs = logs[h.id] || {};
    const threshold = h.targetValue || h.targetPerDay || 1;

    for (let i = 0; i < last60.length - 1; i++) {
      const dayDate = last60[i]; // earlier day
      const nextDayDate = last60[i + 1]; // next chronological day

      const dayDone = (hLogs[dayDate] || 0) >= threshold;
      const nextDayDone = (hLogs[nextDayDate] || 0) >= threshold;

      if (!dayDone) {
        totalMisses++;
        if (nextDayDone) {
          bounceBackSuccesses++;
        }
      }
    }
  }

  const bounceBackRate = totalMisses > 0
    ? Math.round((bounceBackSuccesses / totalMisses) * 100)
    : 100;

  let resilienceRating: BehavioralAnalyticsData['resilienceRating'] = 'excellent';
  if (bounceBackRate >= 80) resilienceRating = 'steel';
  else if (bounceBackRate >= 60) resilienceRating = 'excellent';
  else if (bounceBackRate >= 40) resilienceRating = 'moderate';
  else resilienceRating = 'needs_focus';

  // 3. Detect Habit Persona Archetype
  let morningCount = 0;
  let eveningCount = 0;
  let fitnessHealthCount = 0;
  let mindLearningCount = 0;

  for (const h of activeHabits) {
    if (h.timeOfDay === 'morning') morningCount++;
    if (h.timeOfDay === 'evening') eveningCount++;
    if (h.category === 'fitness' || h.category === 'health') fitnessHealthCount++;
    if (h.category === 'mind' || h.category === 'learning') mindLearningCount++;
  }

  const total = Math.max(1, activeHabits.length);

  let persona = {
    title: 'صانع الروتين المتوازن',
    description: 'تمتلك توزيعاً متناغماً بين مجالات حياتك وعاداتك على مدار اليوم.',
    icon: 'compass',
    badgeColor: '#7C83FD',
  };

  if (morningCount / total >= 0.4) {
    persona = {
      title: 'المبكر الاستراتيجي',
      description: 'تبدأ يومك بتركيز عالٍ وتستثمر الساعات الذهبية الأولى في بناء مسارك.',
      icon: 'sunny',
      badgeColor: '#F39C12',
    };
  } else if (fitnessHealthCount / total >= 0.4) {
    persona = {
      title: 'المحارب الرياضي',
      description: 'تركز طاقتك الأساسية على الصحة البدنية والانضباط الجسدي والحيوي.',
      icon: 'barbell',
      badgeColor: '#E67E22',
    };
  } else if (mindLearningCount / total >= 0.4) {
    persona = {
      title: 'المفكر المتأمل',
      description: 'تولي أولوية كبرى للهدوء الذهني والقراءة وتوسيع المدارك المعرفية.',
      icon: 'leaf',
      badgeColor: '#2ECC71',
    };
  } else if (eveningCount / total >= 0.4) {
    persona = {
      title: 'المنجز الليلي',
      description: 'تصل ذروة طاقتك وهدوئك في المساء وتستثمر ساعات الليل في إتمام أهدافك.',
      icon: 'moon',
      badgeColor: '#575FCF',
    };
  }

  // 4. Keystone Habit Detection (which habit completion boosts other habits most)
  let bestKeystone: { habit: Habit; boostPercent: number } | null = null;
  let highestBoost = 0;

  if (activeHabits.length >= 2) {
    for (const cand of activeHabits) {
      const candLogs = logs[cand.id] || {};
      const candThreshold = cand.targetValue || cand.targetPerDay || 1;

      let othersCompletedWhenDone = 0;
      let othersTotalWhenDone = 0;
      let othersCompletedWhenNotDone = 0;
      let othersTotalWhenNotDone = 0;

      for (const d of last60) {
        const candDone = (candLogs[d] || 0) >= candThreshold;
        for (const other of activeHabits) {
          if (other.id === cand.id) continue;
          const otherThreshold = other.targetValue || other.targetPerDay || 1;
          const otherDone = (logs[other.id]?.[d] || 0) >= otherThreshold;

          if (candDone) {
            othersTotalWhenDone++;
            if (otherDone) othersCompletedWhenDone++;
          } else {
            othersTotalWhenNotDone++;
            if (otherDone) othersCompletedWhenNotDone++;
          }
        }
      }

      const rateWhenDone = othersTotalWhenDone > 0 ? (othersCompletedWhenDone / othersTotalWhenDone) * 100 : 0;
      const rateWhenNotDone = othersTotalWhenNotDone > 0 ? (othersCompletedWhenNotDone / othersTotalWhenNotDone) * 100 : 0;
      const boost = Math.round(rateWhenDone - rateWhenNotDone);

      if (boost > highestBoost && boost > 10) {
        highestBoost = boost;
        bestKeystone = { habit: cand, boostPercent: boost };
      }
    }
  }

  return {
    weekdayBreakdown,
    goldenDay,
    criticalDay,
    bounceBackRate,
    resilienceRating,
    persona,
    keystoneHabit: bestKeystone,
  };
}

/**
 * Predicts the calendar date when a habit's custom goal will be completed based on 30-day velocity.
 */
export function predictGoalCompletionDate(habit: Habit, logs: HabitLogs): { estimatedDateStr: string; daysNeeded: number } | null {
  if (!habit.goal) return null;

  const stats = calculateHabitStats(habit, logs);
  if (stats.goalAchieved || stats.daysRemaining === undefined || stats.daysRemaining <= 0) {
    return null;
  }

  // Average daily completion rate in last 30 days
  const last30Count = stats.last30DaysCount;
  if (last30Count <= 0) return null;

  const completionsPerDay = last30Count / 30;
  const daysNeeded = Math.ceil(stats.daysRemaining / completionsPerDay);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysNeeded);

  const y = targetDate.getFullYear();
  const mName = getArabicMonth(targetDate.getMonth());
  const d = targetDate.getDate();

  return {
    estimatedDateStr: `${d} ${mName} ${y}`,
    daysNeeded,
  };
}
