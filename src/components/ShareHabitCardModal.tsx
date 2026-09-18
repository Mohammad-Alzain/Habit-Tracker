import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateHabitStats } from '../utils/streakUtils';
import { getTodayString, parseISODate, getArabicMonth } from '../utils/dateUtils';
import { ModalHeader } from './ModalHeader';
import { BlurOverlay } from './common/BlurOverlay';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';

interface ShareHabitCardModalProps {
  visible: boolean;
  habit: Habit | null;
  logs: HabitLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
}

export const ShareHabitCardModal: React.FC<ShareHabitCardModalProps> = ({
  visible,
  habit,
  logs,
  theme,
  language = 'ar',
  onClose,
}) => {
  const rtl = isRTL(language);
  const [copied, setCopied] = useState(false);

  if (!habit) return null;
  const stats = calculateHabitStats(habit, logs);
  const todayStr = getTodayString();
  const todayDate = parseISODate(todayStr);

  // Generate 6x5 mini heatmap
  const colsCount = 6;
  const rowsCount = 5;
  const habitLogs = logs[habit.id] || {};
  const threshold = habit.targetValue || habit.targetPerDay || 1;

  const columns: { isCompleted: boolean }[][] = [];
  for (let c = 0; c < colsCount; c++) {
    const col: { isCompleted: boolean }[] = [];
    for (let r = 0; r < rowsCount; r++) {
      const daysAgo = (colsCount - 1 - c) * rowsCount + (rowsCount - 1 - r);
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - daysAgo);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;

      col.push({
        isCompleted: (habitLogs[dStr] || 0) >= threshold,
      });
    }
    columns.push(col);
  }

  const handleCopySummary = async () => {
    const summary = `مسار إنجاز عادة: ${habit.name}\n` +
      `الستريك الحالي: ${stats.currentStreak} أيام متتالية\n` +
      `أفضل ستريك: ${stats.longestStreak} يوماً\n` +
      `إجمالي الإنجازات: ${stats.totalCompletions} مرة\n` +
      `نسبة النجاح: ${stats.completionRate30Days}%\n` +
      `تطبيق Habit Flow`;

    await Clipboard.setStringAsync(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareSystem = async () => {
    try {
      await Share.share({
        message: `أنا مستمر في عادة "${habit.name}" منذ ${stats.currentStreak} أيام متتالية! أنجزت العادة ${stats.totalCompletions} مرة بنسبة نجاح ${stats.completionRate30Days}%.`,
        title: `إنجاز عادة ${habit.name}`,
      });
    } catch (err) {
      // Safe fallback
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: theme.text === '#FFFFFF' ? 0.35 : 0.12,
              shadowRadius: 24,
              elevation: 14,
            },
          ]}
        >
          {/* Header */}
          <ModalHeader
            title={t('shareTitle', language)}
            icon="sparkles"
            iconColor="#F1C40F"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Visual Share Card */}
          <View style={[styles.shareCardVisual, { backgroundColor: theme.surface, borderColor: `${habit.color}50` }]}>
            {/* Top Habit Row */}
            <View style={styles.cardTopRow}>
              <View style={[styles.habitIconBox, { backgroundColor: `${habit.color}25`, borderColor: `${habit.color}60` }]}>
                <Ionicons name={(habit.icon as any) || 'flame'} size={28} color={habit.color} />
              </View>

              <View style={styles.habitTextCol}>
                <Text style={[styles.habitTitle, { color: theme.text }]}>{habit.name}</Text>
                <Text style={[styles.habitDate, { color: theme.textDim }]}>
                  {getArabicMonth(todayDate.getMonth())} {todayDate.getFullYear()}
                </Text>
              </View>
            </View>

            {/* Metrics Pills Grid */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricPill, { backgroundColor: `${habit.color}15`, borderColor: `${habit.color}35` }]}>
                <Ionicons name="flame" size={14} color={habit.color} />
                <Text style={[styles.metricValue, { color: habit.color }]}>{stats.currentStreak} ستريك</Text>
              </View>

              <View style={[styles.metricPill, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="trophy" size={14} color="#F1C40F" />
                <Text style={[styles.metricValue, { color: theme.text }]}>أفضل {stats.longestStreak}</Text>
              </View>

              <View style={[styles.metricPill, { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: 'rgba(46, 204, 113, 0.35)' }]}>
                <Ionicons name="fitness" size={14} color="#2ECC71" />
                <Text style={[styles.metricValue, { color: '#2ECC71' }]}>قوة {stats.habitStrengthScore}%</Text>
              </View>
            </View>

            {/* Mini Heatmap Matrix */}
            <View style={styles.heatmapWrapper}>
              {columns.map((col, cIdx) => (
                <View key={`hc-${cIdx}`} style={styles.heatmapCol}>
                  {col.map((cell, rIdx) => (
                    <View
                      key={`hr-${rIdx}`}
                      style={[
                        styles.heatmapDot,
                        {
                          backgroundColor: cell.isCompleted ? habit.color : theme.emptyCell,
                        },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>

            {/* Footer Watermark */}
            <View style={styles.watermarkRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={theme.textDim} />
              <Text style={[styles.watermarkText, { color: theme.textDim }]}>Habit Flow • مسار العادات المستمر</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleShareSystem} style={[styles.primaryShareBtn, { backgroundColor: habit.color }]}>
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryShareText}>مشاركة البطاقة</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopySummary}
              style={[styles.secondaryCopyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? '#10B981' : theme.text} />
              <Text style={[styles.secondaryCopyText, { color: copied ? '#10B981' : theme.text }]}>
                {copied ? 'تم النسخ!' : 'نسخ النص'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: DIALOG_SAFE_TOP,
    paddingBottom: DIALOG_SAFE_BOTTOM,
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 18,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCardVisual: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  habitIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTextCol: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'right',
  },
  habitDate: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 16,
  },
  metricPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  heatmapWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  heatmapCol: {
    flexDirection: 'column',
    gap: 4,
  },
  heatmapDot: {
    width: 13,
    height: 13,
    borderRadius: 3.5,
  },
  watermarkRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  watermarkText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  primaryShareBtn: {
    flex: 1.2,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryShareText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryCopyBtn: {
    flex: 0.9,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryCopyText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
