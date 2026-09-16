import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString, parseISODate, getArabicMonth } from '../utils/dateUtils';
import { calculateHabitStats } from '../utils/streakUtils';

interface HabitKitTileProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  onToggleToday: (habitId: string) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const HabitKitTileComponent: React.FC<HabitKitTileProps> = ({
  habit,
  logs,
  theme,
  onToggleToday,
  onPressCard,
  onDeleteHabit,
}) => {
  const todayStr = getTodayString();
  const todayDate = parseISODate(todayStr);
  const habitLogs = logs[habit.id] || {};
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
  const isTodayCompleted = (habitLogs[todayStr] || 0) >= targetThreshold;
  const stats = calculateHabitStats(habit, logs);
  const checkScale = useRef(new Animated.Value(1)).current;

  const currentMonthName = getArabicMonth(todayDate.getMonth());
  const currentYear = todayDate.getFullYear();

  const handleCheckPress = () => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.35,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onToggleToday(habit.id);
  };

  // HabitKit Mini Matrix: 6 columns x 5 rows = 30 days
  const colsCount = 6;
  const rowsCount = 5;
  const totalDays = colsCount * rowsCount;

  const columns: { dateStr: string; isCompleted: boolean; isToday: boolean }[][] = [];

  for (let c = 0; c < colsCount; c++) {
    const col: { dateStr: string; isCompleted: boolean; isToday: boolean }[] = [];
    for (let r = 0; r < rowsCount; r++) {
      const daysAgo = (colsCount - 1 - c) * rowsCount + (rowsCount - 1 - r);
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - daysAgo);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;

      const completed = (habitLogs[dStr] || 0) >= targetThreshold;
      col.push({
        dateStr: dStr,
        isCompleted: completed,
        isToday: dStr === todayStr,
      });
    }
    columns.push(col);
  }

  const handleDelete = () => {
    Alert.alert('حذف العادة', `هل تريد حذف عادة "${habit.name}" نهائياً؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => onDeleteHabit && onDeleteHabit(habit.id) },
    ]);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPressCard(habit)}
      style={[
        styles.tile,
        {
          backgroundColor: theme.glassSurface || theme.card,
          borderColor: isTodayCompleted ? `${habit.color}60` : (theme.glassBorder || theme.cardBorder),
          borderTopColor: theme.glassSpecular || 'rgba(255,255,255,0.22)',
          shadowColor: isTodayCompleted ? habit.color : '#000',
          shadowOpacity: isTodayCompleted ? 0.25 : 0.12,
        },
      ]}
    >
      {/* Top row: Title and Checkmark */}
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.tileSubRow}>
            <Text style={[styles.subtitle, { color: theme.textDim }]}>
              {currentMonthName}
            </Text>
            {stats.currentStreak > 0 && (
              <View style={[styles.miniStreakPill, { backgroundColor: `${habit.color}20` }]}>
                <Ionicons name="flame" size={10} color={habit.color} />
                <Text style={[styles.miniStreakText, { color: habit.color }]}>
                  {stats.currentStreak}
                </Text>
              </View>
            )}
            {habit.reminderEnabled && habit.reminderTime && (
              <View style={styles.miniReminderPill}>
                <Ionicons name="notifications-outline" size={10} color="#00CEC9" />
              </View>
            )}
          </View>

          {/* Mini Goal badge */}
          {stats.goalTargetLabel && (
            <View style={[styles.miniGoalBadge, { backgroundColor: `${habit.color}15` }]}>
              <Text style={[styles.miniGoalText, { color: habit.color }]} numberOfLines={1}>
                🎯 {stats.goalTargetLabel}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCheckPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              {
                backgroundColor: isTodayCompleted ? habit.color : 'transparent',
                borderColor: isTodayCompleted ? habit.color : theme.border,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            {isTodayCompleted && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Mini Dot Heatmap Matrix */}
      <View style={styles.matrixContainer}>
        {columns.map((col, cIdx) => (
          <View key={`c-${cIdx}`} style={styles.matrixCol}>
            {col.map((cell) => {
              const bg = cell.isCompleted ? habit.color : theme.emptyCell;
              return (
                <View
                  key={cell.dateStr}
                  style={[
                    styles.matrixDot,
                    {
                      backgroundColor: bg,
                      borderColor: cell.isToday ? habit.color : 'transparent',
                      borderWidth: cell.isToday && !cell.isCompleted ? 1 : 0,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export const HabitKitTile = memo(HabitKitTileComponent);

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
    marginLeft: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'right',
  },
  tileSubRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  miniStreakPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  miniStreakText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  miniReminderPill: {
    paddingHorizontal: 2,
  },
  miniGoalBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  miniGoalText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  matrixCol: {
    flexDirection: 'column',
    gap: 4,
  },
  matrixDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
});
