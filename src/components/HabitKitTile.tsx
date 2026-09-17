import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString, parseISODate, getArabicMonth, getCachedTileMatrixColumns } from '../utils/dateUtils';
import { calculateHabitStats } from '../utils/streakUtils';

interface HabitKitTileProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  onToggleToday: (habitId: string) => void;
  onStartTimer?: (habit: Habit) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const HabitKitTileComponent: React.FC<HabitKitTileProps> = ({
  habit,
  logs,
  theme,
  onToggleToday,
  onStartTimer,
  onAdjustNumeric,
  onPressCard,
  onDeleteHabit,
}) => {
  const todayStr = getTodayString();
  const todayDate = parseISODate(todayStr);
  const habitLogs = logs[habit.id] || {};
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
  const isTodayCompleted = currentTodayVal >= targetThreshold;
  const stats = calculateHabitStats(habit, logs);
  const checkScale = useRef(new Animated.Value(1)).current;

  const currentMonthName = getArabicMonth(todayDate.getMonth());
  const cachedCols = getCachedTileMatrixColumns();

  const handleActionPress = () => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.3,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();

    if (habit.type === 'timer' && onStartTimer && !isTodayCompleted) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric && !isTodayCompleted) {
      onAdjustNumeric(habit.id, 1);
    } else {
      onToggleToday(habit.id);
    }
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
          borderTopColor: theme.glassSpecular || 'rgba(255,255,255,0.26)',
          borderTopWidth: 1.2,
          shadowColor: isTodayCompleted ? habit.color : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isTodayCompleted ? 0.32 : 0.14,
          shadowRadius: isTodayCompleted ? 10 : 5,
        },
      ]}
    >
      {/* Top row: Title and Checkmark / Timer / Stepper */}
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.tileSubRow}>
            <Text style={[styles.subtitle, { color: theme.textDim }]}>
              {currentMonthName}
            </Text>

            {habit.type === 'timer' && (
              <View style={[styles.typeBadge, { backgroundColor: `${habit.color}20`, borderColor: `${habit.color}40` }]}>
                <Ionicons name="timer-outline" size={10} color={habit.color} />
                <Text style={[styles.typeBadgeText, { color: habit.color }]}>
                  {currentTodayVal > 0 ? `${currentTodayVal}/${targetThreshold}د` : `${targetThreshold}د`}
                </Text>
              </View>
            )}

            {habit.type === 'numeric' && (
              <View style={[styles.typeBadge, { backgroundColor: `${habit.color}20`, borderColor: `${habit.color}40` }]}>
                <Text style={[styles.typeBadgeText, { color: habit.color }]}>
                  {currentTodayVal}/{targetThreshold} {habit.unit || ''}
                </Text>
              </View>
            )}

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
          onPress={handleActionPress}
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
            {isTodayCompleted ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : habit.type === 'timer' ? (
              <Ionicons name="play" size={12} color={habit.color} style={{ marginLeft: 1 }} />
            ) : habit.type === 'numeric' ? (
              <Ionicons name="add" size={13} color={habit.color} />
            ) : null}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Mini Dot Heatmap Matrix */}
      <View style={styles.matrixContainer}>
        {cachedCols.map((col, cIdx) => (
          <View key={`c-${cIdx}`} style={styles.matrixCol}>
            {col.map((dStr) => {
              const count = habitLogs[dStr] || 0;
              const isComp = count >= targetThreshold;
              const isToday = dStr === todayStr;
              const bg = isComp ? habit.color : theme.emptyCell;

              return (
                <View
                  key={dStr}
                  style={[
                    styles.matrixDot,
                    {
                      backgroundColor: bg,
                      borderColor: isToday ? habit.color : 'transparent',
                      borderWidth: isToday && !isComp ? 1 : 0,
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

const arePropsEqual = (prev: HabitKitTileProps, next: HabitKitTileProps) => {
  return (
    prev.habit === next.habit &&
    prev.logs[prev.habit.id] === next.logs[next.habit.id] &&
    prev.theme === next.theme
  );
};

export const HabitKitTile = memo(HabitKitTileComponent, arePropsEqual);

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
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
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

