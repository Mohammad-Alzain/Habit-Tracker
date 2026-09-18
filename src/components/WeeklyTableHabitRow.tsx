import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString, parseISODate, getArabicDayShort } from '../utils/dateUtils';
import { calculateHabitStats } from '../utils/streakUtils';

interface WeeklyTableHabitRowProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  days: string[]; // 7 days array
  style?: any;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onPressHabit: (habit: Habit) => void;
}

interface WeeklyTableHeaderProps {
  theme: ThemeColors;
  days: string[];
  language?: 'ar' | 'en';
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(124, 131, 253, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(124, 131, 253, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Header row showing column titles and the 7 days of the week
 */
export const WeeklyTableHeader: React.FC<WeeklyTableHeaderProps> = memo(({
  theme,
  days,
  language = 'ar',
}) => {
  const todayStr = getTodayString();

  return (
    <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
      {/* Habit Column Label */}
      <View style={styles.headerHabitCol}>
        <Text style={[styles.headerColText, { color: theme.textDim }]}>
          {language === 'ar' ? 'العادة' : 'Habit'}
        </Text>
      </View>

      {/* 7 Days Columns */}
      <View style={styles.daysColContainer}>
        {days.map((dateStr) => {
          const d = parseISODate(dateStr);
          const dayShort = language === 'ar'
            ? getArabicDayShort(d.getDay())
            : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
          const isToday = dateStr === todayStr;

          return (
            <View key={`th-${dateStr}`} style={styles.headerDayCol}>
              <Text
                style={[
                  styles.headerDayText,
                  {
                    color: isToday ? theme.primary : theme.textDim,
                    fontWeight: isToday ? '800' : '500',
                  },
                ]}
              >
                {dayShort}
              </Text>
              <Text
                style={[
                  styles.headerDateNum,
                  {
                    color: isToday ? theme.primary : theme.textMuted,
                    fontWeight: isToday ? '800' : '400',
                  },
                ]}
              >
                {d.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

/**
 * Single habit row in the table view
 */
const WeeklyTableHabitRowComponent: React.FC<WeeklyTableHabitRowProps> = ({
  habit,
  logs,
  theme,
  days,
  style,
  onToggleDate,
  onPressHabit,
}) => {
  const todayStr = getTodayString();
  const habitLogs = logs[habit.id] || {};
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
  const isQuit = habit.mode === 'quit';
  const stats = calculateHabitStats(habit, logs);
  const habitColor = habit.color || '#7C83FD';

  const isDark = theme.background.startsWith('#0') || theme.background === '#121212';
  const bgTint = isDark ? hexToRgba(habitColor, 0.08) : hexToRgba(habitColor, 0.04);

  return (
    <View
      style={[
        styles.rowContainer,
        {
          backgroundColor: isDark ? '#141418' : theme.card,
          borderColor: theme.cardBorder,
        },
        style,
      ]}
    >
      {/* Background Subtle Tint */}
      <View
        pointerEvents="none"
        style={[styles.rowTint, { backgroundColor: bgTint }]}
      />

      {/* Habit Column (Clickable to open details) */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onPressHabit(habit)}
        style={styles.habitInfoCol}
      >
        <View
          style={[
            styles.habitIconWrap,
            {
              backgroundColor: hexToRgba(habitColor, 0.18),
              borderColor: hexToRgba(habitColor, 0.35),
            },
          ]}
        >
          <Ionicons name={(habit.icon as any) || 'sparkles'} size={14} color={habitColor} />
        </View>

        <View style={styles.nameStreakCol}>
          <Text style={[styles.habitName, { color: theme.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          {stats.currentStreak > 0 && (
            <View style={styles.streakRow}>
              <Ionicons
                name={isQuit ? 'shield-checkmark' : 'flame'}
                size={10}
                color={isQuit ? '#2ED573' : '#F59E0B'}
              />
              <Text style={[styles.streakCount, { color: isQuit ? '#2ED573' : '#F59E0B' }]}>
                {stats.currentStreak}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* 7 Days Matrix Checkboxes */}
      <View style={styles.daysColContainer}>
        {days.map((dateStr) => {
          const val = habitLogs[dateStr] || 0;
          const isDone = isQuit
            ? (habit.type === 'numeric' ? val <= targetThreshold && val > 0 : val >= 1)
            : val >= targetThreshold;
          const isToday = dateStr === todayStr;

          return (
            <TouchableOpacity
              key={`td-${dateStr}`}
              activeOpacity={0.7}
              onPress={() => onToggleDate(habit.id, dateStr)}
              style={styles.dayBoxCol}
              hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
            >
              <View
                style={[
                  styles.daySquare,
                  {
                    backgroundColor: isDone
                      ? habitColor
                      : isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isToday
                      ? (isDone ? '#FFFFFF' : habitColor)
                      : isDone
                      ? habitColor
                      : isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.08)',
                    borderWidth: isToday ? 1.5 : 1,
                  },
                ]}
              >
                {isDone && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" style={{ fontWeight: '900' }} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const WeeklyTableHabitRow = memo(WeeklyTableHabitRowComponent);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  headerHabitCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerColText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  daysColContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 224, // 7 * 32px
  },
  headerDayCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDayText: {
    fontSize: 11,
    marginBottom: 2,
  },
  headerDateNum: {
    fontSize: 9.5,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  rowTint: {
    ...StyleSheet.absoluteFill,
  },
  habitInfoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 6,
  },
  habitIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameStreakCol: {
    flex: 1,
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    marginTop: 1,
  },
  streakCount: {
    fontSize: 10,
    fontWeight: '800',
  },
  dayBoxCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySquare: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});