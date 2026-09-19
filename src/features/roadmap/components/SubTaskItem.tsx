import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitSubTask } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { timerBackgroundService } from '../../../services/timerBackgroundService';
import { ActiveTimerSession } from '../../timer/TaskTimerModal';
import { roadmapStyles as styles } from '../styles/roadmapStyles';

interface SubTaskItemProps {
  subTask: HabitSubTask;
  habitId: string;
  habitColor: string;
  dateStr: string;
  isCompleted: boolean;
  isFuture: boolean;
  theme: ThemeColors;
  rtl?: boolean;
  onToggle: (habitId: string, subTaskId: string, dateStr: string) => void;
  onStartTimer?: (session: ActiveTimerSession) => void;
  habitName: string;
  habitIcon: string;
}

export const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  habitId,
  habitColor,
  dateStr,
  isCompleted,
  isFuture,
  theme,
  rtl = true,
  onToggle,
  onStartTimer,
  habitName,
  habitIcon,
}) => {
  const handlePress = () => {
    // Prevent completing future days
    if (isFuture) {
      hapticService.warning();
      Alert.alert('تاريخ مستقبلي', 'لا يمكن تعليم أو إنجاز مهام الأيام القادمة مسبقاً.');
      return;
    }

    // If sub-task has estimated duration and is not completed yet, prompt timer clock
    if (!isCompleted && subTask.estimatedMinutes && subTask.estimatedMinutes > 0 && onStartTimer) {
      hapticService.medium();
      const mins = subTask.estimatedMinutes || 15;
      onStartTimer({
        habitId,
        subTaskId: subTask.id,
        isSubTask: true,
        title: subTask.title,
        subtitle: habitName,
        taskTitle: subTask.title,
        habitName,
        durationMinutes: mins,
        minutes: mins,
        estimatedMinutes: mins,
        color: habitColor,
        icon: habitIcon,
        dateStr,
      });
      return;
    }

    if (!isCompleted) {
      hapticService.success();
      soundService.playComplete();
    } else {
      hapticService.light();
    }
    onToggle(habitId, subTask.id, dateStr);
  };

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 0.9 : 0.7}
      onPress={handlePress}
      style={[
        styles.trailTaskRow,
        {
          flexDirection: rtl ? 'row-reverse' : 'row',
          backgroundColor: isCompleted
            ? `${habitColor}18`
            : isFuture
            ? 'rgba(255, 255, 255, 0.02)'
            : (theme.glassSurface || theme.surface),
          borderColor: isCompleted
            ? `${habitColor}50`
            : isFuture
            ? 'rgba(255, 255, 255, 0.05)'
            : (theme.glassBorder || theme.border),
          opacity: isFuture ? 0.55 : 1,
        },
      ]}
    >
      {/* Checkbox or Lock */}
      <View
        style={[
          styles.trailCheckbox,
          {
            backgroundColor: isCompleted
              ? habitColor
              : isFuture
              ? 'rgba(255, 255, 255, 0.05)'
              : 'transparent',
            borderColor: isCompleted
              ? habitColor
              : isFuture
              ? 'rgba(255, 255, 255, 0.15)'
              : theme.border,
            borderWidth: isCompleted ? 0 : 1.5,
          },
        ]}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        ) : isFuture ? (
          <Ionicons name="lock-closed" size={10} color={theme.textMuted} />
        ) : null}
      </View>

      {/* Task Title */}
      <Text
        style={[
          styles.trailTaskName,
          {
            color: isCompleted
              ? theme.textMuted
              : isFuture
              ? theme.textMuted
              : theme.text,
            textDecorationLine: isCompleted ? 'line-through' : 'none',
            textAlign: rtl ? 'right' : 'left',
          },
        ]}
        numberOfLines={1}
      >
        {subTask.title}
      </Text>

      {/* Duration Badge - Single Clean Icon without duplicate emoji */}
      {subTask.estimatedMinutes ? (
        <View
          style={[
            styles.trailDurationTag,
            {
              backgroundColor: `${habitColor}15`,
              borderColor: `${habitColor}30`,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="time-outline" size={11} color={habitColor} />
          <Text style={[styles.trailDurationText, { color: habitColor }]}>
            {subTask.estimatedMinutes} د
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};
