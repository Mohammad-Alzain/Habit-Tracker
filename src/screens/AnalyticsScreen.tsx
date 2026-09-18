import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateGlobalStats, calculateHabitStats } from '../utils/streakUtils';
import { calculateBehavioralAnalytics } from '../utils/behavioralAnalytics';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { getLastNDays, formatFriendlyDate, getTodayString } from '../utils/dateUtils';
import { ChartDetailModal, ChartDetailData } from '../components/ChartDetailModal';

interface AnalyticsScreenProps {
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  onSelectHabit?: (habit: Habit) => void;
  onOpenStudies?: () => void;
  onOpenWeeklyReview?: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ habits, logs, theme, onSelectHabit, onOpenStudies, onOpenWeeklyReview }) => {
  const globalStats = calculateGlobalStats(habits, logs);
  const behavioral = calculateBehavioralAnalytics(habits, logs);
  const activeHabits = habits.filter((h) => !h.archived);
  const todayStr = getTodayString();

  // Weekly Review / Digest calculations (last 7 days)
  const last7Days = getLastNDays(7);
  let weeklyCompletions = 0;
  const weeklyPossible = activeHabits.length * 7;
  for (const h of activeHabits) {
    const hLogs = logs[h.id] || {};
    const target = h.targetValue || h.targetPerDay || 1;
    for (const d of last7Days) {
      if ((hLogs[d] || 0) >= target) weeklyCompletions++;
    }
  }
  const weeklyRate = weeklyPossible > 0 ? Math.round((weeklyCompletions / weeklyPossible) * 100) : 0;

  const [detailModalData, setDetailModalData] = useState<ChartDetailData | null>(null);

  // Consistency Score (0 - 100%)
  let total30DayRates = 0;
  for (const h of activeHabits) {
    const s = calculateHabitStats(h, logs);
    total30DayRates += s.completionRate30Days;
  }
  const consistencyScore = activeHabits.length > 0 ? Math.round(total30DayRates / activeHabits.length) : 0;

  // Month-over-Month Comparison (Last 30 days vs previous 30 days)
  const days60 = getLastNDays(60);
  const last30Days = days60.slice(0, 30);
  const prev30Days = days60.slice(30, 60);

  let countLast30 = 0;
  let countPrev30 = 0;

  for (const h of activeHabits) {
    const hLogs = logs[h.id] || {};
    const target = h.targetValue || h.targetPerDay || 1;
    for (const d of last30Days) {
      if ((hLogs[d] || 0) >= target) countLast30++;
    }
    for (const d of prev30Days) {
      if ((hLogs[d] || 0) >= target) countPrev30++;
    }
  }

  let momChange = 0;
  if (countPrev30 > 0) {
    momChange = Math.round(((countLast30 - countPrev30) / countPrev30) * 100);
  } else if (countLast30 > 0) {
    momChange = 100;
  }

  // Time-of-Day Distribution
  const timeOfDayCounts = {
    morning: { label: 'الصباح', count: 0, completed: 0, icon: 'sunny-outline', color: '#F39C12' },
    afternoon: { label: 'المساء', count: 0, completed: 0, icon: 'partly-sunny-outline', color: '#E67E22' },
    evening: { label: 'الليل', count: 0, completed: 0, icon: 'moon-outline', color: '#575FCF' },
    anytime: { label: 'أي وقت', count: 0, completed: 0, icon: 'time-outline', color: '#00CEC9' },
  };

  for (const h of activeHabits) {
    const tod = (h.timeOfDay || 'anytime') as keyof typeof timeOfDayCounts;
    if (timeOfDayCounts[tod]) {
      timeOfDayCounts[tod].count++;
      if ((logs[h.id]?.[todayStr] || 0) >= (h.targetValue || h.targetPerDay || 1)) {
        timeOfDayCounts[tod].completed++;
      }
    }
  }

  // Year in Pixels (Last 52 weeks = 364 days)
  const days364 = getLastNDays(364);
  const weeksColumns: { dateStr: string; intensity: number; completedCount: number; completedIds: string[]; missedIds: string[] }[][] = [];
  const totalWeeks = 52;

  for (let w = 0; w < totalWeeks; w++) {
    const col: { dateStr: string; intensity: number; completedCount: number; completedIds: string[]; missedIds: string[] }[] = [];
    for (let r = 0; r < 7; r++) {
      const idx = w * 7 + r;
      const dateStr = days364[idx];
      let completedCount = 0;
      const completedIds: string[] = [];
      const missedIds: string[] = [];

      if (dateStr) {
        for (const h of activeHabits) {
          const targetThreshold = h.targetValue || h.targetPerDay || 1;
          if ((logs[h.id]?.[dateStr] || 0) >= targetThreshold) {
            completedCount++;
            completedIds.push(h.id);
          } else {
            missedIds.push(h.id);
          }
        }
      }
      const intensity = activeHabits.length > 0 ? completedCount / activeHabits.length : 0;
      col.push({ dateStr, intensity, completedCount, completedIds, missedIds });
    }
    weeksColumns.push(col);
  }

  const handlePixelPress = (cell: typeof weeksColumns[0][0]) => {
    const friendly = formatFriendlyDate(cell.dateStr, 'ar');
    const rate = activeHabits.length > 0 ? Math.round((cell.completedCount / activeHabits.length) * 100) : 0;
    setDetailModalData({
      type: 'year_pixel',
      title: `سجل ${friendly}`,
      subtitle: `تاريخ ${cell.dateStr}`,
      completionRate: rate,
      totalCompletions: cell.completedCount,
      completedHabitIds: cell.completedIds,
      missedHabitIds: cell.missedIds,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      {/* 4 Summary Cards Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="list-outline" size={20} color="#6366F1" />
          </View>
          <Text style={[styles.metricNumber, { color: theme.text }]}>
            {globalStats.totalHabits}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>عادات نشطة</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="checkmark-done" size={20} color="#10B981" />
          </View>
          <Text style={[styles.metricNumber, { color: theme.text }]}>
            {globalStats.totalCompletionsAll}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>إجمالي الإنجازات</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.metricNumber, { color: theme.text }]}>
            {globalStats.bestStreakAll}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>أفضل ستريك</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="pie-chart" size={20} color="#06B6D4" />
          </View>
          <Text style={[styles.metricNumber, { color: theme.text }]}>
            {globalStats.todayCompletionRate}%
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>إنجاز اليوم</Text>
        </View>
      </View>

      {/* Weekly Review (حصاد الأسبوع) Summary Card */}
      <View
        style={[
          styles.weeklyDigestCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
            shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: theme.text === '#FFFFFF' ? 0.28 : 0.08,
            shadowRadius: 12,
            elevation: 4,
          },
        ]}
      >
        <View style={styles.weeklyDigestHeader}>
          <View style={styles.weeklyDigestTitleRow}>
            <View style={[styles.weeklyDigestIconCircle, { backgroundColor: 'rgba(46, 213, 115, 0.16)' }]}>
              <Ionicons name="ribbon-outline" size={22} color="#2ED573" />
            </View>
            <View style={styles.weeklyDigestTextWrap}>
              <Text style={[styles.weeklyDigestTitle, { color: theme.text }]}>
                حصاد الأسبوع (Weekly Review)
              </Text>
              <Text style={[styles.weeklyDigestSubtitle, { color: theme.textMuted }]}>
                نسبة إنجاز {weeklyRate}% خلال آخر 7 أيام ({weeklyCompletions} عادة منجزة)
              </Text>
            </View>
          </View>

          {onOpenWeeklyReview && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOpenWeeklyReview}
              style={[styles.weeklyDigestBtn, { backgroundColor: '#2ED573' }]}
            >
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.weeklyDigestBtnText}>عرض الحصاد</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Micro progress bar */}
        <View style={[styles.weeklyProgressBarTrack, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.weeklyProgressBarFill,
              {
                width: `${weeklyRate}%`,
                backgroundColor: weeklyRate >= 80 ? '#2ED573' : weeklyRate >= 50 ? '#7C83FD' : '#F59E0B',
              },
            ]}
          />
        </View>
      </View>

      {/* Year-in-Pixels 365 Days Extended Heatmap Matrix */}
      <View style={[styles.yearCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.yearHeader}>
          <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          <Text style={[styles.yearTitle, { color: theme.text }]}>
            مصفوفة العام الكامل (Year in Pixels)
          </Text>
        </View>
        <Text style={[styles.yearDesc, { color: theme.textMuted }]}>
          اضغط على أي مربع لمعرفة تاريخه والعادات التي تم إنجازها
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
          <View style={styles.yearGrid}>
            {weeksColumns.map((col, wIdx) => (
              <View key={`yw-${wIdx}`} style={styles.yearCol}>
                {col.map((cell, rIdx) => {
                  let cellBg = theme.emptyCell;
                  if (cell.intensity > 0.8) cellBg = '#10B981';
                  else if (cell.intensity > 0.5) cellBg = '#059669';
                  else if (cell.intensity > 0.2) cellBg = '#047857';
                  else if (cell.intensity > 0) cellBg = '#065F46';

                  return (
                    <TouchableOpacity
                      key={`yc-${rIdx}`}
                      activeOpacity={0.6}
                      onPress={() => handlePixelPress(cell)}
                      style={[
                        styles.yearPixel,
                        {
                          backgroundColor: cellBg,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legendRow}>
          <Text style={[styles.legendText, { color: theme.textDim }]}>أقل</Text>
          <View style={[styles.legendSquare, { backgroundColor: theme.emptyCell }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#065F46' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#047857' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#059669' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: theme.textDim }]}>أعلى</Text>
        </View>
      </View>

      {/* Best Performing Habit Callout */}
      {globalStats.bestHabit && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onSelectHabit && onSelectHabit(globalStats.bestHabit!)}
          style={[
            styles.highlightBanner,
            {
              backgroundColor: `${globalStats.bestHabit.color}15`,
              borderColor: `${globalStats.bestHabit.color}40`,
            },
          ]}
        >
          <View style={styles.highlightHeader}>
            <Ionicons name="ribbon-outline" size={22} color={globalStats.bestHabit.color} />
            <Text style={[styles.highlightTitle, { color: theme.text }]}>العادة الأكثر التزاماً (اضغط للتفاصيل)</Text>
          </View>
          <Text style={[styles.highlightName, { color: globalStats.bestHabit.color }]}>
            {globalStats.bestHabit.name}
          </Text>
          <Text style={[styles.highlightDesc, { color: theme.textMuted }]}>
            حققت أطول سلسلة متتالية بلغت {globalStats.bestStreakAll} يوماً متواصلاً! اضغط لمشاهدة التقويم الكامل.
          </Text>
        </TouchableOpacity>
      )}

      {/* Consistency Score & Month-over-Month Growth Row */}
      <View style={styles.deepAnalyticsRow}>
        {/* Consistency Score Card */}
        <View style={[styles.consistencyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.miniCircle, { backgroundColor: 'rgba(124, 131, 253, 0.15)' }]}>
              <Ionicons name="speedometer-outline" size={18} color="#7C83FD" />
            </View>
            <Text style={[styles.subCardTitle, { color: theme.text }]}>مؤشر الانضباط</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: '#7C83FD' }]}>{consistencyScore}%</Text>
            <View style={[styles.tierBadge, {
              backgroundColor: consistencyScore >= 80 ? '#10B98125' : consistencyScore >= 50 ? '#F39C1225' : '#E74C3C25'
            }]}>
              <Text style={[styles.tierText, {
                color: consistencyScore >= 80 ? '#10B981' : consistencyScore >= 50 ? '#F39C12' : '#E74C3C'
              }]}>
                {consistencyScore >= 85 ? 'مثالي' : consistencyScore >= 70 ? 'ممتاز' : consistencyScore >= 50 ? 'جيد' : 'يحتاج تركيز'}
              </Text>
            </View>
          </View>
          <Text style={[styles.subCardDesc, { color: theme.textMuted }]}>
            متوسط التزامك بجميع العادات لـ 30 يوماً
          </Text>
        </View>

        {/* Month-over-Month Growth Card */}
        <View style={[styles.consistencyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.miniCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name={momChange >= 0 ? "trending-up" : "trending-down"} size={18} color={momChange >= 0 ? "#10B981" : "#EF4444"} />
            </View>
            <Text style={[styles.subCardTitle, { color: theme.text }]}>النمو الشهري</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: momChange >= 0 ? "#10B981" : "#EF4444" }]}>
              {momChange >= 0 ? `+${momChange}%` : `${momChange}%`}
            </Text>
            <View style={[styles.tierBadge, { backgroundColor: momChange >= 0 ? '#10B98120' : '#EF444420' }]}>
              <Text style={[styles.tierText, { color: momChange >= 0 ? '#10B981' : '#EF4444' }]}>
                {countLast30} مقابل {countPrev30}
              </Text>
            </View>
          </View>
          <Text style={[styles.subCardDesc, { color: theme.textMuted }]}>
            مقارنة الإنجازات بـ 30 يوماً سابقة
          </Text>
        </View>
      </View>

      {/* Time-of-Day Distribution Card */}
      <View style={[styles.timeOfDayCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="time-outline" size={18} color="#00CEC9" />
          <Text style={[styles.subCardTitle, { color: theme.text, marginLeft: 6 }]}>توزيع العادات حسب فترات اليوم</Text>
        </View>
        <View style={styles.todRow}>
          {Object.entries(timeOfDayCounts).map(([key, item]) => (
            <View key={key} style={[styles.todPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name={item.icon as any} size={15} color={item.color} />
              <Text style={[styles.todLabel, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.todCount, { color: item.color }]}>{item.completed}/{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Behavioral Persona Card */}
      <View style={[styles.personaCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.personaHeader}>
          <View style={[styles.iconCircle, { backgroundColor: behavioral.persona.badgeColor + '20' }]}>
            <Ionicons name={behavioral.persona.icon as any} size={22} color={behavioral.persona.badgeColor} />
          </View>
          <View style={styles.personaTitleContainer}>
            <View style={styles.personaBadgeRow}>
              <Text style={[styles.personaTitle, { color: theme.text }]}>{behavioral.persona.title}</Text>
              <View style={[styles.personaBadge, { backgroundColor: behavioral.persona.badgeColor + '20' }]}>
                <Text style={[styles.personaBadgeText, { color: behavioral.persona.badgeColor }]}>النمط السلوكي</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={[styles.personaDesc, { color: theme.textMuted }]}>
          {behavioral.persona.description}
        </Text>
      </View>

      {/* Golden Day & Critical Day Card */}
      <View style={[styles.behavioralCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="sparkles" size={18} color="#F59E0B" />
          <Text style={[styles.subCardTitle, { color: theme.text, marginLeft: 6 }]}>
            تحليل الأيام: اليوم الذهبي واليوم الحرج
          </Text>
        </View>

        <View style={styles.daysComparisonRow}>
          {/* Golden Day */}
          <View style={[styles.dayHighlightBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <View style={styles.dayHighlightHeader}>
              <Ionicons name="sparkles" size={15} color="#F59E0B" />
              <Text style={[styles.dayHighlightLabel, { color: '#F59E0B' }]}>اليوم الذهبي (الأعلى)</Text>
            </View>
            <Text style={[styles.dayNameText, { color: theme.text }]}>
              {behavioral.goldenDay ? behavioral.goldenDay.name : '—'}
            </Text>
            <Text style={[styles.dayRateText, { color: '#F59E0B' }]}>
              {behavioral.goldenDay ? `${behavioral.goldenDay.completionRate}% إنجاز` : 'بانتظار البيانات'}
            </Text>
          </View>

          {/* Critical Day */}
          <View style={[styles.dayHighlightBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <View style={styles.dayHighlightHeader}>
              <Ionicons name="alert-circle" size={15} color="#EF4444" />
              <Text style={[styles.dayHighlightLabel, { color: '#EF4444' }]}>اليوم الحرج (الأدنى)</Text>
            </View>
            <Text style={[styles.dayNameText, { color: theme.text }]}>
              {behavioral.criticalDay ? behavioral.criticalDay.name : '—'}
            </Text>
            <Text style={[styles.dayRateText, { color: '#EF4444' }]}>
              {behavioral.criticalDay ? `${behavioral.criticalDay.completionRate}% إنجاز` : 'بانتظار البيانات'}
            </Text>
          </View>
        </View>

        {/* 7-day completion rate micro bars */}
        <Text style={[styles.weekdaysBreakdownTitle, { color: theme.textMuted }]}>
          نسبة الالتزام عبر أيام الأسبوع (السبت إلى الجمعة):
        </Text>
        <View style={styles.weekdaysBarContainer}>
          {behavioral.weekdayBreakdown.map((item) => {
            const isGolden = behavioral.goldenDay?.dayIndex === item.dayIndex;
            const isCritical = behavioral.criticalDay?.dayIndex === item.dayIndex;
            const barColor = isGolden ? '#F59E0B' : isCritical ? '#EF4444' : theme.primary;

            return (
              <View key={`wb-${item.dayIndex}`} style={styles.weekdayCol}>
                <Text style={[styles.weekdayColRate, { color: barColor }]}>
                  {item.completionRate}%
                </Text>
                <View style={[styles.weekdayBarTrack, { backgroundColor: theme.surface }]}>
                  <View
                    style={[
                      styles.weekdayBarFill,
                      {
                        height: `${Math.max(item.completionRate, 6)}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.weekdayColName, { color: theme.textMuted }]}>
                  {item.name.substring(0, 2)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bounce-Back Resilience & Keystone Habit Row */}
      {(() => {
        const RESILIENCE_TIERS: Record<string, { label: string; color: string; desc: string }> = {
          steel: {
            label: 'فولاذي',
            color: '#10B981',
            desc: 'تطبيق رائع لقاعدة جيمس كلير: لا تنقطع مرتين أبداً!',
          },
          excellent: {
            label: 'ممتاز',
            color: '#3498DB',
            desc: 'تستعيد مسارك بسرعة بعد أي تعثر عابر.',
          },
          moderate: {
            label: 'جيد',
            color: '#F39C12',
            desc: 'تعافٍ مقبول، احرص على تدارك الغياب في اليوم التالي.',
          },
          needs_focus: {
            label: 'يحتاج تركيز',
            color: '#E74C3C',
            desc: 'الانقطاع المتتابع يكسر الزخم العصبي، عد سريعاً!',
          },
        };
        const resilienceTier = RESILIENCE_TIERS[behavioral.resilienceRating] || RESILIENCE_TIERS.excellent;

        return (
          <View style={styles.deepAnalyticsRow}>
            {/* Bounce-Back Resilience */}
            <View style={[styles.consistencyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.miniCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                </View>
                <Text style={[styles.subCardTitle, { color: theme.text }]}>معدل التعافي</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreValue, { color: resilienceTier.color }]}>
                  {behavioral.bounceBackRate}%
                </Text>
                <View style={[styles.tierBadge, { backgroundColor: `${resilienceTier.color}25` }]}>
                  <Text style={[styles.tierText, { color: resilienceTier.color }]}>
                    {resilienceTier.label}
                  </Text>
                </View>
              </View>
              <Text style={[styles.subCardDesc, { color: theme.textMuted }]}>
                {resilienceTier.desc}
              </Text>
            </View>

            {/* Keystone Habit */}
            <View style={[styles.consistencyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.miniCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="rocket-outline" size={18} color="#F59E0B" />
                </View>
                <Text style={[styles.subCardTitle, { color: theme.text }]}>العادة المحورية</Text>
              </View>
              {behavioral.keystoneHabit ? (
                <>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.keystoneName, { color: theme.text }]} numberOfLines={1}>
                      {behavioral.keystoneHabit.habit.name}
                    </Text>
                    <View style={[styles.tierBadge, { backgroundColor: '#F59E0B25' }]}>
                      <Text style={[styles.tierText, { color: '#F59E0B' }]}>
                        +{behavioral.keystoneHabit.boostPercent}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.subCardDesc, { color: theme.textMuted }]}>
                    إنجازها يرفع الالتزام بباقي العادات بنسبة +{behavioral.keystoneHabit.boostPercent}%
                  </Text>
                </>
              ) : (
                <>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginVertical: 4 }}>
                    <Ionicons name="search-outline" size={16} color={theme.textDim} />
                    <Text style={[styles.scoreValue, { color: theme.textDim, fontSize: 16 }]}>قيد الرصد</Text>
                  </View>
                  <Text style={[styles.subCardDesc, { color: theme.textMuted }]}>
                    استمر بالتسجيل 7 أيام إضافية لرصد العادة المحورية
                  </Text>
                </>
              )}
            </View>
          </View>
        );
      })()}

      {/* Science & Studies Hub Banner */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenStudies}
        style={[styles.studiesBanner, { backgroundColor: theme.card, borderColor: theme.primary + '50' }]}
      >
        <View style={styles.studiesBannerRow}>
          <View style={[styles.studiesIconContainer, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="flask-outline" size={26} color={theme.primary} />
          </View>
          <View style={styles.studiesBannerText}>
            <View style={styles.studiesBadgeRow}>
              <Text style={[styles.studiesTitle, { color: theme.text }]}>مكتبة أبحاث ودراسات العادات</Text>
              <View style={[styles.studiesNewBadge, { backgroundColor: '#10B98125' }]}>
                <Text style={styles.studiesNewBadgeText}>أبحاث معتمدة</Text>
              </View>
            </View>
            <Text style={[styles.studiesDesc, { color: theme.textMuted }]}>
              قواعد علمية من دراسات UCL (66 يوماً)، معهد MIT، ستانفورد ومسارات الدوبامين العصبية.
            </Text>
          </View>
        </View>
        <View style={[styles.studiesActionRow, { borderTopColor: theme.cardBorder }]}>
          <Text style={[styles.studiesActionText, { color: theme.primary }]}>تصفح الدراسات والقواعد السلوكية</Text>
          <Ionicons name="arrow-back-outline" size={16} color={theme.primary} />
        </View>
      </TouchableOpacity>

      {/* Charts & Leaderboard */}
      <AnalyticsCharts
        habits={habits}
        logs={logs}
        theme={theme}
        onShowDetail={(data) => setDetailModalData(data)}
        onPressHabit={(h) => onSelectHabit && onSelectHabit(h)}
      />

      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Chart Detail Modal */}
    <ChartDetailModal
      visible={!!detailModalData}
      data={detailModalData}
      habits={habits}
      theme={theme}
      onClose={() => setDetailModalData(null)}
      onSelectHabit={(h) => onSelectHabit && onSelectHabit(h)}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearCard: {
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 18,
    marginBottom: 16,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  yearTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  yearDesc: {
    fontSize: 12,
    marginBottom: 14,
  },
  yearScroll: {
    paddingVertical: 6,
  },
  yearGrid: {
    flexDirection: 'row',
    gap: 2.5,
  },
  yearCol: {
    flexDirection: 'column',
    gap: 2.5,
  },
  yearPixel: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 12,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  highlightBanner: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  highlightName: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  highlightDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  deepAnalyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  consistencyCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  miniCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  timeOfDayCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
  },
  todRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  todPill: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  todLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  todCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  // Behavioral Persona Card
  personaCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  personaIcon: {
    fontSize: 32,
  },
  personaTitleContainer: {
    flex: 1,
  },
  personaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  personaTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  personaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  personaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  personaSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  personaDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  // Behavioral & Golden Day Breakdown
  behavioralCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
  },
  daysComparisonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dayHighlightBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  dayHighlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  dayIcon: {
    fontSize: 14,
  },
  dayHighlightLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  dayNameText: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  dayRateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekdaysBreakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  weekdaysBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    paddingTop: 10,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  weekdayColRate: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  weekdayBarTrack: {
    width: 14,
    height: 48,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekdayBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  weekdayColName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  keystoneName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  // Studies Hub Banner
  studiesBanner: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  studiesBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  studiesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studiesBannerText: {
    flex: 1,
  },
  studiesBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  studiesTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  studiesNewBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  studiesNewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  studiesDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  studiesActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  studiesActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  // Weekly Digest Card
  weeklyDigestCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
  },
  weeklyDigestHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weeklyDigestTitleRow: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  weeklyDigestIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDigestTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  weeklyDigestTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
    textAlign: 'right',
  },
  weeklyDigestSubtitle: {
    fontSize: 11,
    textAlign: 'right',
  },
  weeklyDigestBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  weeklyDigestBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  weeklyProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  weeklyProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
