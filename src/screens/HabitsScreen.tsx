import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitCategory, HabitLogs, ViewMode } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { HabitKitTile } from '../components/HabitKitTile';
import { ChecklistHabitCard } from '../components/ChecklistHabitCard';
import { CompactWeeklyCard } from '../components/CompactWeeklyCard';
import { HabitKitHeader } from '../components/HabitKitHeader';
import { calculateHabitStats } from '../utils/streakUtils';
import { getTodayString } from '../utils/dateUtils';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { t, isRTL, AppLanguage } from '../utils/i18n';

interface HabitsScreenProps {
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  viewMode: ViewMode;
  language?: AppLanguage;
  onToggleToday: (habitId: string) => void;
  onTogglePastDate: (habitId: string, dateStr: string) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onStartTimer?: (habit: Habit) => void;
  onPressHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddNew: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenWidgets?: () => void;
  onOpenTemplates?: () => void;
  onOpenMilestones?: () => void;
  onOpenStacks?: () => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  habits,
  logs,
  theme,
  viewMode,
  language = 'ar',
  onToggleToday,
  onTogglePastDate,
  onAdjustNumeric,
  onStartTimer,
  onPressHabit,
  onDeleteHabit,
  onAddNew,
  onOpenSettings,
  onOpenAnalytics,
  onOpenWidgets,
  onOpenTemplates,
  onOpenMilestones,
  onOpenStacks,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'completed' | 'streak'>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showTwoDayBanner, setShowTwoDayBanner] = useState(true);
  const rtl = isRTL(language);

  const todayStr = getTodayString();
  const activeHabits = habits.filter((h) => !h.archived);

  const handleToggleFilterVisibility = () => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // Safe fallback
    }
    setShowFilters((prev) => !prev);
  };

  const handleToggleTodayWithEffects = React.useCallback((habitId: string) => {
    soundService.playComplete();
    hapticService.success();
    onToggleToday(habitId);
  }, [onToggleToday]);

  const handleTogglePastDateWithEffects = React.useCallback((habitId: string, dateStr: string) => {
    soundService.playComplete();
    hapticService.light();
    onTogglePastDate(habitId, dateStr);
  }, [onTogglePastDate]);

  const handleAdjustNumericWithEffects = React.useCallback((habitId: string, delta: number) => {
    if (delta > 0) {
      soundService.playTap();
      hapticService.light();
    } else {
      hapticService.light();
    }
    onAdjustNumeric && onAdjustNumeric(habitId, delta);
  }, [onAdjustNumeric]);

  // Daily focus summary stats
  const totalActiveCount = activeHabits.length;
  let todayCompletedCount = 0;
  let todayFocusMinutes = 0;

  for (const h of activeHabits) {
    const val = logs[h.id]?.[todayStr] || 0;
    const thresh = h.targetValue || h.targetPerDay || 1;
    if (val >= thresh) {
      todayCompletedCount++;
    }
    if (h.type === 'timer') {
      todayFocusMinutes += val;
    }
  }

  const todayPercent = totalActiveCount > 0
    ? Math.round((todayCompletedCount / totalActiveCount) * 100)
    : 0;

  // Check Two-Day Rule: habits missed yesterday and not done today
  const atRiskHabits = activeHabits.filter((h) => {
    const stats = calculateHabitStats(h, logs);
    return stats.missedYesterday;
  });

  // Filter habits by category & quick filter
  let displayHabits = activeHabits.filter((h) => {
    return selectedCategory === 'all' || h.category === selectedCategory;
  });

  if (quickFilter === 'pending') {
    displayHabits = displayHabits.filter((h) => {
      const threshold = h.targetValue || h.targetPerDay || 1;
      return (logs[h.id]?.[todayStr] || 0) < threshold;
    });
  } else if (quickFilter === 'completed') {
    displayHabits = displayHabits.filter((h) => {
      const threshold = h.targetValue || h.targetPerDay || 1;
      return (logs[h.id]?.[todayStr] || 0) >= threshold;
    });
  } else if (quickFilter === 'streak') {
    displayHabits = [...displayHabits].sort((a, b) => {
      const sA = calculateHabitStats(a, logs).currentStreak;
      const sB = calculateHabitStats(b, logs).currentStreak;
      return sB - sA;
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <HabitKitHeader
        theme={theme}
        language={language}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenSettings={onOpenSettings}
        onOpenAnalytics={onOpenAnalytics}
        onAddNew={onAddNew}
        onOpenWidgets={onOpenWidgets}
        onOpenTemplates={onOpenTemplates}
        onOpenMilestones={onOpenMilestones}
        onOpenStacks={onOpenStacks}
        onToggleFilter={handleToggleFilterVisibility}
        isFilterHidden={!showFilters}
      />

      {/* Quick Filters Bar (Collapsible with smooth animation) */}
      {showFilters && (
        <View style={[styles.quickFilterBar, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          {[
            { id: 'all', label: t('all', language) },
            { id: 'pending', label: t('pending', language) },
            { id: 'completed', label: t('completed', language) },
            { id: 'streak', label: t('streak', language) },
          ].map((f) => {
            const isSel = quickFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  hapticService.selection();
                  setQuickFilter(f.id as any);
                }}
                style={[
                  styles.quickFilterChip,
                  {
                    backgroundColor: isSel ? '#7C83FD' : theme.surface,
                    borderColor: isSel ? '#7C83FD' : theme.border,
                  },
                ]}
              >
                <Text style={[styles.quickFilterText, { color: isSel ? '#FFFFFF' : theme.textDim }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Smart Daily Focus Summary Card */}
        {totalActiveCount > 0 && (
          <View
            style={[
              styles.dailySummaryCard,
              {
                backgroundColor: theme.glassSurface || theme.card,
                borderColor: theme.glassBorder || theme.cardBorder,
                borderTopColor: theme.glassSpecular || 'rgba(255,255,255,0.24)',
              },
            ]}
          >
            <View style={styles.dailySummaryRow}>
              <View style={styles.dailySummaryStats}>
                <View style={styles.dailyBadgeRow}>
                  <View style={[styles.dailyPercentBadge, { backgroundColor: todayCompletedCount === totalActiveCount ? 'rgba(46, 204, 113, 0.2)' : 'rgba(124, 131, 253, 0.18)' }]}>
                    <Text style={[styles.dailyPercentText, { color: todayCompletedCount === totalActiveCount ? '#2ECC71' : '#7C83FD' }]}>
                      {todayPercent}%
                    </Text>
                  </View>
                  <Text style={[styles.dailySummaryTitle, { color: theme.text }]}>
                    {todayCompletedCount} من {totalActiveCount} عادات منجزة اليوم
                  </Text>
                </View>

                {todayFocusMinutes > 0 && (
                  <View style={[styles.focusMinutesPill, { backgroundColor: 'rgba(0, 206, 201, 0.15)', borderColor: 'rgba(0, 206, 201, 0.3)' }]}>
                    <Ionicons name="timer-outline" size={12} color="#00CEC9" />
                    <Text style={styles.focusMinutesText}>
                      {todayFocusMinutes} دقيقة تركيز
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Micro progress line */}
            <View style={[styles.summaryTrack, { backgroundColor: theme.surface }]}>
              <View
                style={[
                  styles.summaryFill,
                  {
                    width: `${todayPercent}%`,
                    backgroundColor: todayCompletedCount === totalActiveCount ? '#2ECC71' : '#7C83FD',
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Two-Day Rule Alert Banner (Atomic Habits) */}
        {showTwoDayBanner && atRiskHabits.length > 0 && (
          <View style={[styles.atRiskBanner, { backgroundColor: 'rgba(231, 76, 60, 0.12)', borderColor: 'rgba(231, 76, 60, 0.35)' }]}>
            <View style={styles.atRiskHeaderRow}>
              <TouchableOpacity onPress={() => setShowTwoDayBanner(false)}>
                <Ionicons name="close" size={18} color={theme.textDim} />
              </TouchableOpacity>
              <View style={styles.atRiskTitleWrap}>
                <Text style={styles.atRiskTitle}>قاعدة عدم الانقطاع مرتين ⚠️</Text>
                <Ionicons name="flame" size={16} color="#E74C3C" />
              </View>
            </View>
            <Text style={[styles.atRiskDesc, { color: theme.text }]}>
              انتبه: لم تسجل عادة{' '}
              <Text style={{ fontWeight: '800', color: '#E74C3C' }}>
                "{atRiskHabits.map((h) => h.name).slice(0, 2).join('، ')}"
              </Text>{' '}
              بالأمس! قاعدة العادات الذرية تنص: "لا تنقطع مرتين أبداً". أكملها اليوم لحماية مسارك.
            </Text>
          </View>
        )}

        {displayHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
              <Ionicons name="sparkles-outline" size={40} color="#7C83FD" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>لا توجد عادات مطابقة</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              {quickFilter !== 'all'
                ? 'جرب اختيار فلتر "الكل" لعرض كافة العادات'
                : 'اضغط زر + الأرجواني في الأعلى لإنشاء عادة جديدة'}
            </Text>
          </View>
        ) : (
          <View style={viewMode === 'heatmap' ? styles.gridRowWrap : styles.listColWrap}>
            {displayHabits.map((habit) => {
              if (viewMode === 'checklist') {
                return (
                  <ChecklistHabitCard
                    key={habit.id}
                    habit={habit}
                    logs={logs}
                    theme={theme}
                    onToggleToday={handleToggleTodayWithEffects}
                    onAdjustNumeric={handleAdjustNumericWithEffects}
                    onStartTimer={onStartTimer}
                    onPressCard={(h) => {
                      hapticService.light();
                      onPressHabit(h);
                    }}
                    onDeleteHabit={onDeleteHabit}
                  />
                );
              }

              if (viewMode === 'compact') {
                return (
                  <CompactWeeklyCard
                    key={habit.id}
                    habit={habit}
                    logs={logs}
                    theme={theme}
                    onToggleDate={handleTogglePastDateWithEffects}
                    onPressCard={(h) => {
                      hapticService.light();
                      onPressHabit(h);
                    }}
                    onDeleteHabit={onDeleteHabit}
                  />
                );
              }

              // Default: 2-Column Grid matching HabitKit
              return (
                <HabitKitTile
                  key={habit.id}
                  habit={habit}
                  logs={logs}
                  theme={theme}
                  onToggleToday={handleToggleTodayWithEffects}
                  onStartTimer={onStartTimer}
                  onAdjustNumeric={handleAdjustNumericWithEffects}
                  onPressCard={(h) => {
                    hapticService.light();
                    onPressHabit(h);
                  }}
                  onDeleteHabit={onDeleteHabit}
                />
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  quickFilterBar: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  quickFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  atRiskBanner: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 12,
  },
  atRiskHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  atRiskTitleWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  atRiskTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#E74C3C',
  },
  atRiskDesc: {
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'right',
  },
  gridRowWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listColWrap: {
    flexDirection: 'column',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  dailySummaryCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 12,
  },
  dailySummaryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dailySummaryStats: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  dailyPercentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dailyPercentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dailySummaryTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  focusMinutesPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  focusMinutesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CEC9',
  },
  summaryTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  summaryFill: {
    height: '100%',
    borderRadius: 2,
  },
});
