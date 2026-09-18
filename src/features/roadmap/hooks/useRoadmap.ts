import { useMemo } from 'react';
import { Habit, HabitLogs, SubTaskLogs, DayOfWeek } from '../../../types/habit';
import {
  getTodayString,
  getRoadmapDays,
  parseISODate,
  getArabicDayShort,
  getArabicMonth,
} from '../../../utils/dateUtils';
import { isHabitScheduledForDay, getScheduledSubTasksForDay } from '../../../utils/habitScheduleUtils';
import { AppLanguage } from '../../../utils/i18n';

export interface RoadmapDayItem {
  dateStr: string;
  dayNum: number;
  dayName: string;
  monthName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  dayOfWeek: DayOfWeek;
}

export function useRoadmap(
  habits: Habit[],
  logs: HabitLogs,
  subTaskLogs: SubTaskLogs,
  language: AppLanguage = 'ar'
) {
  const todayStr = getTodayString();
  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

  // Generate 16 days: 1 day past, today, and 14 days future
  const days: RoadmapDayItem[] = useMemo(() => {
    const rawDateStrings = getRoadmapDays(1, 14);
    return rawDateStrings.map((dateStr) => {
      const parsed = parseISODate(dateStr);
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const dayNum = parsed.getDate();
      const dayOfWeek = parsed.getDay() as DayOfWeek;
      const dayName = getArabicDayShort(dayOfWeek);
      const monthName = getArabicMonth(parsed.getMonth());

      return {
        dateStr,
        dayNum,
        dayName,
        monthName,
        isToday,
        isPast,
        isFuture,
        dayOfWeek,
      };
    });
  }, [todayStr]);

  const todayIndex = useMemo(() => {
    const idx = days.findIndex((d) => d.isToday);
    return idx >= 0 ? idx : 0;
  }, [days]);

  // Today's total scheduled subtasks vs completed
  const todayStats = useMemo(() => {
    const todayItem = days.find((d) => d.isToday);
    if (!todayItem) return { total: 0, done: 0, percent: 0 };

    let total = 0;
    let done = 0;

    for (const habit of activeHabits) {
      if (!isHabitScheduledForDay(habit, todayItem.dayOfWeek)) {
        continue;
      }

      const scheduled = getScheduledSubTasksForDay(habit, todayItem.dayOfWeek);

      if (habit.subTasks && habit.subTasks.length > 0) {
        if (scheduled.length > 0) {
          total += scheduled.length;
          const compIds = subTaskLogs[habit.id]?.[todayStr] || [];
          for (const st of scheduled) {
            if (compIds.includes(st.id)) done++;
          }
        }
      } else {
        total += 1;
        const target = habit.targetValue || habit.targetPerDay || 1;
        if ((logs[habit.id]?.[todayStr] || 0) >= target) done++;
      }
    }

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  }, [activeHabits, days, logs, subTaskLogs, todayStr]);

  const isFutureDay = (dateStr: string) => dateStr > todayStr;

  return {
    todayStr,
    activeHabits,
    days,
    todayIndex,
    todayStats,
    isFutureDay,
  };
}
