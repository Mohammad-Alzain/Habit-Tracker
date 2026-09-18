import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateHabitStats } from '../utils/streakUtils';
import { getLastNDays, getTodayString, parseISODate, getArabicDayShort } from '../utils/dateUtils';
import { ConfirmActionModal } from './common/ConfirmActionModal';

interface CompactWeeklyCardProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  style?: any;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onPressCard: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const CompactWeeklyCardComponent: React.FC<CompactWeeklyCardProps> = ({
  habit,
  logs,
  theme,
  style,
  onToggleDate,
  onPressCard,
  onDeleteHabit,
}) => {
  const stats = calculateHabitStats(habit, logs);
  const habitLogs = logs[habit.id] || {};
  const todayStr = getTodayString();
  const last7Days = getLastNDays(7);
  const targetVal = habit.targetValue || habit.targetPerDay || 1;
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const handleDelete = () => {
    setConfirmDeleteVisible(true);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
        style,
      ]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${habit.color}22`, borderColor: `${habit.color}55` },
            ]}
          >
            <Ionicons name={(habit.icon as any) || 'sparkles'} size={18} color={habit.color} />
          </View>
          <View style={styles.nameCol}>
            <Text style={[styles.habitName, { color: theme.text }]} numberOfLines={1}>
              {habit.name}
            </Text>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Ionicons name="flame" size={12} color="#F59E0B" />
              <Text style={[styles.subText, { color: theme.textDim }]}>
                {stats.currentStreak} يوم • {stats.completionRate30Days}% هذا الشهر
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color={theme.textDim} />
        </TouchableOpacity>
      </View>

      {/* Goal Progress Bar if active */}
      {habit.goal && stats.goalProgressPercent !== undefined && (
        <View style={styles.goalRow}>
          <View style={styles.goalLabelRow}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4, flex: 1 }}>
              <Ionicons name="flag-outline" size={12} color={habit.color} />
              <Text style={[styles.goalLabel, { color: habit.color }]} numberOfLines={1}>
                {habit.goal.title || (habit.goal.type === 'streak' ? `هدف ستريك ${habit.goal.targetValue} يوم` : `هدف ${habit.goal.targetValue} تكرار`)}
              </Text>
            </View>
            <Text style={[styles.goalPercent, { color: habit.color }]}>
              {stats.goalProgressPercent}%
            </Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: theme.surface }]}>
            <View style={[styles.goalFill, { width: `${stats.goalProgressPercent}%`, backgroundColor: habit.color }]} />
          </View>
        </View>
      )}

      {/* Last 7 Days Interactive Pills */}
      <View style={styles.weekPillsRow}>
        {last7Days.map((dateStr) => {
          const dObj = parseISODate(dateStr);
          const dayShort = getArabicDayShort(dObj.getDay());
          const isCompleted = (habitLogs[dateStr] || 0) >= targetVal;
          const isToday = dateStr === todayStr;

          return (
            <TouchableOpacity
              key={dateStr}
              activeOpacity={0.7}
              onPress={() => onToggleDate(habit.id, dateStr)}
              style={[
                styles.dayPill,
                {
                  backgroundColor: isCompleted ? habit.color : theme.surface,
                  borderColor: isToday ? habit.color : theme.border,
                  borderWidth: isToday ? 2 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayLetter,
                  {
                    color: isCompleted ? '#FFFFFF' : theme.textMuted,
                    fontWeight: isToday ? '800' : '600',
                  },
                ]}
              >
                {dayShort.slice(0, 1)}
              </Text>
              {isCompleted ? (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" style={{ marginTop: 2 }} />
              ) : (
                <View style={[styles.emptyDot, { backgroundColor: theme.textDim }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmActionModal
        visible={confirmDeleteVisible}
        theme={theme}
        title="تأكيد الحذف"
        message={`هل تريد بالتأكيد حذف عادة "${habit.name}" نهائياً؟`}
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

export const CompactWeeklyCard = memo(CompactWeeklyCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  nameCol: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  subText: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  goalRow: {
    marginBottom: 12,
  },
  goalLabelRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalPercent: {
    fontSize: 11,
    fontWeight: '800',
  },
  goalTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 2,
  },
  weekPillsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayPill: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLetter: {
    fontSize: 11,
  },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    opacity: 0.5,
  },
});
