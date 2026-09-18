import { Habit, DayOfWeek, HabitSubTask } from '../types/habit';

/**
 * Checks if a habit is scheduled to be performed on a given day of the week.
 * @param habit The habit to evaluate
 * @param dayOfWeek 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
 */
export function isHabitScheduledForDay(habit: Habit, dayOfWeek: DayOfWeek): boolean {
  if (habit.archived) return false;

  // If customDays array exists and has defined days, strictly check inclusion
  if (Array.isArray(habit.customDays) && habit.customDays.length > 0) {
    return habit.customDays.includes(dayOfWeek);
  }

  // If frequency is custom but customDays is empty
  if (habit.frequency === 'custom' && Array.isArray(habit.customDays)) {
    return habit.customDays.includes(dayOfWeek);
  }

  // By default (daily or unspecified), the habit runs every day
  return true;
}

/**
 * Filters the habit's subtasks that are scheduled on a given day of the week.
 * Returns an empty array if the parent habit itself is not scheduled on this day.
 */
export function getScheduledSubTasksForDay(habit: Habit, dayOfWeek: DayOfWeek): HabitSubTask[] {
  if (!isHabitScheduledForDay(habit, dayOfWeek)) {
    return [];
  }

  const subTasks = habit.subTasks || [];
  return subTasks.filter((st) => {
    if (!st.scheduleDays || st.scheduleDays === 'all') return true;
    return Array.isArray(st.scheduleDays) && st.scheduleDays.includes(dayOfWeek);
  });
}

/**
 * Determines whether a habit should appear in the roadmap for a given day.
 * 1. The parent habit must be scheduled for this day (isHabitScheduledForDay).
 * 2. If the habit has subtasks defined, at least one subtask must be scheduled for this day.
 * 3. If the habit has no subtasks, the habit itself is the standalone commitment.
 */
export function isHabitActiveInRoadmapOnDay(habit: Habit, dayOfWeek: DayOfWeek): boolean {
  if (!isHabitScheduledForDay(habit, dayOfWeek)) {
    return false;
  }

  // If habit has sub-tasks defined, it only appears on days where at least one sub-task is scheduled
  if (habit.subTasks && habit.subTasks.length > 0) {
    const scheduled = getScheduledSubTasksForDay(habit, dayOfWeek);
    return scheduled.length > 0;
  }

  // Standalone habit without subtasks is active whenever scheduled
  return true;
}
