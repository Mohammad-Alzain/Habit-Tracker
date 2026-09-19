import React, { memo, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString, getCachedHeatmapColumns } from '../utils/dateUtils';

interface MiniSquareTileProps {
  habit: Habit;
  logs?: HabitLogs;
  habitLogs?: Record<string, number>;
  theme: ThemeColors;
  style?: any;
  onToggleToday: (habitId: string) => void;
  onStartTimer?: (habit: Habit) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const EMPTY_LOGS: Record<string, number> = {};

const MiniSquareTileComponent: React.FC<MiniSquareTileProps> = ({
  habit,
  logs,
  habitLogs: directHabitLogs,
  theme,
  style,
  onToggleToday,
  onStartTimer,
  onAdjustNumeric,
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

  const checkScale = useRef(new Animated.Value(1)).current;

  // 7 columns x 7 rows = 49 days spanning the card width
  const columns = getCachedHeatmapColumns(7);

  const handleToggle = () => {
    // Immediate toggle without delay
    if (!isQuit && habit.type === 'timer' && onStartTimer && !isTodayCompleted) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric) {
      onAdjustNumeric(habit.id, 1);
    } else {
      onToggleToday(habit.id);
    }

    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.25,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isDark = theme.background.startsWith('#0') || theme.background === '#121212';
  const habitColor = habit.color || '#7C83FD';

  // Pre-computed empty dot color to avoid per-dot calculations
  const emptyDotColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';

  // High-performance memoized matrix using pure <View> elements (no TouchableOpacity overhead)
  const matrixContent = useMemo(() => {
    return columns.map((col, colIdx) => (
      <View key={`mini-col-${colIdx}`} style={styles.matrixCol}>
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
                  borderColor: isToday ? (isDone ? '#FFFFFF' : habitColor) : 'transparent',
                  borderWidth: isToday ? 0.9 : 0,
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
      activeOpacity={0.88}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#141418' : theme.card,
          borderColor: isTodayCompleted ? `${habitColor}70` : theme.cardBorder,
        },
        style,
      ]}
    >
      {/* Smooth Subtle Gradient from transparent background to habit color */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`miniGrad-${habit.id}`} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0%" stopColor={isDark ? '#141418' : theme.card} stopOpacity="0" />
              <Stop offset="60%" stopColor={habitColor} stopOpacity="0.04" />
              <Stop offset="100%" stopColor={habitColor} stopOpacity={isDark ? 0.15 : 0.08} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" rx={14} fill={`url(#miniGrad-${habit.id})`} />
        </Svg>
      </View>

      {/* Top Header Row: Check Button + Habit Title (streak hidden per user request) */}
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggle}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Animated.View
            style={[
              styles.actionBox,
              {
                backgroundColor: isTodayCompleted ? habitColor : `${habitColor}22`,
                borderColor: isTodayCompleted ? habitColor : `${habitColor}45`,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            {isTodayCompleted ? (
              <Ionicons name="checkmark" size={11} color="#FFFFFF" style={{ fontWeight: '900' }} />
            ) : (
              <Ionicons name={(habit.icon as any) || 'sparkles'} size={10} color={habitColor} />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Habit Title in header in smaller font next to action button */}
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
      </View>

      {/* Enlarged Dot Matrix spanning almost the full width of the card */}
      <View style={styles.matrixContainer}>
        {matrixContent}
      </View>
    </TouchableOpacity>
  );
};

function areMiniPropsEqual(prev: MiniSquareTileProps, next: MiniSquareTileProps): boolean {
  if (prev.habit !== next.habit) return false;
  if (prev.theme !== next.theme) return false;
  if (prev.onToggleToday !== next.onToggleToday) return false;
  if (prev.onPressCard !== next.onPressCard) return false;

  const prevLogs = prev.habitLogs || (prev.logs ? prev.logs[prev.habit.id] : undefined);
  const nextLogs = next.habitLogs || (next.logs ? next.logs[next.habit.id] : undefined);
  if (prevLogs !== nextLogs) return false;

  return true;
}

export const MiniSquareTile = memo(MiniSquareTileComponent, areMiniPropsEqual);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingTop: 8,
    paddingBottom: 9,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 116,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 5,
    marginBottom: 7,
  },
  actionBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'left',
  },
  matrixContainer: {
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 1,
  },
  matrixCol: {
    flexDirection: 'column',
    gap: 3.2,
  },
  matrixDot: {
    width: 8.8,
    height: 8.8,
    borderRadius: 2.5,
  },
});