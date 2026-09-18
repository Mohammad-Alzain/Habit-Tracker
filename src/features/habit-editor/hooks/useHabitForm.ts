import { useState, useEffect } from 'react';
import {
  Habit,
  HabitType,
  HabitCategory,
  HabitGoal,
  HabitGoalType,
  HabitMode,
  TrackingType,
  DayOfWeek,
  HabitFrequency,
  HabitSubTask,
} from '../../../types/habit';
import { HABITKIT_PALETTE } from '../../../constants/theme';

export function useHabitForm(habitToEdit?: Habit | null) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABITKIT_PALETTE[6]); // Coral / Salmon default
  const [selectedIcon, setSelectedIcon] = useState('pulse-outline');
  const [mode, setMode] = useState<HabitMode>('build');
  const [habitType, setHabitType] = useState<HabitType>('boolean');
  const [timerMinutes, setTimerMinutes] = useState<number>(20);
  const [trackingType, setTrackingType] = useState<TrackingType>('step_by_step');
  const [targetPerDay, setTargetPerDay] = useState(1);
  const [category, setCategory] = useState<HabitCategory>('learning');
  const [goalFrequency, setGoalFrequency] = useState('4 / شهر');
  const [customUnit, setCustomUnit] = useState('');
  const [error, setError] = useState('');

  // Custom Goal State
  const [goalType, setGoalType] = useState<HabitGoalType>('days');
  const [goalTargetValue, setGoalTargetValue] = useState<number>(66);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [customDays, setCustomDays] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [customReminderText, setCustomReminderText] = useState('');
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  // Sub-tasks State for Roadmap
  const [subTasks, setSubTasks] = useState<HabitSubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskMinutes, setNewSubTaskMinutes] = useState('15');
  const [newSubTaskDays, setNewSubTaskDays] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6]);
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setSelectedColor(habitToEdit.color);
      setSelectedIcon(habitToEdit.icon);
      setMode(habitToEdit.mode || 'build');
      setHabitType(habitToEdit.type || (habitToEdit.trackingType === 'custom_value' ? 'numeric' : 'boolean'));
      setTimerMinutes(habitToEdit.type === 'timer' ? (habitToEdit.targetValue || 20) : 20);
      setTrackingType(habitToEdit.trackingType || 'step_by_step');
      setTargetPerDay(habitToEdit.targetValue || habitToEdit.targetPerDay || 1);
      setCategory(habitToEdit.category || 'learning');
      setCustomUnit(habitToEdit.unit || '');
      setReminderEnabled(!!habitToEdit.reminderEnabled);
      setReminderTime(habitToEdit.reminderTime || '08:00');
      setCustomReminderText(habitToEdit.customReminderText || '');
      setSubTasks(habitToEdit.subTasks ? [...habitToEdit.subTasks] : []);
      setCustomDays(
        habitToEdit.customDays && habitToEdit.customDays.length > 0
          ? [...habitToEdit.customDays]
          : [0, 1, 2, 3, 4, 5, 6]
      );
      setFrequency(habitToEdit.frequency || 'daily');

      if (habitToEdit.goal) {
        setGoalType(habitToEdit.goal.type || 'days');
        setGoalTargetValue(habitToEdit.goal.targetValue || 66);
        setGoalFrequency(habitToEdit.goal.title || `${habitToEdit.goal.targetValue} يوماً`);
      } else if (habitToEdit.goalFrequency) {
        const m = habitToEdit.goalFrequency.match(/\d+/);
        const v = m ? parseInt(m[0], 10) : 30;
        setGoalType('days');
        setGoalTargetValue(v);
        setGoalFrequency(habitToEdit.goalFrequency);
      }
    } else {
      // Reset defaults for creation
      setName('');
      setDescription('');
      setSelectedColor(HABITKIT_PALETTE[6]);
      setSelectedIcon('pulse-outline');
      setMode('build');
      setHabitType('boolean');
      setTimerMinutes(20);
      setTrackingType('step_by_step');
      setTargetPerDay(1);
      setCategory('learning');
      setCustomUnit('');
      setReminderEnabled(false);
      setReminderTime('08:00');
      setCustomReminderText('');
      setSubTasks([]);
      setCustomDays([0, 1, 2, 3, 4, 5, 6]);
      setFrequency('daily');
      setGoalType('days');
      setGoalTargetValue(66);
      setGoalFrequency('الاستمرار لـ 66 يوماً');
      setError('');
    }
    setEditingSubTaskId(null);
  }, [habitToEdit]);

  const startEditSubTask = (st: HabitSubTask) => {
    setEditingSubTaskId(st.id);
    setNewSubTaskTitle(st.title);
    setNewSubTaskMinutes(st.estimatedMinutes ? String(st.estimatedMinutes) : '15');
    if (st.scheduleDays === 'all') {
      setNewSubTaskDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (Array.isArray(st.scheduleDays)) {
      setNewSubTaskDays(st.scheduleDays);
    }
  };

  const cancelEditSubTask = () => {
    setEditingSubTaskId(null);
    setNewSubTaskTitle('');
    setNewSubTaskMinutes('15');
    setNewSubTaskDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const addSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    const mins = parseInt(newSubTaskMinutes, 10);
    const scheduleDays = newSubTaskDays.length === 7 ? 'all' : newSubTaskDays;

    if (editingSubTaskId) {
      setSubTasks((prev) =>
        prev.map((st) =>
          st.id === editingSubTaskId
            ? {
                ...st,
                title: newSubTaskTitle.trim(),
                estimatedMinutes: isNaN(mins) || mins <= 0 ? undefined : mins,
                scheduleDays,
              }
            : st
        )
      );
      setEditingSubTaskId(null);
    } else {
      const newTask: HabitSubTask = {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: newSubTaskTitle.trim(),
        estimatedMinutes: isNaN(mins) || mins <= 0 ? undefined : mins,
        scheduleDays,
      };
      setSubTasks((prev) => [...prev, newTask]);
    }

    setNewSubTaskTitle('');
    setNewSubTaskMinutes('15');
    setNewSubTaskDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const removeSubTask = (id: string) => {
    if (editingSubTaskId === id) {
      cancelEditSubTask();
    }
    setSubTasks((prev) => prev.filter((st) => st.id !== id));
  };

  const toggleSubTaskDay = (day: DayOfWeek) => {
    if (newSubTaskDays.includes(day)) {
      if (newSubTaskDays.length === 1) return; // Keep at least 1 day
      setNewSubTaskDays(newSubTaskDays.filter((d) => d !== day));
    } else {
      setNewSubTaskDays([...newSubTaskDays, day]);
    }
  };

  const handleSelectMode = (newMode: HabitMode) => {
    setMode(newMode);
    if (newMode === 'quit' && habitType === 'timer') {
      setHabitType('boolean');
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    selectedColor,
    setSelectedColor,
    selectedIcon,
    setSelectedIcon,
    mode,
    setMode: handleSelectMode,
    habitType,
    setHabitType,
    timerMinutes,
    setTimerMinutes,
    trackingType,
    setTrackingType,
    targetPerDay,
    setTargetPerDay,
    category,
    setCategory,
    goalFrequency,
    setGoalFrequency,
    customDays,
    setCustomDays,
    frequency,
    setFrequency,
    customUnit,
    setCustomUnit,
    error,
    setError,
    goalType,
    setGoalType,
    goalTargetValue,
    setGoalTargetValue,
    goalModalVisible,
    setGoalModalVisible,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    customReminderText,
    setCustomReminderText,
    reminderModalVisible,
    setReminderModalVisible,
    subTasks,
    newSubTaskTitle,
    setNewSubTaskTitle,
    newSubTaskMinutes,
    setNewSubTaskMinutes,
    newSubTaskDays,
    addSubTask,
    removeSubTask,
    toggleSubTaskDay,
    editingSubTaskId,
    startEditSubTask,
    cancelEditSubTask,
  };
}
