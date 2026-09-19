import React, { memo, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString, getCachedFullCardMatrixColumns } from '../utils/dateUtils';
import { calculateHabitStats } from '../utils/streakUtils';

interface FullCalendarCardProps {
  habit: Habit;
  logs?: HabitLogs;
  habitLogs?: Record<string, number>;
  theme: ThemeColors;
  style?: any;
  onToggleToday: (habitId: string) => void;
  onTogglePastDate?: (habitId: string, dateStr: string) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onStartTimer?: (habit: Habit) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const EMPTY_LOGS: Record<string, number> = {};

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

const FullCalendarCardComponent: React.FC<FullCalendarCardProps> = ({
  habit,
  logs,
  habitLogs: directHabitLogs,
  theme,
  style,
  onToggleToday,
  onAdjustNumeric,
  onStartTimer,
  onPressCard,
}) => {
  const todayStr = getTodayString();
  const habitLogs = directHabitLogs || (logs ? logs[habit.id] : undefined) || EMPTY_LOGS;
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
  const isQuit = habit.mode === 'quit';
  const isTodayCompleted = isQuit
    ? (habit.type === 'numeric' ? currentTodayVal <= targetThreshold && currentTodayVal > 0 : currentTodayVal >= 1)
    : currentTodayVal >= targetThreshold;

  const stats = useMemo(() => {
    return calculateHabitStats(habit, logs || { [habit.id]: habitLogs });
  }, [habit, logs, habitLogs]);

  const checkScale = useRef(new Animated.Value(1)).current;

  // 24 columns x 7 days = 168 days matrix
  const columns = getCachedFullCardMatrixColumns(24);

  const handleCheckAction = () => {
    // 1. Instant execution with ZERO delay (Request 5)
    if (!isQuit && habit.type === 'timer' && onStartTimer && !isTodayCompleted) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric) {
      onAdjustNumeric(habit.id, 1);
    } else {
      onToggleToday(habit.id);
    }

    // 2. Snappy fast micro-bounce without delaying registration
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.15,
        duration: 35,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 6,
        tension: 130,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isDark = theme.background.startsWith('#0') || theme.background === '#121212';
  const habitColor = habit.color || '#7C83FD';
  const cardBorderColor = isDark ? hexToRgba(habitColor, 0.18) : hexToRgba(habitColor, 0.12);

  // Subtitle generation: goal title, frequency, or streak
  let subtitle = habit.description || '';
  if (habit.goal?.title) {
    subtitle = habit.goal.title;
  } else if (stats.currentStreak > 0) {
    subtitle = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'يوم مستمر' : 'أيام مستمرة'}`;
  } else if (habit.targetValue && habit.unit) {
    subtitle = `${habit.targetValue} ${habit.unit} يومياً`;
  }

  // Pre-computed empty dot color to avoid per-dot calculations
  const emptyDotColor = isDark ? hexToRgba(habitColor, 0.08) : 'rgba(0, 0, 0, 0.06)';

  // High-performance memoized matrix using pure lightweight <View> elements (Zero touchable overhead)
  const matrixContent = useMemo(() => {
    return columns.map((col, colIdx) => (
      <View key={`full-col-${colIdx}`} style={styles.matrixCol}>
        {col.map((dateStr) => {
          const val = habitLogs[dateStr] || 0;
          const isDone = isQuit
            ? (habit.type === 'numeric' ? val <= targetThreshold && val > 0 : val >= 1)
            : val >= targetThreshold;
          const isToday = dateStr === todayStr;

          return (
            <View
              key={dateStr}
              style={[
                styles.matrixDot,
                {
                  backgroundColor: isDone ? habitColor : emptyDotColor,
                  borderColor: isToday
                    ? (isDone ? '#FFFFFF' : habitColor)
                    : 'transparent',
                  borderWidth: isToday ? 1 : 0,
                },
              ]}
            />
          );
        })}
      </View>
    ));
  }, [columns, habitLogs, isQuit, habit.type, targetThreshold, todayStr, habitColor, emptyDotColor]);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#141417' : theme.card,
          borderColor: cardBorderColor,
        },
        style,
      ]}
    >
      {/* Smooth gradient from transparent background to habit color (Request 2) */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`fullGrad-${habit.id}`} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0%" stopColor={isDark ? '#141417' : theme.card} stopOpacity="0" />
              <Stop offset="50%" stopColor={habitColor} stopOpacity="0.04" />
              <Stop offset="100%" stopColor={habitColor} stopOpacity={isDark ? 0.16 : 0.08} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" rx={22} fill={`url(#fullGrad-${habit.id})`} />
        </Svg>
      </View>

      {/* Top Header Row matching screenshot */}
      <View style={styles.topRow}>
        {/* Left Action Box: Check Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCheckAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View
            style={[
              styles.checkButton,
              {
                backgroundColor: isTodayCompleted
                  ? habitColor
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                borderColor: isTodayCompleted
                  ? habitColor
                  : isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={isTodayCompleted ? '#FFFFFF' : isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.3)'}
              style={{ fontWeight: '900' }}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Center/Right Habit Info */}
        <View style={styles.infoCol}>
          <Text
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          {!!subtitle && (
            <Text
              style={[styles.subtitle, { color: theme.textDim }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Habit Icon Badge */}
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: hexToRgba(habitColor, 0.22),
              borderColor: hexToRgba(habitColor, 0.38),
            },
          ]}
        >
          <Ionicons
            name={(habit.icon as any) || 'sparkles'}
            size={22}
            color={habitColor}
          />
        </View>
      </View>

      {/* 24-Column Dot Matrix Spanning Width */}
      <View style={styles.matrixWrapper}>
        <View style={styles.matrixContainer}>
          {matrixContent}
        </View>
      </View>
    </TouchableOpacity>
  );
};

function areCardPropsEqual(prev: FullCalendarCardProps, next: FullCalendarCardProps): boolean {
  if (prev.habit !== next.habit) return false;
  if (prev.theme !== next.theme) return false;
  if (prev.onToggleToday !== next.onToggleToday) return false;
  if (prev.onPressCard !== next.onPressCard) return false;
  
  const prevLogs = prev.habitLogs || (prev.logs ? prev.logs[prev.habit.id] : undefined);
  const nextLogs = next.habitLogs || (next.logs ? next.logs[next.habit.id] : undefined);
  if (prevLogs !== nextLogs) return false;

  return true;
}

export const FullCalendarCard = memo(FullCalendarCardComponent, areCardPropsEqual);

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.2,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },

  topRow: {
    direction: 'ltr',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 2,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    textAlign: 'right',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixContainer: {
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  matrixCol: {
    flexDirection: 'column',
    gap: 3.5,
  },
  matrixDot: {
    width: 9.5,
    height: 9.5,
    borderRadius: 3.2,
  },
});