import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { HeatmapGrid } from './HeatmapGrid';
import { calculateHabitStats } from '../utils/streakUtils';
import { getTodayString } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLogs;
  theme: ThemeColors;
  onToggleToday: (habitId: string) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onStartTimer?: (habit: Habit) => void;
  onTogglePin?: (habitId: string) => void;
  onPressCard: (habit: Habit) => void;
  onPressCell?: (dateStr: string) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const CATEGORY_NAMES: Record<string, { label: string; icon: string }> = {
  health: { label: 'صحة', icon: 'heart-outline' },
  fitness: { label: 'لياقة', icon: 'barbell-outline' },
  mind: { label: 'هدوء', icon: 'leaf-outline' },
  work: { label: 'عمل', icon: 'briefcase-outline' },
  learning: { label: 'تعلم', icon: 'book-outline' },
  lifestyle: { label: 'حياة', icon: 'sparkles-outline' },
};

const TIME_NAMES: Record<string, string> = {
  morning: '🌅 صباحاً',
  afternoon: '☀️ ظهراً',
  evening: '🌙 مساءً',
  anytime: '⏰ طوال اليوم',
};

const HabitCardComponent: React.FC<HabitCardProps> = ({
  habit,
  logs,
  theme,
  onToggleToday,
  onAdjustNumeric,
  onStartTimer,
  onTogglePin,
  onPressCard,
  onPressCell,
  onDeleteHabit,
}) => {
  const stats = calculateHabitStats(habit, logs);
  const todayStr = getTodayString();
  const habitLogs = logs[habit.id] || {};
  const currentTodayVal = habitLogs[todayStr] || 0;
  const targetVal = habit.targetValue || habit.targetPerDay || 1;
  const isTodayCompleted = currentTodayVal >= targetVal;

  const categoryMeta = CATEGORY_NAMES[habit.category] || CATEGORY_NAMES.lifestyle;
  const timeLabel = TIME_NAMES[habit.timeOfDay] || TIME_NAMES.anytime;

  const getStepDelta = () => {
    if (habit.unit === 'مل') return 250;
    if (habit.targetValue >= 1000) return 500;
    if (habit.targetValue >= 50) return 10;
    if (habit.targetValue >= 10) return 5;
    return 1;
  };

  const delta = getStepDelta();

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
      activeOpacity={0.92}
      onPress={() => onPressCard(habit)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isTodayCompleted ? `${habit.color}66` : theme.cardBorder,
        },
      ]}
    >
      {/* Top Meta Bar: Category, Time of Day, Pin, and Delete */}
      <View style={styles.topMetaBar}>
        <View style={styles.tagsRow}>
          <View style={[styles.tagPill, { backgroundColor: `${habit.color}15`, borderColor: `${habit.color}35` }]}>
            <Text style={[styles.tagText, { color: habit.color }]}>
              {categoryMeta.label}
            </Text>
          </View>
          <View style={[styles.tagPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.tagText, { color: theme.textMuted }]}>
              {timeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => onTogglePin && onTogglePin(habit.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconBtn}
          >
            <Ionicons
              name={habit.pinned ? 'star' : 'star-outline'}
              size={18}
              color={habit.pinned ? '#F59E0B' : theme.textDim}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconBtn}
          >
            <Ionicons name="trash-outline" size={17} color={theme.textDim} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${habit.color}22`,
                borderColor: `${habit.color}55`,
                shadowColor: habit.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
              },
            ]}
          >
            <Ionicons
              name={(habit.icon as any) || 'sparkles-outline'}
              size={22}
              color={habit.color}
            />
          </View>

          <View style={styles.titleInfo}>
            <Text style={[styles.habitName, { color: theme.text }]} numberOfLines={1}>
              {habit.name}
            </Text>
            {habit.description ? (
              <Text style={[styles.habitDesc, { color: theme.textMuted }]} numberOfLines={1}>
                {habit.description}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Action Controls by Habit Type */}
        {habit.type === 'boolean' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToggleToday(habit.id)}
            style={[
              styles.checkButton,
              {
                backgroundColor: isTodayCompleted ? habit.color : 'transparent',
                borderColor: isTodayCompleted ? habit.color : theme.border,
                shadowColor: isTodayCompleted ? habit.color : 'transparent',
                shadowOpacity: isTodayCompleted ? 0.45 : 0,
                shadowRadius: 8,
              },
            ]}
          >
            <Ionicons
              name={isTodayCompleted ? 'checkmark' : 'add'}
              size={22}
              color={isTodayCompleted ? '#FFFFFF' : theme.textMuted}
            />
          </TouchableOpacity>
        )}

        {habit.type === 'timer' && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onStartTimer && onStartTimer(habit)}
            style={[
              styles.timerLauncherBtn,
              {
                backgroundColor: isTodayCompleted ? `${habit.color}25` : `${habit.color}15`,
                borderColor: habit.color,
              },
            ]}
          >
            <Ionicons
              name={isTodayCompleted ? 'checkmark-circle' : 'play-circle'}
              size={18}
              color={habit.color}
            />
            <Text style={[styles.timerLauncherText, { color: habit.color }]}>
              {currentTodayVal >= targetVal ? 'مكتمل' : `${targetVal} د`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Goal Progress Banner if active */}
      {habit.goal && stats.goalProgressPercent !== undefined && (
        <View style={[styles.goalBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.goalBannerTop}>
            <Text style={[styles.goalBannerTitle, { color: habit.color }]}>
              🎯 {habit.goal.title || (habit.goal.type === 'streak' ? `هدف ستريك ${habit.goal.targetValue} يوم` : habit.goal.type === 'months' ? `الالتزام لـ ${habit.goal.targetValue} شهور` : `هدف ${habit.goal.targetValue} إنجاز`)}
            </Text>
            <Text style={[styles.goalBannerPercent, { color: stats.goalAchieved ? theme.success : habit.color }]}>
              {stats.goalAchieved ? '🏆 تم تحقيقه!' : `${stats.goalProgressPercent}%`}
            </Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.goalFill,
                {
                  width: `${stats.goalProgressPercent}%`,
                  backgroundColor: stats.goalAchieved ? theme.success : habit.color,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Inline Stepper for Numeric Habits */}
      {habit.type === 'numeric' && (
        <View style={[styles.numericRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.numericValueCol}>
            <Text style={[styles.numericCurrentText, { color: isTodayCompleted ? habit.color : theme.text }]}>
              {currentTodayVal} <Text style={{ fontSize: 12, color: theme.textMuted }}>/ {targetVal} {habit.unit || ''}</Text>
            </Text>
            <View style={[styles.miniBarTrack, { backgroundColor: theme.card }]}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${Math.min(100, (currentTodayVal / targetVal) * 100)}%`,
                    backgroundColor: habit.color,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.stepperActions}>
            <TouchableOpacity
              onPress={() => onAdjustNumeric && onAdjustNumeric(habit.id, -delta)}
              disabled={currentTodayVal <= 0}
              style={[styles.stepperBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Ionicons name="remove" size={16} color={currentTodayVal > 0 ? theme.text : theme.textDim} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onAdjustNumeric && onAdjustNumeric(habit.id, delta)}
              style={[styles.stepperBtn, { backgroundColor: habit.color, borderColor: habit.color }]}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Heatmap Grid */}
      <View style={styles.gridContainer}>
        <HeatmapGrid
          logs={habitLogs}
          habitColor={habit.color}
          targetCount={targetVal}
          theme={theme}
          weeksCount={15}
          cellSize={13}
          cellGap={3.5}
          onCellPress={(dStr) => {
            if (onPressCell) onPressCell(dStr);
            else onPressCard(habit);
          }}
        />
      </View>

      {/* Footer Stats Summary */}
      <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
        <View style={styles.footerItem}>
          <View style={styles.footerLabelRow}>
            <Text style={styles.footerEmoji}>🔥</Text>
            <Text style={[styles.footerLabel, { color: theme.textDim }]}>الستريك</Text>
          </View>
          <Text style={[styles.footerValue, { color: theme.text }]}>
            {stats.currentStreak} {stats.currentStreak === 1 ? 'يوم' : 'أيام'}
          </Text>
        </View>

        <View style={styles.footerDivider} />

        <View style={styles.footerItem}>
          <View style={styles.footerLabelRow}>
            <Text style={styles.footerEmoji}>📊</Text>
            <Text style={[styles.footerLabel, { color: theme.textDim }]}>الشهر</Text>
          </View>
          <Text style={[styles.footerValue, { color: habit.color }]}>
            {stats.completionRate30Days}%
          </Text>
        </View>

        <View style={styles.footerDivider} />

        <View style={styles.footerItem}>
          <View style={styles.footerLabelRow}>
            <Text style={styles.footerEmoji}>🏆</Text>
            <Text style={[styles.footerLabel, { color: theme.textDim }]}>الأفضل</Text>
          </View>
          <Text style={[styles.footerValue, { color: theme.text }]}>
            {stats.longestStreak} يوم
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HabitCard = memo(HabitCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  topMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 3,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  titleInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'right',
  },
  habitDesc: {
    fontSize: 12,
    textAlign: 'right',
  },
  checkButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLauncherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  timerLauncherText: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  goalBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalBannerPercent: {
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
  numericRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  numericValueCol: {
    flex: 1,
    marginRight: 12,
  },
  numericCurrentText: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  miniBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepperActions: {
    flexDirection: 'row',
    gap: 6,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    marginVertical: 4,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  footerEmoji: {
    fontSize: 11,
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  footerDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
