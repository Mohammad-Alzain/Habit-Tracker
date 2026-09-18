import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString, getCachedHeatmapColumns } from '../utils/dateUtils';
import { calculateHabitStats } from '../utils/streakUtils';

interface MiniSquareTileProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  style?: any;
  onToggleToday: (habitId: string) => void;
  onStartTimer?: (habit: Habit) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
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

const MiniSquareTileComponent: React.FC<MiniSquareTileProps> = ({
  habit,
  logs,
  theme,
  style,
  onToggleToday,
  onStartTimer,
  onAdjustNumeric,
  onPressCard,
}) => {
  const todayStr = getTodayString();
  const habitLogs = logs[habit.id] || {};
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
  const isQuit = habit.mode === 'quit';
  const isTodayCompleted = isQuit
    ? (habit.type === 'numeric' ? currentTodayVal <= targetThreshold && currentTodayVal > 0 : currentTodayVal >= 1)
    : currentTodayVal >= targetThreshold;

  const stats = calculateHabitStats(habit, logs);
  const checkScale = useRef(new Animated.Value(1)).current;

  // 6 columns x 7 days = 42 days history (fits in mini square)
  const columns = getCachedHeatmapColumns(6);

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.25,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 85,
        useNativeDriver: true,
      }),
    ]).start();

    if (!isQuit && habit.type === 'timer' && onStartTimer && !isTodayCompleted) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric) {
      onAdjustNumeric(habit.id, 1);
    } else {
      onToggleToday(habit.id);
    }
  };

  const isDark = theme.background.startsWith('#0') || theme.background === '#121212';
  const habitColor = habit.color || '#7C83FD';
  const bgTint = isDark ? hexToRgba(habitColor, 0.12) : hexToRgba(habitColor, 0.06);

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#141418' : theme.card,
          borderColor: isTodayCompleted ? hexToRgba(habitColor, 0.5) : theme.cardBorder,
        },
        style,
      ]}
    >
      {/* Background Subtle Colored Glow */}
      <View
        pointerEvents="none"
        style={[styles.colorGlow, { backgroundColor: bgTint }]}
      />

      {/* Top Bar: Mini Check/Icon trigger + streak */}
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggle}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Animated.View
            style={[
              styles.actionBox,
              {
                backgroundColor: isTodayCompleted ? habitColor : hexToRgba(habitColor, 0.18),
                borderColor: isTodayCompleted ? habitColor : hexToRgba(habitColor, 0.35),
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            {isTodayCompleted ? (
              <Ionicons name="checkmark" size={11} color="#FFFFFF" />
            ) : (
              <Ionicons name={(habit.icon as any) || 'sparkles'} size={10} color={habitColor} />
            )}
          </Animated.View>
        </TouchableOpacity>

        {stats.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name={isQuit ? 'shield-checkmark' : 'flame'} size={9} color={isQuit ? '#2ED573' : '#F59E0B'} />
            <Text style={[styles.streakText, { color: isQuit ? '#2ED573' : '#F59E0B' }]}>
              {stats.currentStreak}
            </Text>
          </View>
        )}
      </View>

      {/* Habit Title */}
      <Text
        style={[styles.title, { color: theme.text }]}
        numberOfLines={1}
      >
        {habit.name}
      </Text>

      {/* Mini Dot Heatmap Matrix */}
      <View style={styles.matrixContainer}>
        {columns.map((col, colIdx) => (
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
                      backgroundColor: isDone
                        ? habitColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                      borderColor: isToday ? (isDone ? '#FFFFFF' : habitColor) : 'transparent',
                      borderWidth: isToday ? 0.7 : 0,
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

export const MiniSquareTile = memo(MiniSquareTileComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 112,
    position: 'relative',
    overflow: 'hidden',
  },
  colorGlow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  actionBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
  },
  streakText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  title: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    marginBottom: 6,
  },
  matrixContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2.5,
  },
  matrixCol: {
    flexDirection: 'column',
    gap: 2.5,
  },
  matrixDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 1.6,
  },
});