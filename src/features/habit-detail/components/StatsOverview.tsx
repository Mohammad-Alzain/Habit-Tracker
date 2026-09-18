import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitStats } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { isRTL, AppLanguage } from '../../../utils/i18n';

interface StatsOverviewProps {
  stats: HabitStats;
  theme: ThemeColors;
  habitColor: string;
  isQuit?: boolean;
  language?: AppLanguage;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  theme,
  habitColor,
  isQuit,
  language = 'ar',
}) => {
  const rtl = isRTL(language);
  const daysUnit = language === 'ar' ? 'أيام' : 'days';
  const timesUnit = language === 'ar' ? 'مرة' : 'times';

  return (
    <View style={styles.kpiGrid}>
      {/* Current Streak / Clean Days */}
      <View
        style={[
          styles.kpiCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.kpiHeaderRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Ionicons name={isQuit ? 'shield-checkmark' : 'flame'} size={16} color={isQuit ? '#2ED573' : '#FF6565'} />
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
            {isQuit
              ? (language === 'ar' ? 'أيام الصمود' : 'Clean Days')
              : (language === 'ar' ? 'الستريك الحالي' : 'Current Streak')}
          </Text>
        </View>
        <Text style={[styles.kpiValue, { color: theme.text }]}>
          {stats.currentStreak} <Text style={styles.kpiUnit}>{daysUnit}</Text>
        </Text>
      </View>

      {/* Best Streak */}
      <View
        style={[
          styles.kpiCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.kpiHeaderRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Ionicons name="trophy" size={15} color="#FFBE76" />
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
            {isQuit
              ? (language === 'ar' ? 'أطول صمود' : 'Best Streak')
              : (language === 'ar' ? 'أفضل ستريك' : 'Best Streak')}
          </Text>
        </View>
        <Text style={[styles.kpiValue, { color: theme.text }]}>
          {stats.longestStreak} <Text style={styles.kpiUnit}>{daysUnit}</Text>
        </Text>
      </View>

      {/* Cravings Resisted or Completion Rate */}
      <View
        style={[
          styles.kpiCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.kpiHeaderRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Ionicons
            name={isQuit ? 'flash' : 'pie-chart'}
            size={15}
            color={isQuit ? '#F39C12' : '#2ED573'}
          />
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
            {isQuit
              ? (language === 'ar' ? 'مقاومة الرغبات' : 'Cravings Resisted')
              : (language === 'ar' ? 'نسبة 30 يوم' : '30-Day Rate')}
          </Text>
        </View>
        <Text style={[styles.kpiValue, { color: theme.text }]}>
          {isQuit ? (
            <>
              {stats.totalCravingsResisted || 0} <Text style={styles.kpiUnit}>{timesUnit}</Text>
            </>
          ) : (
            `${stats.completionRate30Days}%`
          )}
        </Text>
      </View>

      {/* Slips or Total Completions */}
      <View
        style={[
          styles.kpiCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.kpiHeaderRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Ionicons
            name={isQuit ? 'refresh-circle' : 'checkmark-done'}
            size={15}
            color={isQuit ? '#7C83FD' : habitColor}
          />
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
            {isQuit
              ? (language === 'ar' ? 'مرات التعثر' : 'Slips Recorded')
              : (language === 'ar' ? 'إجمالي الأيام' : 'Total Days')}
          </Text>
        </View>
        <Text style={[styles.kpiValue, { color: theme.text }]}>
          {isQuit ? (
            <>
              {stats.totalSlips || 0} <Text style={styles.kpiUnit}>{timesUnit}</Text>
            </>
          ) : (
            <>
              {stats.totalCompletions} <Text style={styles.kpiUnit}>{daysUnit}</Text>
            </>
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  kpiHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
  },
  kpiUnit: {
    fontSize: 13,
    fontWeight: '500',
  },
});
