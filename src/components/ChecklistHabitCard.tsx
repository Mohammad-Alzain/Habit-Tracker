import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateHabitStats } from '../utils/streakUtils';
import { getTodayString } from '../utils/dateUtils';

interface ChecklistHabitCardProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  onToggleToday: (habitId: string) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onStartTimer?: (habit: Habit) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const ChecklistHabitCardComponent: React.FC<ChecklistHabitCardProps> = ({
  habit,
  logs,
  theme,
  onToggleToday,
  onAdjustNumeric,
  onStartTimer,
  onPressCard,
  onDeleteHabit,
}) => {
  const stats = calculateHabitStats(habit, logs);
  const todayStr = getTodayString();
  const habitLogs = logs[habit.id] || {};
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetVal = habit.targetValue || habit.targetPerDay || 1;
  const isCompleted = currentTodayVal >= targetVal;
  const checkboxScale = useRef(new Animated.Value(1)).current;

  const handleCheckPress = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 1.35,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    if (habit.type === 'timer' && onStartTimer) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric) {
      onAdjustNumeric(habit.id, habit.targetValue >= 100 ? 250 : 1);
    } else {
      onToggleToday(habit.id);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف العادة',
      `هل أنت متأكد من رغبتك في حذف عادة "${habit.name}" نهائياً؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onDeleteHabit && onDeleteHabit(habit.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: theme.glassSurface || theme.card,
          borderColor: isCompleted ? `${habit.color}66` : (theme.glassBorder || theme.cardBorder),
          borderTopColor: theme.glassSpecular || 'rgba(255, 255, 255, 0.20)',
          shadowColor: isCompleted ? habit.color : '#000',
          shadowOpacity: isCompleted ? 0.25 : 0.1,
        },
      ]}
    >
      {/* Checkbox trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCheckPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Animated.View
          style={[
            styles.checkbox,
            {
              backgroundColor: isCompleted ? habit.color : 'transparent',
              borderColor: isCompleted ? habit.color : theme.border,
              transform: [{ scale: checkboxScale }],
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          ) : habit.type === 'timer' ? (
            <Ionicons name="play" size={14} color={theme.textDim} />
          ) : null}
        </Animated.View>
      </TouchableOpacity>

      {/* Habit Info */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.habitName,
              {
                color: isCompleted ? theme.textMuted : theme.text,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          {habit.pinned && <Ionicons name="star" size={14} color="#F59E0B" />}
        </View>

        {/* Subtitle with Goal or Streak */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.textDim }]}>
            🔥 {stats.currentStreak} {stats.currentStreak === 1 ? 'يوم' : 'أيام'}
          </Text>

          {habit.goal && stats.goalProgressPercent !== undefined && (
            <Text style={[styles.goalMetaText, { color: habit.color }]}>
              • 🎯 {stats.goalProgressPercent}% الهدف
            </Text>
          )}

          {habit.type === 'numeric' && (
            <Text style={[styles.metaText, { color: theme.textDim }]}>
              • {currentTodayVal} / {targetVal} {habit.unit || ''}
            </Text>
          )}
        </View>
      </View>

      {/* Delete button */}
      <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={theme.textDim} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const ChecklistHabitCard = memo(ChecklistHabitCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    textAlign: 'right',
  },
  goalMetaText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  deleteBtn: {
    padding: 6,
  },
});
