import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateGlobalStats, calculateHabitStats } from '../utils/streakUtils';
import { getArabicDayShort, getArabicDayName, getLastNDays, parseISODate, formatFriendlyDate } from '../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { ChartDetailData } from './ChartDetailModal';

interface AnalyticsChartsProps {
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  onShowDetail: (data: ChartDetailData) => void;
  onPressHabit: (habit: Habit) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  habits,
  logs,
  theme,
  onShowDetail,
  onPressHabit,
}) => {
  const globalStats = calculateGlobalStats(habits, logs);
  const maxDayCount = Math.max(...globalStats.weekdayDistribution, 1);

  // Calculate last 7 days overall completion %
  const last7Days = getLastNDays(7);
  const last7DaysData = last7Days.map((dateStr) => {
    let completedCount = 0;
    const completedIds: string[] = [];
    const missedIds: string[] = [];

    for (const habit of habits) {
      const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
      if ((logs[habit.id]?.[dateStr] || 0) >= targetThreshold) {
        completedCount++;
        completedIds.push(habit.id);
      } else {
        missedIds.push(habit.id);
      }
    }
    const rate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    return { dateStr, rate, completedCount, completedIds, missedIds };
  });

  // Sort habits by current streak and completion rate
  const rankedHabits = habits
    .map((h) => ({
      habit: h,
      stats: calculateHabitStats(h, logs),
    }))
    .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);

  // Handle click on weekday bar
  const handleWeekdayPress = (dayIdx: number, count: number) => {
    const dayName = getArabicDayName(dayIdx);
    const completedIds: string[] = [];

    for (const habit of habits) {
      const hLogs = logs[habit.id] || {};
      const targetThreshold = habit.targetValue || habit.targetPerDay || 1;
      let hasCompletedOnDay = false;
      for (const dStr of Object.keys(hLogs)) {
        if (parseISODate(dStr).getDay() === dayIdx && (hLogs[dStr] || 0) >= targetThreshold) {
          hasCompletedOnDay = true;
          break;
        }
      }
      if (hasCompletedOnDay) {
        completedIds.push(habit.id);
      }
    }

    onShowDetail({
      type: 'weekday',
      title: `إحصائيات يوم ${dayName}`,
      subtitle: `سجل النشاط التراكمي في أيام ${dayName}`,
      totalCompletions: count,
      completedHabitIds: completedIds,
    });
  };

  // Handle click on 7-day circle
  const handleCirclePress = (item: typeof last7DaysData[0]) => {
    const friendly = formatFriendlyDate(item.dateStr, 'ar');
    onShowDetail({
      type: 'day_circle',
      title: `نشاط ${friendly}`,
      subtitle: `تاريخ ${item.dateStr}`,
      completionRate: item.rate,
      totalCompletions: item.completedCount,
      completedHabitIds: item.completedIds,
      missedHabitIds: item.missedIds,
    });
  };

  return (
    <View style={styles.container}>
      {/* Weekday Distribution Chart */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            نشاط العادات حسب أيام الأسبوع
          </Text>
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
          اضغط على أي يوم لعرض تفاصيل الإنجاز فيه
        </Text>

        <View style={styles.barChartContainer}>
          {globalStats.weekdayDistribution.map((count, dayIdx) => {
            const heightPercent = Math.max(8, Math.round((count / maxDayCount) * 100));
            const isHighest = count === maxDayCount && count > 0;
            return (
              <TouchableOpacity
                key={dayIdx}
                activeOpacity={0.7}
                onPress={() => handleWeekdayPress(dayIdx, count)}
                style={styles.barColumn}
              >
                <Text style={[styles.barValueText, { color: theme.textDim }]}>
                  {count > 0 ? count : ''}
                </Text>
                <View style={[styles.barTrack, { backgroundColor: theme.surface }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: isHighest ? theme.primary : `${theme.primary}88`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barDayLabel,
                    { color: isHighest ? theme.primary : theme.textMuted },
                  ]}
                >
                  {getArabicDayShort(dayIdx)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 7-Day Performance Trend */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up-outline" size={20} color="#10B981" />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            أداء آخر 7 أيام
          </Text>
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
          اضغط على أي يوم لعرض العادات المنجزة والناقصة
        </Text>

        <View style={styles.trendRow}>
          {last7DaysData.map((item, idx) => {
            const [y, m, d] = item.dateStr.split('-');
            const isToday = idx === last7DaysData.length - 1;
            return (
              <TouchableOpacity
                key={item.dateStr}
                activeOpacity={0.7}
                onPress={() => handleCirclePress(item)}
                style={styles.trendItem}
              >
                <View
                  style={[
                    styles.trendCircle,
                    {
                      backgroundColor:
                        item.rate >= 80
                          ? '#10B981'
                          : item.rate >= 40
                          ? '#F59E0B'
                          : item.rate > 0
                          ? '#EF4444'
                          : theme.surface,
                      borderColor: isToday ? theme.primary : 'transparent',
                      borderWidth: isToday ? 2 : 0,
                    },
                  ]}
                >
                  <Text style={styles.trendPercentText}>{item.rate}%</Text>
                </View>
                <Text style={[styles.trendDateText, { color: isToday ? theme.primary : theme.textMuted }]}>
                  {isToday ? 'اليوم' : `${d}/${m}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Leaderboard of Top Habits */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            ترتيب العادات حسب الاستمرارية
          </Text>
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
          اضغط على أي عادة لعرض تقويمها وتفاصيلها الكاملة
        </Text>

        {rankedHabits.map((item, index) => (
          <TouchableOpacity
            key={item.habit.id}
            activeOpacity={0.7}
            onPress={() => onPressHabit(item.habit)}
            style={[
              styles.leaderboardRow,
              { borderBottomColor: theme.cardBorder },
              index === rankedHabits.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.leaderboardRankBox}>
              <Text
                style={[
                  styles.leaderboardRank,
                  {
                    color:
                      index === 0
                        ? '#F59E0B'
                        : index === 1
                        ? '#94A3B8'
                        : index === 2
                        ? '#B45309'
                        : theme.textDim,
                  },
                ]}
              >
                #{index + 1}
              </Text>
            </View>

            <View
              style={[
                styles.habitIconBox,
                { backgroundColor: `${item.habit.color}22`, borderColor: `${item.habit.color}55` },
              ]}
            >
              <Ionicons
                name={(item.habit.icon as any) || 'sparkles-outline'}
                size={18}
                color={item.habit.color}
              />
            </View>

            <View style={styles.habitMeta}>
              <Text style={[styles.habitTitle, { color: theme.text }]} numberOfLines={1}>
                {item.habit.name}
              </Text>
              <Text style={[styles.habitSub, { color: theme.textDim }]}>
                {item.stats.totalCompletions} إنجاز • {item.stats.completionRate30Days}% هذا الشهر
              </Text>
            </View>

            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={[styles.streakNumber, { color: theme.text }]}>
                {item.stats.currentStreak}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 16,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValueText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    height: 14,
  },
  barTrack: {
    width: 24,
    height: 80,
    justifyContent: 'flex-end',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barDayLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  trendItem: {
    alignItems: 'center',
  },
  trendCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trendPercentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  trendDateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leaderboardRankBox: {
    width: 26,
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: '800',
  },
  habitIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  habitMeta: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  habitSub: {
    fontSize: 11,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakFire: {
    fontSize: 14,
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
});
