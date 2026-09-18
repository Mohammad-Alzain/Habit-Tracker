import React, { memo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateHabitStats } from '../utils/streakUtils';
import { getTodayString } from '../utils/dateUtils';
import { ConfirmActionModal } from './common/ConfirmActionModal';

interface ChecklistHabitCardProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  style?: any;
  onToggleToday: (habitId: string) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onStartTimer?: (habit: Habit) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onLogCraving?: (habitId: string) => void;
  onOpenSlipModal?: (habit: Habit) => void;
}

const ChecklistHabitCardComponent: React.FC<ChecklistHabitCardProps> = ({
  habit,
  logs,
  theme,
  style,
  onToggleToday,
  onAdjustNumeric,
  onStartTimer,
  onPressCard,
  onDeleteHabit,
  onLogCraving,
  onOpenSlipModal,
}) => {
  const stats = calculateHabitStats(habit, logs);
  const todayStr = getTodayString();
  const habitLogs = logs[habit.id] || {};
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetVal = habit.targetValue || habit.targetPerDay || 1;
  const isQuit = habit.mode === 'quit';
  const isTodaySlip = isQuit && (currentTodayVal === -1 || (habit.type === 'numeric' && currentTodayVal > targetVal));
  const isCompleted = isQuit
    ? (habit.type === 'numeric' ? currentTodayVal <= targetVal && currentTodayVal > 0 : currentTodayVal >= 1)
    : currentTodayVal >= targetVal;
  const cravingsToday = isQuit ? habit.cravingsResisted?.[todayStr] || 0 : 0;
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

    if (!isQuit && habit.type === 'timer' && onStartTimer) {
      onStartTimer(habit);
    } else if (habit.type === 'numeric' && onAdjustNumeric) {
      onAdjustNumeric(habit.id, habit.targetValue >= 100 ? 250 : 1);
    } else {
      onToggleToday(habit.id);
    }
  };

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isCompleted ? `${habit.color}66` : theme.cardBorder,
          shadowColor: isCompleted ? habit.color : '#000',
          shadowOpacity: isCompleted ? 0.25 : 0.1,
        },
        style,
      ]}
    >
      {/* Checkbox trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCheckPress}
        onLongPress={() => {
          if (isQuit && onOpenSlipModal) {
            onOpenSlipModal(habit);
          }
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Animated.View
          style={[
            styles.checkbox,
            {
              backgroundColor: isQuit
                ? (isTodaySlip ? 'rgba(231, 76, 60, 0.2)' : isCompleted ? 'rgba(46, 213, 115, 0.2)' : 'transparent')
                : (isCompleted ? habit.color : 'transparent'),
              borderColor: isQuit
                ? (isTodaySlip ? '#E74C3C' : isCompleted ? '#2ED573' : theme.border)
                : (isCompleted ? habit.color : theme.border),
              transform: [{ scale: checkboxScale }],
            },
          ]}
        >
          {isQuit ? (
            isTodaySlip ? (
              <Ionicons name="alert-circle" size={16} color="#E74C3C" />
            ) : isCompleted ? (
              <Ionicons name="shield-checkmark" size={16} color="#2ED573" />
            ) : (
              <Ionicons name="shield-outline" size={16} color={habit.color} />
            )
          ) : isCompleted ? (
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
                color: isCompleted && !isQuit ? theme.textMuted : theme.text,
                textDecorationLine: isCompleted && !isQuit ? 'line-through' : 'none',
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
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
            <Ionicons name="flame" size={13} color="#F59E0B" />
            <Text style={[styles.metaText, { color: theme.textDim }]}>
              {stats.currentStreak} {stats.currentStreak === 1 ? 'يوم' : 'أيام'}
            </Text>
          </View>

          {habit.goal && stats.goalProgressPercent !== undefined && (
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
              <Ionicons name="flag-outline" size={12} color={habit.color} />
              <Text style={[styles.goalMetaText, { color: habit.color }]}>
                {stats.goalProgressPercent}% الهدف
              </Text>
            </View>
          )}

          {habit.type === 'numeric' && (
            <Text style={[styles.metaText, { color: theme.textDim }]}>
              • {currentTodayVal} / {targetVal} {habit.unit || ''}
            </Text>
          )}
        </View>
      </View>

      {/* Quit Habit Quick Actions */}
      {isQuit && (
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginEnd: 8 }}>
          {onLogCraving && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onLogCraving(habit.id)}
              style={{
                backgroundColor: 'rgba(46, 213, 115, 0.12)',
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(46, 213, 115, 0.3)',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#2ED573' }}>
                +رغبة {cravingsToday > 0 ? `(${cravingsToday})` : ''}
              </Text>
            </TouchableOpacity>
          )}
          {onOpenSlipModal && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onOpenSlipModal(habit)}
              style={{
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                padding: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(231, 76, 60, 0.25)',
              }}
            >
              <Ionicons name="warning-outline" size={14} color="#E74C3C" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Delete button */}
      <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={theme.textDim} />
      </TouchableOpacity>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmActionModal
        visible={confirmDeleteVisible}
        theme={theme}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من رغبتك في حذف عادة "${habit.name}" نهائياً؟`}
        confirmText="حذف العادة"
        cancelText="إلغاء"
        isDestructive={true}
        iconName="trash-outline"
        onConfirm={() => {
          setConfirmDeleteVisible(false);
          onDeleteHabit && onDeleteHabit(habit.id);
        }}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
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
