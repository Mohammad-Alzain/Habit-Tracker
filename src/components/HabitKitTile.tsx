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
  style?: any;
  onToggleToday: (habitId: string) => void;
  onStartTimer?: (habit: Habit) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onLogCraving?: (habitId: string) => void;
  onOpenSlipModal?: (habit: Habit) => void;
}

const HabitKitTileComponent: React.FC<HabitKitTileProps> = ({
  habit,
  logs,
  theme,
  style,
  onToggleToday,
  onStartTimer,
  onAdjustNumeric,
  onPressCard,
  onDeleteHabit,
  onLogCraving,
  onOpenSlipModal,
}) => {
  const todayStr = getTodayString();
  const todayDate = parseISODate(todayStr);
  const habitLogs = logs[habit.id] || {};
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
  const isQuit = habit.mode === 'quit';
  const isTodaySlip = isQuit && (currentTodayVal === -1 || (habit.type === 'numeric' && currentTodayVal > targetThreshold));
  const isTodayCompleted = isQuit
    ? (habit.type === 'numeric' ? currentTodayVal <= targetThreshold && currentTodayVal > 0 : currentTodayVal >= 1)
    : currentTodayVal >= targetThreshold;
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

    if (!isQuit && habit.type === 'timer' && onStartTimer && !isTodayCompleted) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric) {
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
          backgroundColor: theme.card,
          borderColor: isTodayCompleted ? `${habit.color}60` : theme.cardBorder,
          shadowColor: isTodayCompleted ? habit.color : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isTodayCompleted ? 0.32 : 0.14,
          shadowRadius: isTodayCompleted ? 10 : 5,
        },
        style,
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
              <View style={[
                styles.typeBadge,
                {
                  backgroundColor: isQuit && currentTodayVal > targetThreshold ? 'rgba(231, 76, 60, 0.2)' : `${habit.color}20`,
                  borderColor: isQuit && currentTodayVal > targetThreshold ? '#E74C3C' : `${habit.color}40`,
                },
              ]}>
                <Text style={[
                  styles.typeBadgeText,
                  { color: isQuit && currentTodayVal > targetThreshold ? '#E74C3C' : habit.color },
                ]}>
                  {currentTodayVal}/{targetThreshold} {habit.unit || ''} {isQuit ? '(سقف)' : ''}
                </Text>
              </View>
            )}

            {stats.currentStreak > 0 && (
              <View style={[styles.miniStreakPill, { backgroundColor: isQuit ? 'rgba(46, 213, 115, 0.15)' : `${habit.color}20` }]}>
                <Ionicons name={isQuit ? 'shield-checkmark' : 'flame'} size={10} color={isQuit ? '#2ED573' : habit.color} />
                <Text style={[styles.miniStreakText, { color: isQuit ? '#2ED573' : habit.color }]}>
                  {stats.currentStreak}
                </Text>
              </View>
            )}

            {isQuit && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onLogCraving && onLogCraving(habit.id)}
                style={[styles.miniStreakPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}
              >
                <Ionicons name="flash" size={10} color="#F59E0B" />
                <Text style={[styles.miniStreakText, { color: '#F59E0B' }]}>
                  {habit.cravingsResisted?.[todayStr] ? `${habit.cravingsResisted[todayStr]}` : '+رغبة'}
                </Text>
              </TouchableOpacity>
            )}

            {habit.reminderEnabled && habit.reminderTime && (
              <View style={styles.miniReminderPill}>
                <Ionicons name="notifications-outline" size={10} color="#00CEC9" />
              </View>
            )}
          </View>

          {/* Mini Goal badge */}
          {stats.goalTargetLabel && (
            <View style={[styles.miniGoalBadge, { backgroundColor: `${habit.color}15`, flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }]}>
              <Ionicons name="flag-outline" size={11} color={habit.color} />
              <Text style={[styles.miniGoalText, { color: habit.color }]} numberOfLines={1}>
                {stats.goalTargetLabel}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleActionPress}
          onLongPress={() => {
            if (isQuit && onOpenSlipModal) {
              onOpenSlipModal(habit);
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              {
                backgroundColor: isQuit
                  ? (isTodaySlip ? 'rgba(231, 76, 60, 0.2)' : isTodayCompleted ? 'rgba(46, 213, 115, 0.2)' : 'transparent')
                  : (isTodayCompleted ? habit.color : 'transparent'),
                borderColor: isQuit
                  ? (isTodaySlip ? '#E74C3C' : isTodayCompleted ? '#2ED573' : theme.border)
                  : (isTodayCompleted ? habit.color : theme.border),
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            {isQuit ? (
              isTodaySlip ? (
                <Ionicons name="alert-circle" size={13} color="#E74C3C" />
              ) : isTodayCompleted ? (
                <Ionicons name="shield-checkmark" size={13} color="#2ED573" />
              ) : (
                <Ionicons name="shield-outline" size={13} color={habit.color} />
              )
            ) : isTodayCompleted ? (
              <Ionicons name="checkmark" size={13} color="#FFFFFF" />
            ) : habit.type === 'timer' ? (
              <Ionicons name="play" size={11} color={habit.color} style={{ marginLeft: 1 }} />
            ) : habit.type === 'numeric' ? (
              <Ionicons name="add" size={12} color={habit.color} />
            ) : null}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Mini Dot Heatmap Matrix matching Image 1 (11 cols x 7 rows) */}
      <View style={styles.matrixContainer}>
        {cachedCols.map((col, cIdx) => (
          <View key={`c-${cIdx}`} style={styles.matrixCol}>
            {col.map((dStr) => {
              const isFuture = dStr > todayStr;
              const count = habitLogs[dStr] || 0;
              const isSlip = count === -1 || (isQuit && habit.type === 'numeric' && count > targetThreshold);
              const isComp = isQuit
                ? (habit.type === 'numeric' ? count <= targetThreshold && count > 0 : count >= 1)
                : count >= targetThreshold;
              const isToday = dStr === todayStr;
              const bg = isFuture
                ? 'transparent'
                : isSlip
                ? 'rgba(231, 76, 60, 0.85)'
                : isComp
                ? (isQuit ? '#2ED573' : habit.color)
                : theme.emptyCell;

              return (
                <View
                  key={dStr}
                  style={[
                    styles.matrixDot,
                    {
                      backgroundColor: bg,
                      borderColor: isFuture ? 'transparent' : isSlip ? '#E74C3C' : isToday ? habit.color : 'transparent',
                      borderWidth: isToday && !isComp && !isSlip ? 1 : 0,
                      opacity: isFuture ? 0 : 1,
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
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
    marginLeft: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 10.5,
    textAlign: 'right',
  },
  tileSubRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 0.8,
  },
  typeBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  miniStreakPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
  },
  miniStreakText: {
    fontSize: 9,
    fontWeight: '800',
  },
  miniReminderPill: {
    paddingHorizontal: 2,
  },
  miniGoalBadge: {
    marginTop: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  miniGoalText: {
    fontSize: 9,
    fontWeight: '700',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginTop: 4,
  },
  matrixCol: {
    flexDirection: 'column',
    gap: 3,
  },
  matrixDot: {
    width: 8.5,
    height: 8.5,
    borderRadius: 2.5,
  },
});

