import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLogs, SubTaskLogs, HabitSubTask, DayOfWeek, AppExportData, ViewMode, HabitStack } from '../types/habit';
import { getInitialSampleData } from '../constants/presets';
import { getTodayString, parseISODate } from '../utils/dateUtils';
import { NotificationService } from '../services/notificationService';

const STORAGE_KEY_HABITS = '@habitflow_habits_v3';
const STORAGE_KEY_LOGS = '@habitflow_logs_v3';
const STORAGE_KEY_SUBTASK_LOGS = '@habitflow_subtask_logs_v3';
const STORAGE_KEY_THEME = '@habitflow_theme_v3';
const STORAGE_KEY_VIEW = '@habitflow_view_v3';
const STORAGE_KEY_SETTINGS = '@habitflow_settings_v3';
const STORAGE_KEY_STACKS = '@habitflow_stacks_v3';

export interface AppSettings {
  startOfWeek: 'sunday' | 'monday';
  hapticFeedback: boolean;
  soundEffects: boolean;
  confirmDelete: boolean;
  dailyRemindersEnabled: boolean;
  morningReminderTime: string;
  eveningReminderTime: string;
  reminderText: string;
  language: 'ar' | 'en';
  themePalette: 'default' | 'oled';
  sortOrder: 'newest' | 'oldest' | 'name' | 'streak';
  proUnlocked: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  startOfWeek: 'sunday',
  hapticFeedback: true,
  soundEffects: true,
  confirmDelete: true,
  dailyRemindersEnabled: true,
  morningReminderTime: '09:00',
  eveningReminderTime: '21:00',
  reminderText: 'حان وقت إنجاز وتلوين عاداتك اليومية!',
  language: 'ar',
  themePalette: 'default',
  sortOrder: 'newest',
  proUnlocked: true,
};

export interface StoreState {
  habits: Habit[];
  logs: HabitLogs;
  subTaskLogs: SubTaskLogs;
  stacks: HabitStack[];
  themeMode: 'dark' | 'light';
  viewMode: ViewMode;
  settings: AppSettings;
  isLoaded: boolean;
}

let state: StoreState = {
  habits: [],
  logs: {},
  subTaskLogs: {},
  stacks: [],
  themeMode: 'dark',
  viewMode: 'heatmap',
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

// Debounced background persistence to guarantee 120fps UI response without disk I/O lag
let persistTimer: any = null;

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEY_HABITS, JSON.stringify(state.habits)],
        [STORAGE_KEY_LOGS, JSON.stringify(state.logs)],
        [STORAGE_KEY_SUBTASK_LOGS, JSON.stringify(state.subTaskLogs)],
        [STORAGE_KEY_THEME, state.themeMode],
        [STORAGE_KEY_VIEW, state.viewMode],
        [STORAGE_KEY_SETTINGS, JSON.stringify(state.settings)],
        [STORAGE_KEY_STACKS, JSON.stringify(state.stacks)],
      ]);
    } catch (e) {
      console.error('Failed to persist habits state', e);
    }
  }, 500);
}

export const habitStore = {
  getSnapshot(): StoreState {
    return state;
  },

  getState(): StoreState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async init(): Promise<void> {
    try {
      const results = await AsyncStorage.multiGet([
        STORAGE_KEY_HABITS,
        STORAGE_KEY_LOGS,
        STORAGE_KEY_THEME,
        STORAGE_KEY_VIEW,
        STORAGE_KEY_SETTINGS,
        STORAGE_KEY_STACKS,
        STORAGE_KEY_SUBTASK_LOGS,
      ]);

      const savedHabitsStr = results[0][1];
      const savedLogsStr = results[1][1];
      const savedTheme = results[2][1] as 'dark' | 'light' | null;
      const savedView = results[3][1] as ViewMode | null;
      const savedSettingsStr = results[4][1];
      const savedStacksStr = results[5][1];
      const savedSubTaskLogsStr = results[6][1];

      let parsedSettings: AppSettings = DEFAULT_SETTINGS;
      if (savedSettingsStr) {
        try {
          parsedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettingsStr) };
        } catch {
          parsedSettings = DEFAULT_SETTINGS;
        }
      }

      let parsedStacks: HabitStack[] = [];
      if (savedStacksStr) {
        try {
          parsedStacks = JSON.parse(savedStacksStr);
        } catch {
          parsedStacks = [];
        }
      }

      let parsedSubTaskLogs: SubTaskLogs = {};
      if (savedSubTaskLogsStr) {
        try {
          parsedSubTaskLogs = JSON.parse(savedSubTaskLogsStr);
        } catch {
          parsedSubTaskLogs = {};
        }
      }

      const sampleData = getInitialSampleData();

      if (savedHabitsStr && savedLogsStr) {
        let loadedHabits: Habit[] = JSON.parse(savedHabitsStr);
        // Backfill presets' subTasks if old storage lacked them
        loadedHabits = loadedHabits.map((h) => {
          if (!h.subTasks || h.subTasks.length === 0) {
            const match = sampleData.habits.find((p) => p.id === h.id || p.name.toLowerCase() === h.name.toLowerCase());
            if (match?.subTasks) {
              return { ...h, subTasks: match.subTasks };
            }
          }
          return h;
        });

        state = {
          ...state,
          habits: loadedHabits,
          logs: JSON.parse(savedLogsStr),
          subTaskLogs: parsedSubTaskLogs,
          stacks: parsedStacks,
          themeMode: savedTheme === 'light' ? 'light' : 'dark',
          viewMode: savedView || 'heatmap',
          settings: parsedSettings,
          isLoaded: true,
        };
      } else {
        state = {
          ...state,
          habits: sampleData.habits,
          logs: sampleData.logs,
          subTaskLogs: parsedSubTaskLogs,
          stacks: parsedStacks,
          themeMode: savedTheme === 'light' ? 'light' : 'dark',
          viewMode: 'heatmap',
          settings: parsedSettings,
          isLoaded: true,
        };
        schedulePersist();
      }
    } catch (e) {
      console.error('Failed to load storage, initializing with defaults', e);
      const { habits, logs } = getInitialSampleData();
      state = {
        ...state,
        habits,
        logs,
        subTaskLogs: {},
        stacks: [],
        themeMode: 'dark',
        viewMode: 'heatmap',
        settings: DEFAULT_SETTINGS,
        isLoaded: true,
      };
    }
    emitChange();
    NotificationService.init().then(() => {
      NotificationService.syncAllHabitReminders(state.habits);
    });
  },

  setViewMode(viewMode: ViewMode): void {
    state = { ...state, viewMode };
    emitChange();
    schedulePersist();
  },

  addHabit(newHabit: Omit<Habit, 'id' | 'createdAt'>): Habit {
    const habit: Habit = {
      ...newHabit,
      id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    state = {
      ...state,
      habits: [habit, ...state.habits],
      logs: {
        ...state.logs,
        [habit.id]: {},
      },
    };
    emitChange();
    schedulePersist();
    NotificationService.scheduleHabitReminder(habit);
    return habit;
  },

  updateHabit(updatedHabit: Habit): void {
    state = {
      ...state,
      habits: state.habits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)),
    };
    emitChange();
    schedulePersist();
    NotificationService.scheduleHabitReminder(updatedHabit);
  },

  togglePinHabit(habitId: string): void {
    state = {
      ...state,
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, pinned: !h.pinned } : h
      ),
    };
    emitChange();
    schedulePersist();
  },

  deleteHabit(habitId: string): void {
    const newLogs = { ...state.logs };
    delete newLogs[habitId];

    const newSubTaskLogs = { ...state.subTaskLogs };
    delete newSubTaskLogs[habitId];

    state = {
      ...state,
      habits: state.habits.filter((h) => h.id !== habitId),
      logs: newLogs,
      subTaskLogs: newSubTaskLogs,
    };
    emitChange();
    schedulePersist();
    NotificationService.cancelHabitReminder(habitId);
  },

  /**
   * Updates habits ordering (Drag and Drop / custom sort)
   */
  reorderHabits(newHabits: Habit[]): void {
    // Preserve any archived habits that might not be in the reordered active list
    const activeIds = new Set(newHabits.map((h) => h.id));
    const archivedHabits = state.habits.filter((h) => !activeIds.has(h.id));

    state = {
      ...state,
      habits: [...newHabits, ...archivedHabits],
    };
    emitChange();
    schedulePersist();
  },

  /**
   * Toggles habit completion with 0ms instantaneous UI update
   * Automatically updates sub-tasks for that day if present
   */
  toggleHabitDay(habitId: string, dateStr: string = getTodayString()): boolean {
    const habit = state.habits.find((h) => h.id === habitId);
    const target = habit?.targetValue || habit?.targetPerDay || 1;
    const currentHabitLogs = { ...(state.logs[habitId] || {}) };
    const currentCount = currentHabitLogs[dateStr] || 0;

    const isQuit = habit?.mode === 'quit';
    const isNowCompleted = isQuit ? currentCount <= 0 : currentCount < target;
    if (isNowCompleted) {
      currentHabitLogs[dateStr] = isQuit ? 1 : target;
    } else {
      delete currentHabitLogs[dateStr];
    }

    // Sync sub-tasks for this day
    const updatedSubTaskLogs = { ...state.subTaskLogs };
    if (habit?.subTasks && habit.subTasks.length > 0) {
      const dayOfWeek = parseISODate(dateStr).getDay() as DayOfWeek;
      const scheduledSubTasks = habit.subTasks.filter((st) => {
        if (!st.scheduleDays || st.scheduleDays === 'all') return true;
        return Array.isArray(st.scheduleDays) && st.scheduleDays.includes(dayOfWeek);
      });

      const habitSubDayLogs = { ...(updatedSubTaskLogs[habitId] || {}) };
      if (isNowCompleted) {
        habitSubDayLogs[dateStr] = scheduledSubTasks.map((st) => st.id);
      } else {
        delete habitSubDayLogs[dateStr];
      }
      updatedSubTaskLogs[habitId] = habitSubDayLogs;
    }

    state = {
      ...state,
      logs: {
        ...state.logs,
        [habitId]: currentHabitLogs,
      },
      subTaskLogs: updatedSubTaskLogs,
    };
    emitChange();
    schedulePersist();
    return isNowCompleted;
  },

  /**
   * Toggles a single sub-task commitment for a habit on a given date.
   * If all scheduled subtasks for that day become completed, parent habit is marked done!
   */
  toggleSubTask(habitId: string, subTaskId: string, dateStr: string = getTodayString()): boolean {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return false;

    const currentCompleted = state.subTaskLogs[habitId]?.[dateStr] || [];
    const isAlreadyCompleted = currentCompleted.includes(subTaskId);
    const updatedCompleted = isAlreadyCompleted
      ? currentCompleted.filter((id) => id !== subTaskId)
      : [...currentCompleted, subTaskId];

    const updatedSubTaskLogs = {
      ...state.subTaskLogs,
      [habitId]: {
        ...(state.subTaskLogs[habitId] || {}),
        [dateStr]: updatedCompleted,
      },
    };

    // Check if all scheduled subtasks for this day are completed
    const dayOfWeek = parseISODate(dateStr).getDay() as DayOfWeek;
    const scheduledSubTasks = (habit.subTasks || []).filter((st) => {
      if (!st.scheduleDays || st.scheduleDays === 'all') return true;
      return Array.isArray(st.scheduleDays) && st.scheduleDays.includes(dayOfWeek);
    });

    const currentHabitLogs = { ...(state.logs[habitId] || {}) };
    const target = habit.targetValue || habit.targetPerDay || 1;

    if (scheduledSubTasks.length > 0) {
      const allScheduledDone = scheduledSubTasks.every((st) => updatedCompleted.includes(st.id));
      if (allScheduledDone) {
        currentHabitLogs[dateStr] = target;
      } else if (isAlreadyCompleted && (currentHabitLogs[dateStr] || 0) >= target) {
        // If unchecked and was previously completed, unmark or adjust
        delete currentHabitLogs[dateStr];
      }
    }

    state = {
      ...state,
      subTaskLogs: updatedSubTaskLogs,
      logs: {
        ...state.logs,
        [habitId]: currentHabitLogs,
      },
    };
    emitChange();
    schedulePersist();
    return !isAlreadyCompleted;
  },

  setSubTaskCompleted(habitId: string, subTaskId: string, completed: boolean = true, dateStr: string = getTodayString()): boolean {
    const currentCompleted = state.subTaskLogs[habitId]?.[dateStr] || [];
    const isAlreadyCompleted = currentCompleted.includes(subTaskId);
    if (isAlreadyCompleted === completed) {
      return completed;
    }
    return this.toggleSubTask(habitId, subTaskId, dateStr);
  },

  addSubTask(habitId: string, subTaskData: Omit<HabitSubTask, 'id'>): HabitSubTask {
    const subTask: HabitSubTask = {
      ...subTaskData,
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    state = {
      ...state,
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            subTasks: [...(h.subTasks || []), subTask],
          };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
    return subTask;
  },

  updateSubTask(habitId: string, updatedSubTask: HabitSubTask): void {
    state = {
      ...state,
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            subTasks: (h.subTasks || []).map((st) => (st.id === updatedSubTask.id ? updatedSubTask : st)),
          };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
  },

  deleteSubTask(habitId: string, subTaskId: string): void {
    state = {
      ...state,
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            subTasks: (h.subTasks || []).filter((st) => st.id !== subTaskId),
          };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
  },

  adjustNumericHabit(habitId: string, dateStr: string = getTodayString(), delta: number): void {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentHabitLogs = { ...(state.logs[habitId] || {}) };
    const currentVal = currentHabitLogs[dateStr] || 0;
    const newVal = Math.max(0, currentVal + delta);

    if (newVal === 0) {
      delete currentHabitLogs[dateStr];
    } else {
      currentHabitLogs[dateStr] = newVal;
    }

    state = {
      ...state,
      logs: {
        ...state.logs,
        [habitId]: currentHabitLogs,
      },
    };
    emitChange();
    schedulePersist();
  },

  setHabitNote(habitId: string, dateStr: string, noteText: string): void {
    state = {
      ...state,
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          const newNotes = { ...(h.notes || {}) };
          if (!noteText.trim()) {
            delete newNotes[dateStr];
          } else {
            newNotes[dateStr] = noteText.trim();
          }
          return { ...h, notes: newNotes };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
  },

  /**
   * Records that the user resisted an urge/craving (+1 Craving Resisted)
   */
  logCravingResisted(habitId: string, dateStr: string = getTodayString()): number {
    let newCount = 1;
    state = {
      ...state,
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          const currentCravings = { ...(h.cravingsResisted || {}) };
          newCount = (currentCravings[dateStr] || 0) + 1;
          currentCravings[dateStr] = newCount;
          return { ...h, cravingsResisted: currentCravings };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
    return newCount;
  },

  /**
   * Logs an honest slip/relapse for a quit habit on a specific day.
   * Marks logs[habitId][dateStr] = -1 (slip) and saves reflection reason.
   */
  logHabitSlip(habitId: string, dateStr: string = getTodayString(), reason?: string): void {
    const currentHabitLogs = { ...(state.logs[habitId] || {}) };
    currentHabitLogs[dateStr] = -1; // -1 denotes a logged slip

    state = {
      ...state,
      logs: {
        ...state.logs,
        [habitId]: currentHabitLogs,
      },
      habits: state.habits.map((h) => {
        if (h.id === habitId && reason && reason.trim()) {
          const currentNotes = { ...(h.notes || {}) };
          currentNotes[dateStr] = `تعثر: ${reason.trim()}`;
          return { ...h, notes: currentNotes };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
  },

  logTimerSession(habitId: string, minutes: number, dateStr: string = getTodayString()): void {
    const currentHabitLogs = { ...(state.logs[habitId] || {}) };
    const currentVal = currentHabitLogs[dateStr] || 0;
    currentHabitLogs[dateStr] = currentVal + minutes;

    state = {
      ...state,
      logs: {
        ...state.logs,
        [habitId]: currentHabitLogs,
      },
    };
    emitChange();
    schedulePersist();
  },

  toggleStreakFreeze(habitId: string, dateStr: string = getTodayString()): boolean {
    let isFrozenNow = false;
    state = {
      ...state,
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          const currentFreezes = new Set(h.streakFreezeDays || []);
          if (currentFreezes.has(dateStr)) {
            currentFreezes.delete(dateStr);
            isFrozenNow = false;
          } else {
            currentFreezes.add(dateStr);
            isFrozenNow = true;
          }
          return { ...h, streakFreezeDays: Array.from(currentFreezes) };
        }
        return h;
      }),
    };
    emitChange();
    schedulePersist();
    return isFrozenNow;
  },

  toggleTheme(): void {
    state = {
      ...state,
      themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
    };
    emitChange();
    schedulePersist();
  },

  importData(data: AppExportData, mode: 'merge' | 'replace'): { habitsAdded: number; logsUpdated: number } {
    let finalHabits: Habit[] = [];
    let finalLogs: HabitLogs = {};
    let habitsAdded = 0;
    let logsUpdated = 0;

    if (mode === 'replace') {
      finalHabits = data.habits;
      finalLogs = data.logs || {};
      habitsAdded = data.habits.length;
    } else {
      const existingMap = new Map(state.habits.map((h) => [h.id, h]));
      data.habits.forEach((h) => {
        if (!existingMap.has(h.id)) {
          existingMap.set(h.id, h);
          habitsAdded++;
        }
      });
      finalHabits = Array.from(existingMap.values());

      finalLogs = { ...state.logs };
      if (data.logs) {
        for (const [habitId, dateEntries] of Object.entries(data.logs)) {
          finalLogs[habitId] = {
            ...(finalLogs[habitId] || {}),
            ...dateEntries,
          };
          logsUpdated += Object.keys(dateEntries).length;
        }
      }
    }

    state = {
      ...state,
      habits: finalHabits,
      logs: finalLogs,
    };
    emitChange();
    schedulePersist();

    return { habitsAdded, logsUpdated };
  },

  resetToDefaults(): void {
    const { habits, logs } = getInitialSampleData();
    state = {
      ...state,
      habits,
      logs,
    };
    emitChange();
    schedulePersist();
  },

  updateSettings(partial: Partial<AppSettings>): void {
    state = {
      ...state,
      settings: { ...state.settings, ...partial },
    };
    emitChange();
    schedulePersist();
  },

  archiveHabit(habitId: string): void {
    state = {
      ...state,
      habits: state.habits.map((h) => (h.id === habitId ? { ...h, archived: true } : h)),
    };
    emitChange();
    schedulePersist();
  },

  unarchiveHabit(habitId: string): void {
    state = {
      ...state,
      habits: state.habits.map((h) => (h.id === habitId ? { ...h, archived: false } : h)),
    };
    emitChange();
    schedulePersist();
  },

  sortHabits(order: AppSettings['sortOrder']): void {
    const sorted = [...state.habits].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (order === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (order === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (order === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (order === 'streak') {
        const countA = Object.keys(state.logs[a.id] || {}).length;
        const countB = Object.keys(state.logs[b.id] || {}).length;
        return countB - countA;
      }
      return 0;
    });

    state = {
      ...state,
      habits: sorted,
      settings: { ...state.settings, sortOrder: order },
    };
    emitChange();
    schedulePersist();
  },

  addHabitStack(newStack: Omit<HabitStack, 'id' | 'createdAt'>): HabitStack {
    const stack: HabitStack = {
      ...newStack,
      id: `stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    state = {
      ...state,
      stacks: [stack, ...(state.stacks || [])],
    };
    emitChange();
    schedulePersist();
    return stack;
  },

  deleteHabitStack(stackId: string): void {
    state = {
      ...state,
      stacks: (state.stacks || []).filter((s) => s.id !== stackId),
    };
    emitChange();
    schedulePersist();
  },

  clearAll(): void {
    state = {
      ...state,
      habits: [],
      logs: {},
      subTaskLogs: {},
    };
    emitChange();
    schedulePersist();
  },
};

export function useHabitStore(): StoreState {
  return useSyncExternalStore(habitStore.subscribe, habitStore.getSnapshot);
}
