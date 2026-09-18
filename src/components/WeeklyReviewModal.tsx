import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, DayOfWeek } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { FULL_SCREEN_SAFE_TOP } from '../constants/layout';
import { ModalHeader } from './ModalHeader';
import { AmbientBackground } from './common/AmbientBackground';
import { getLastNDays, parseISODate } from '../utils/dateUtils';
import { isHabitScheduledForDay } from '../utils/habitScheduleUtils';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

export interface WeeklyReviewModalProps {
  visible: boolean;
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onSelectHabit?: (habit: Habit) => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  visible,
  habits,
  logs,
  theme,
  language = 'ar',
  onClose,
  onSelectHabit,
}) => {
  const rtl = isRTL(language);
  const activeHabits = habits.filter((h) => !h.archived);

  // Analyze the last 7 days
  const last7Days = getLastNDays(7); // oldest to newest

  const arabicDayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const englishDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let totalOpportunities = 0;
  let totalCompletions = 0;
  let totalFocusMinutes = 0;
  let totalCravingsResisted = 0;

  const dayStats = last7Days.map((dateStr) => {
    const d = parseISODate(dateStr);
    const dayOfWeek = d.getDay() as DayOfWeek;
    const dayLabel = language === 'ar' ? arabicDayNames[dayOfWeek] : englishDayNames[dayOfWeek];

    let scheduled = 0;
    let completed = 0;

    for (const habit of activeHabits) {
      if (isHabitScheduledForDay(habit, dayOfWeek)) {
        scheduled++;
        const val = logs[habit.id]?.[dateStr] || 0;
        const threshold = habit.targetValue || habit.targetPerDay || 1;
        if (val >= threshold) {
          completed++;
        }
        if (habit.type === 'timer' && val > 0) {
          totalFocusMinutes += val;
        }
      }
      if (habit.cravingsResisted?.[dateStr]) {
        totalCravingsResisted += habit.cravingsResisted[dateStr];
      }
    }

    totalOpportunities += scheduled;
    totalCompletions += completed;

    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 100;
    return {
      dateStr,
      dayLabel,
      scheduled,
      completed,
      rate,
    };
  });

  const overallRate =
    totalOpportunities > 0 ? Math.round((totalCompletions / totalOpportunities) * 100) : 0;

  interface HabitWeeklyStat {
    habit: Habit;
    completions: number;
    opportunities: number;
  }

  // Find Star Habit & Needs Attention Habit
  let starHabit: HabitWeeklyStat | null = null;
  let lowestHabit: HabitWeeklyStat | null = null;

  for (const habit of activeHabits) {
    let habitOpp = 0;
    let habitComp = 0;

    for (const dateStr of last7Days) {
      const d = parseISODate(dateStr);
      const dayOfWeek = d.getDay() as DayOfWeek;
      if (isHabitScheduledForDay(habit, dayOfWeek)) {
        habitOpp++;
        const val = logs[habit.id]?.[dateStr] || 0;
        const threshold = habit.targetValue || habit.targetPerDay || 1;
        if (val >= threshold) {
          habitComp++;
        }
      }
    }

    if (habitOpp > 0) {
      const habitData: HabitWeeklyStat = { habit, completions: habitComp, opportunities: habitOpp };
      if (!starHabit || habitComp > starHabit.completions) {
        starHabit = habitData;
      }
      if (!lowestHabit || habitComp / habitOpp < lowestHabit.completions / lowestHabit.opportunities) {
        lowestHabit = habitData;
      }
    }
  }

  // Motivational Behavioral Tip
  let behavioralTip = '';
  let badgeTitle = '';
  let badgeColor = '#2ED573';

  if (overallRate >= 85) {
    badgeTitle = language === 'ar' ? 'أداء أسطوري' : 'Legendary Consistency';
    badgeColor = '#2ED573';
    behavioralTip =
      language === 'ar'
        ? 'استمرارية استثنائية! لقد حققت أعلى درجات التثبيت العصبي لعاداتك هذا الأسبوع. واصل الحفاظ على هذا الزخم العالي.'
        : 'Outstanding consistency! You have achieved deep neuro-pathway habit consolidation this week. Keep up the high momentum!';
  } else if (overallRate >= 65) {
    badgeTitle = language === 'ar' ? 'أسبوع قوي وملتزم' : 'Strong & Committed';
    badgeColor = '#7C83FD';
    behavioralTip =
      language === 'ar'
        ? 'أسبوع ممتاز وثابت! حاول تنفيذ العادات الأكثر صعوبة في الساعات الأولى من اليوم لتفادي استنزاف الإرادة مع المساء.'
        : 'Great weekly performance! Try tackling your most challenging habits earlier in the day to prevent evening willpower fatigue.';
  } else if (overallRate >= 40) {
    badgeTitle = language === 'ar' ? 'تقدم تصاعدي' : 'Steady Progress';
    badgeColor = '#FFA502';
    behavioralTip =
      language === 'ar'
        ? 'خطواتك جيدة وتبني عليها. تذكر قاعدة "لا تنقطع مرتين أبداً" لتقليص أثر الأيام الصعبة وضمان العودة السريعة.'
        : 'Good stepping stones. Remember the "Never Miss Twice" rule to recover quickly from demanding days.';
  } else {
    badgeTitle = language === 'ar' ? 'فرصة لإعادة الضبط' : 'Reset & Rebuild';
    badgeColor = '#FF6565';
    behavioralTip =
      language === 'ar'
        ? 'كل بداية جديدة تحمل قوة. قلل عدد عاداتك أو حجمها بنسبة 50% لتبسيط الالتزام حتى يترسخ الروتين تدريجياً.'
        : 'Every week offers a fresh slate. Try reducing habit sizes by 50% to make them ridiculously easy to maintain.';
  }

  const handleShareSummary = async () => {
    hapticService.medium();
    soundService.playTap();
    const shareText =
      language === 'ar'
        ? `📊 تقرير حصادي الأسبوعي في Habit Tracker:\n• نسبة الالتزام: ${overallRate}%\n• إجمالي الإنجازات: ${totalCompletions} من أصل ${totalOpportunities}\n• العادة النجمة: ${starHabit?.habit.name || 'عاداتي'}\n✨ واصل المضي قدماً!`
        : `📊 My Weekly Habit Review:\n• Consistency Rate: ${overallRate}%\n• Total Completions: ${totalCompletions} / ${totalOpportunities}\n• Star Habit: ${starHabit?.habit.name || 'My habits'}\n✨ Keep building momentum!`;

    try {
      await Share.share({ message: shareText });
    } catch {
      // Ignore share dismissal
    }
  };

  const star = starHabit;
  const lowest = lowestHabit;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <AmbientBackground theme={theme} isDark={theme.text === '#FFFFFF'} />

        {/* Header */}
        <ModalHeader
          title={t('weeklyReviewTitle', language)}
          subtitle={t('weeklyReviewSub', language)}
          theme={theme}
          onClose={onClose}
          showDragHandle={true}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Score Hero Card */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder || theme.border,
              },
            ]}
          >
            <View style={[styles.heroRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              {/* Circular Metric Container */}
              <View style={[styles.scoreRing, { borderColor: `${badgeColor}40` }]}>
                <Text style={[styles.scorePercentText, { color: badgeColor }]}>{overallRate}%</Text>
                <Text style={[styles.scoreSubLabel, { color: theme.textMuted }]}>
                  {language === 'ar' ? 'التزام' : 'score'}
                </Text>
              </View>

              {/* Text Info */}
              <View style={[styles.heroTextCol, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.badgePill, { backgroundColor: `${badgeColor}20` }]}>
                  <Text style={[styles.badgePillText, { color: badgeColor }]}>{badgeTitle}</Text>
                </View>
                <Text style={[styles.heroMetricSummary, { color: theme.text }]}>
                  {totalCompletions}{' '}
                  <Text style={{ color: theme.textDim, fontSize: 13, fontWeight: '500' }}>
                    {language === 'ar'
                      ? `من أصل ${totalOpportunities} عادة مجدولة`
                      : `of ${totalOpportunities} scheduled`}
                  </Text>
                </Text>
                <Text style={[styles.heroDateSpan, { color: theme.textDim }]}>
                  {last7Days[0]} ➔ {last7Days[last7Days.length - 1]}
                </Text>
              </View>
            </View>
          </View>

          {/* 7-Day Performance Sparkline / Bars */}
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder || theme.border,
              },
            ]}
          >
            <View style={[styles.cardTitleRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Ionicons name="bar-chart" size={17} color="#7C83FD" />
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {language === 'ar' ? 'سجل الأيام السبعة' : '7-Day Activity Breakdown'}
              </Text>
            </View>

            <View style={[styles.barsContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              {dayStats.map((item, index) => {
                const barColor =
                  item.rate >= 80 ? '#2ED573' : item.rate >= 50 ? '#7C83FD' : '#FFA502';
                const heightPercent = Math.max(12, item.rate);

                return (
                  <View key={item.dateStr || index} style={styles.barColumn}>
                    <Text style={[styles.barValueText, { color: theme.textMuted }]}>
                      {item.completed}
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: theme.surface }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barDayText, { color: theme.textDim }]}>
                      {item.dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Star Habit & Focus Area Cards */}
          <View style={[styles.highlightsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            {/* Star Habit */}
            {star && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (star && onSelectHabit) {
                    onClose();
                    onSelectHabit(star.habit);
                  }
                }}
                style={[
                  styles.highlightCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder || theme.border,
                  },
                ]}
              >
                <View style={[styles.highlightHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.highlightIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                  </View>
                  <Text style={[styles.highlightTypeTitle, { color: '#F59E0B' }]}>
                    {language === 'ar' ? 'العادة النجمة' : 'Star Habit'}
                  </Text>
                </View>
                <Text style={[styles.highlightHabitName, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
                  {star.habit.name}
                </Text>
                <Text style={[styles.highlightStat, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  {star.completions} / {star.opportunities}{' '}
                  {language === 'ar' ? 'أيام إنجاز' : 'completed days'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Habit Needing Focus */}
            {lowest && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (lowest && onSelectHabit) {
                    onClose();
                    onSelectHabit(lowest.habit);
                  }
                }}
                style={[
                  styles.highlightCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder || theme.border,
                  },
                ]}
              >
                <View style={[styles.highlightHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.highlightIconBadge, { backgroundColor: 'rgba(255, 101, 101, 0.15)' }]}>
                    <Ionicons name="compass-outline" size={16} color="#FF6565" />
                  </View>
                  <Text style={[styles.highlightTypeTitle, { color: '#FF6565' }]}>
                    {language === 'ar' ? 'تحتاج تركيزاً' : 'Needs Focus'}
                  </Text>
                </View>
                <Text style={[styles.highlightHabitName, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
                  {lowest.habit.name}
                </Text>
                <Text style={[styles.highlightStat, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  {lowest.completions} / {lowest.opportunities}{' '}
                  {language === 'ar' ? 'أيام التزام' : 'completed days'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Metrics (Focus Minutes & Cravings Resisted) */}
          {(totalFocusMinutes > 0 || totalCravingsResisted > 0) && (
            <View
              style={[
                styles.metricsRowCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder || theme.border,
                  flexDirection: rtl ? 'row-reverse' : 'row',
                },
              ]}
            >
              {totalFocusMinutes > 0 && (
                <View style={styles.metricItem}>
                  <Ionicons name="timer-outline" size={20} color="#7C83FD" />
                  <Text style={[styles.metricItemValue, { color: theme.text }]}>
                    {totalFocusMinutes}
                  </Text>
                  <Text style={[styles.metricItemLabel, { color: theme.textDim }]}>
                    {language === 'ar' ? 'دقيقة تركيز' : 'Focus Mins'}
                  </Text>
                </View>
              )}
              {totalFocusMinutes > 0 && totalCravingsResisted > 0 && (
                <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
              )}
              {totalCravingsResisted > 0 && (
                <View style={styles.metricItem}>
                  <Ionicons name="shield-checkmark" size={20} color="#00CEC9" />
                  <Text style={[styles.metricItemValue, { color: theme.text }]}>
                    {totalCravingsResisted}
                  </Text>
                  <Text style={[styles.metricItemLabel, { color: theme.textDim }]}>
                    {language === 'ar' ? 'رغبة تمت مقاومتها' : 'Cravings Resisted'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Behavioral Insight / Coaching Tip Card */}
          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: theme.card,
                borderColor: `${badgeColor}40`,
              },
            ]}
          >
            <View style={[styles.tipHeaderRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.tipIconPill, { backgroundColor: `${badgeColor}20` }]}>
                <Ionicons name="bulb-outline" size={18} color={badgeColor} />
              </View>
              <Text style={[styles.tipTitle, { color: theme.text }]}>
                {language === 'ar' ? 'الانعكاس السلوكي للأسبوع' : 'Behavioral Reflection'}
              </Text>
            </View>
            <Text style={[styles.tipBody, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
              {behavioralTip}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={[styles.bottomActionsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShareSummary}
              style={[styles.shareActionBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareActionBtnText}>
                {language === 'ar' ? 'مشاركة الحصاد' : 'Share Review'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hapticService.light();
                onClose();
              }}
              style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Text style={[styles.closeBtnText, { color: theme.text }]}>
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: FULL_SCREEN_SAFE_TOP + 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  heroRow: {
    alignItems: 'center',
    gap: 18,
  },
  scoreRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentText: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreSubLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
  heroTextCol: {
    flex: 1,
    gap: 4,
  },
  badgePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  badgePillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  heroMetricSummary: {
    fontSize: 17,
    fontWeight: '800',
  },
  heroDateSpan: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  cardTitleRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  barsContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 6,
  },
  barColumn: {
    alignItems: 'center',
    width: 32,
    gap: 6,
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barTrack: {
    width: 14,
    height: 75,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 10,
    fontWeight: '600',
  },
  highlightsRow: {
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  highlightHeader: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  highlightIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTypeTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  highlightHabitName: {
    fontSize: 14,
    fontWeight: '800',
  },
  highlightStat: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricsRowCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    gap: 3,
  },
  metricItemValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricItemLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
  tipCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  tipHeaderRow: {
    alignItems: 'center',
    gap: 8,
  },
  tipIconPill: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  tipBody: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  bottomActionsRow: {
    gap: 10,
    marginTop: 4,
  },
  shareActionBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  closeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
