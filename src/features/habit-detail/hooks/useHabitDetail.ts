import { useState, useEffect, useMemo } from 'react';
import { Habit, HabitLogs } from '../../../types/habit';
import { calculateHabitStats, isHabitDaySuccessful } from '../../../utils/streakUtils';
import {
  getTodayString,
  getCachedMonthDays,
  getCached22WeekColumns,
  getArabicMonth,
} from '../../../utils/dateUtils';
import { hapticService } from '../../../services/hapticService';

export function useHabitDetail(
  habit: Habit | null,
  logs: HabitLogs,
  onSaveNote?: (habitId: string, dateStr: string, noteText: string) => void
) {
  const todayStr = getTodayString();
  const habitLogs = habit ? logs[habit.id] || {} : {};
  const targetThreshold = habit?.targetValue || habit?.targetPerDay || 1;

  // Selected date for note viewing/editing
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [noteInputVisible, setNoteInputVisible] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Month navigation offset (0 = current month, 1 = previous month, etc.)
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthOffset);
    return d;
  }, [monthOffset]);

  const currentYear = targetDate.getFullYear();
  const currentMonthIndex = targetDate.getMonth();
  const currentMonthLabel = `${getArabicMonth(currentMonthIndex)} ${currentYear}`;

  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  // Streak freeze optimistic local state for instantaneous 0ms calendar reactivity
  const [localFrozenDays, setLocalFrozenDays] = useState<string[]>(habit?.streakFreezeDays || []);

  useEffect(() => {
    setLocalFrozenDays(habit?.streakFreezeDays || []);
  }, [habit?.streakFreezeDays]);

  const frozenDaysSet = useMemo(() => new Set(localFrozenDays), [localFrozenDays]);

  const monthDays = useMemo(() => {
    const cachedDays = getCachedMonthDays(currentYear, currentMonthIndex);
    return cachedDays.map((d) => {
      const val = habitLogs[d.dateStr] || 0;
      const isSlip = habit?.mode === 'quit' && (val === -1 || (habit.type === 'numeric' && val > targetThreshold));
      const isCompleted = habit ? isHabitDaySuccessful(habit, val) : val >= targetThreshold;

      return {
        dateStr: d.dateStr,
        dayNum: d.dayNum,
        isCompleted,
        isSlip,
        isToday: d.dateStr === todayStr,
        isPast: d.dateStr < todayStr,
        isFuture: d.dateStr > todayStr,
        isFrozen: frozenDaysSet.has(d.dateStr),
      };
    });
  }, [currentYear, currentMonthIndex, habit, habitLogs, targetThreshold, todayStr, frozenDaysSet]);

  // Strip 22-week matrix
  const matrixCols = useMemo(() => {
    const rawCols = getCached22WeekColumns();
    return rawCols.map((col) =>
      col.map((dateStr) => {
        const val = habitLogs[dateStr] || 0;
        const isSlip = habit?.mode === 'quit' && (val === -1 || (habit.type === 'numeric' && val > targetThreshold));
        const isCompleted = habit ? isHabitDaySuccessful(habit, val) : val >= targetThreshold;

        return {
          dateStr,
          isCompleted,
          isSlip,
          isToday: dateStr === todayStr,
          isFuture: dateStr > todayStr,
          isFrozen: frozenDaysSet.has(dateStr),
        };
      })
    );
  }, [habit, habitLogs, targetThreshold, todayStr, frozenDaysSet]);

  const stats = useMemo(() => {
    if (!habit) return null;
    return calculateHabitStats(habit, logs);
  }, [habit, logs]);

  const [localNotes, setLocalNotes] = useState<Record<string, string>>(habit?.notes || {});

  useEffect(() => {
    setLocalNotes(habit?.notes || {});
  }, [habit?.notes]);

  const handleOpenNote = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const existing = localNotes[dateStr] || habit?.notes?.[dateStr] || '';
    setNoteText(existing);
    setNoteInputVisible(true);
  };

  const handleSaveNoteSubmit = () => {
    if (habit && onSaveNote) {
      onSaveNote(habit.id, selectedDateStr, noteText);
    }
    setLocalNotes((prev) => ({
      ...prev,
      [selectedDateStr]: noteText.trim(),
    }));
    hapticService.success();
    setNoteInputVisible(false);
  };

  const isSelectedDateFrozen = frozenDaysSet.has(selectedDateStr);

  return {
    todayStr,
    stats,
    selectedDateStr,
    setSelectedDateStr,
    noteInputVisible,
    setNoteInputVisible,
    noteText,
    setNoteText,
    monthOffset,
    setMonthOffset,
    currentMonthLabel,
    firstDayOfWeek,
    monthDays,
    matrixCols,
    localFrozenDays,
    setLocalFrozenDays,
    isSelectedDateFrozen,
    localNotes,
    handleOpenNote,
    handleSaveNoteSubmit,
  };
}
