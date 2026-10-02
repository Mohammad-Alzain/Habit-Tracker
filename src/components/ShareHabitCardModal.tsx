import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { BlurOverlay } from './common/BlurOverlay';
import { ModalHeader } from './ModalHeader';
import { AppLanguage, isRTL } from '../utils/i18n';
import { calculateHabitStats, calculateGlobalStats } from '../utils/streakUtils';
import { getLastNDays, getTodayString } from '../utils/dateUtils';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';
import { habitStore } from '../store/habitStore';
import { DIALOG_SAFE_BOTTOM } from '../constants/layout';

interface ShareHabitCardModalProps {
  visible: boolean;
  habits?: Habit[];
  habit?: Habit | null;
  logs: HabitLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  initialHabitId?: string;
  onClose: () => void;
}


type CardThemeId = 'neon' | 'sunset' | 'aurora' | 'space';

interface CardThemeConfig {
  id: CardThemeId;
  name: string;
  gradientBg: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  tagBg: string;
}

const CARD_THEMES: CardThemeConfig[] = [
  {
    id: 'neon',
    name: 'نيون سيبر',
    gradientBg: '#0F172A',
    borderColor: '#38BDF8',
    accentColor: '#38BDF8',
    textColor: '#F8FAFC',
    tagBg: 'rgba(56, 189, 248, 0.15)',
  },
  {
    id: 'sunset',
    name: 'شفق الغروب',
    gradientBg: '#1A0E1A',
    borderColor: '#F97316',
    accentColor: '#FB923C',
    textColor: '#FFF7ED',
    tagBg: 'rgba(249, 115, 22, 0.15)',
  },
  {
    id: 'aurora',
    name: 'شفق قطبي',
    gradientBg: '#0A1C16',
    borderColor: '#10B981',
    accentColor: '#34D399',
    textColor: '#ECFDF5',
    tagBg: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'space',
    name: 'فضاء ملكي',
    gradientBg: '#14141E',
    borderColor: '#EAB308',
    accentColor: '#FACC15',
    textColor: '#FEFCE8',
    tagBg: 'rgba(234, 179, 8, 0.15)',
  },
];

export const ShareHabitCardModal: React.FC<ShareHabitCardModalProps> = ({
  visible,
  habits,
  habit,
  logs,
  theme,
  language = 'ar',
  initialHabitId,
  onClose,
}) => {
  const rtl = isRTL(language);
  const storeHabits = habits || habitStore.getSnapshot().habits;
  const activeHabits = (habit ? [habit, ...storeHabits.filter((h) => h.id !== habit.id)] : storeHabits).filter((h) => !h.archived);
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habit?.id || initialHabitId || activeHabits[0]?.id || 'global'
  );
  const [selectedThemeId, setSelectedThemeId] = useState<CardThemeId>('neon');

  React.useEffect(() => {
    if (habit) {
      setSelectedHabitId(habit.id);
    } else if (initialHabitId) {
      setSelectedHabitId(initialHabitId);
    }
  }, [habit, initialHabitId]);

  const cardTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  const isGlobal = selectedHabitId === 'global';
  const selectedHabit = activeHabits.find((h) => h.id === selectedHabitId);

  // Compute stats
  const globalStats = calculateGlobalStats(storeHabits, logs);
  const habitStats = selectedHabit ? calculateHabitStats(selectedHabit, logs) : null;

  const currentStreak = isGlobal ? globalStats.bestStreakAll : habitStats?.currentStreak || 0;
  const longestStreak = isGlobal ? globalStats.bestStreakAll : habitStats?.longestStreak || 0;
  const completionRate = isGlobal ? globalStats.todayCompletionRate : habitStats?.completionRate30Days || 0;
  const totalDone = isGlobal ? globalStats.totalCompletionsAll : habitStats?.totalCompletions || 0;

  const last14Days = getLastNDays(14).reverse();
  const habitLogs = selectedHabit ? logs[selectedHabit.id] || {} : {};
  const habitTarget = selectedHabit?.targetValue || selectedHabit?.targetPerDay || 1;

  const titleName = isGlobal ? 'المحصلة الإجمالية للعادات' : selectedHabit?.name || 'عادتي';
  const habitColor = isGlobal ? '#7C83FD' : selectedHabit?.color || '#38BDF8';

  const shareText = `🔥 إنجاز جديد في تطبيقي لمتابعة العادات!
🎯 العادة: ${titleName}
⚡ الستريك الحالي: ${currentStreak} يوماً متواصلاً!
🏆 أطول ستريك: ${longestStreak} يوماً
📊 نسبة الالتزام: ${completionRate}%
✨ إجمالي الإنجازات: ${totalDone} يوماً

"الاستمرار اليومي هو السر الحقيقي للتحول!" 🚀
#بناء_العادات #ستريك #انضباط`;

  const handleNativeShare = async () => {
    hapticService.success();
    soundService.playComplete();
    try {
      await Share.share({
        message: shareText,
        title: `إنجازي في عادة ${titleName}`,
      });
    } catch {}
  };

  const handleCopyClipboard = async () => {
    hapticService.light();
    soundService.playTap();
    await Clipboard.setStringAsync(shareText);
    Alert.alert('📋 تم النسخ', 'تم نسخ نص بطاقة الإنجاز لحافظتك بنجاح!');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <ModalHeader
            title="بطاقة المشاركة الجمالية 📸"
            onClose={onClose}
            theme={theme}
            isRTL={rtl}
          />


          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            {/* Habit Picker Chips */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
              اختر العادة المراد مشاركتها:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.habitScroll, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
            >
              <TouchableOpacity
                onPress={() => setSelectedHabitId('global')}
                style={[
                  styles.habitChip,
                  {
                    backgroundColor: isGlobal ? '#7C83FD' : theme.surface,
                    borderColor: isGlobal ? '#7C83FD' : theme.border,
                  },
                ]}
              >
                <Ionicons name="trophy" size={14} color={isGlobal ? '#FFFFFF' : theme.text} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: isGlobal ? '#FFFFFF' : theme.text }}>
                  الإجمالي العام
                </Text>
              </TouchableOpacity>

              {activeHabits.map((h) => {
                const isSelected = h.id === selectedHabitId;
                return (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => setSelectedHabitId(h.id)}
                    style={[
                      styles.habitChip,
                      {
                        backgroundColor: isSelected ? h.color : theme.surface,
                        borderColor: isSelected ? h.color : theme.border,
                      },
                    ]}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isSelected ? '#FFFFFF' : h.color }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#FFFFFF' : theme.text }}>
                      {h.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Theme Selector Pills */}
            <View style={[styles.themesRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              {CARD_THEMES.map((ct) => {
                const isSelected = ct.id === selectedThemeId;
                return (
                  <TouchableOpacity
                    key={ct.id}
                    onPress={() => {
                      hapticService.selection();
                      setSelectedThemeId(ct.id);
                    }}
                    style={[
                      styles.themePill,
                      {
                        backgroundColor: isSelected ? ct.accentColor : theme.surface,
                        borderColor: isSelected ? ct.accentColor : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#000000' : theme.textMuted }}>
                      {ct.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Aesthetic Card Preview */}
            <View
              style={[
                styles.previewCardContainer,
                {
                  backgroundColor: cardTheme.gradientBg,
                  borderColor: cardTheme.borderColor,
                },
              ]}
            >
              {/* Header Branding */}
              <View style={[styles.cardHeaderBranding, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.brandPill, { backgroundColor: cardTheme.tagBg }]}>
                  <Ionicons name="sparkles" size={12} color={cardTheme.accentColor} />
                  <Text style={[styles.brandPillText, { color: cardTheme.accentColor }]}>
                    HABIT FLOW ✦ إنجاز
                  </Text>
                </View>
                <Text style={[styles.cardDateStr, { color: 'rgba(255,255,255,0.45)' }]}>
                  {getTodayString()}
                </Text>
              </View>

              {/* Title & Icon */}
              <View style={[styles.cardTitleSection, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.cardIconBox, { backgroundColor: `${habitColor}25`, borderColor: habitColor }]}>
                  <Ionicons name={isGlobal ? 'trophy' : (selectedHabit?.icon as any || 'flame')} size={26} color={habitColor} />
                </View>
                <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.cardHabitTitle, { color: cardTheme.textColor }]}>
                    {titleName}
                  </Text>
                  <Text style={[styles.cardHabitSub, { color: 'rgba(255,255,255,0.6)' }]}>
                    {isGlobal ? 'محصلة الالتزام عبر جميع الأهداف' : `التكرار اليومي • مسار النجاح`}
                  </Text>
                </View>
              </View>

              {/* Huge Flame Streak Display */}
              <View style={styles.streakCenterBox}>
                <View style={[styles.flameOuterCircle, { borderColor: cardTheme.accentColor }]}>
                  <Text style={styles.flameEmoji}>🔥</Text>
                  <Text style={[styles.streakNumberText, { color: cardTheme.textColor }]}>
                    {currentStreak}
                  </Text>
                  <Text style={[styles.streakLabelText, { color: cardTheme.accentColor }]}>
                    أيام ستريك متواصلة
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={[styles.statsGridRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.miniStatBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: cardTheme.tagBg }]}>
                  <Text style={[styles.miniStatVal, { color: cardTheme.accentColor }]}>{longestStreak}d</Text>
                  <Text style={styles.miniStatLabel}>أطول ستريك</Text>
                </View>
                <View style={[styles.miniStatBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: cardTheme.tagBg }]}>
                  <Text style={[styles.miniStatVal, { color: '#2ED573' }]}>{completionRate}%</Text>
                  <Text style={styles.miniStatLabel}>الالتزام</Text>
                </View>
                <View style={[styles.miniStatBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: cardTheme.tagBg }]}>
                  <Text style={[styles.miniStatVal, { color: '#FFA502' }]}>{totalDone}</Text>
                  <Text style={styles.miniStatLabel}>إجمالي الأيام</Text>
                </View>
              </View>

              {/* 14 Days Visual Dots Trail */}
              {!isGlobal && (
                <View style={styles.heatmapDotsSection}>
                  <Text style={[styles.dotsSectionTitle, { color: 'rgba(255,255,255,0.5)', textAlign: rtl ? 'right' : 'left' }]}>
                    آخر 14 يوماً:
                  </Text>
                  <View style={[styles.dotsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    {last14Days.map((dStr) => {
                      const count = habitLogs[dStr] || 0;
                      const isDone = count >= habitTarget;
                      return (
                        <View
                          key={dStr}
                          style={[
                            styles.heatDot,
                            {
                              backgroundColor: isDone ? habitColor : 'rgba(255,255,255,0.1)',
                              borderColor: isDone ? '#FFFFFF' : 'transparent',
                              borderWidth: isDone ? 0.8 : 0,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Quote Footer */}
              <View style={[styles.cardFooterQuote, { borderTopColor: cardTheme.tagBg }]}>
                <Text style={styles.cardQuoteText}>
                  "التميز ليس عملاً منفرداً بل عادة متجذرة."
                </Text>
              </View>
            </View>

            {/* Sharing Action Buttons */}
            <View style={[styles.actionButtonsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNativeShare}
                style={[styles.shareActionBtn, { backgroundColor: '#7C83FD' }]}
              >
                <Ionicons name="share-social" size={18} color="#FFFFFF" />
                <Text style={styles.shareActionBtnText}>مشاركة الإنجاز 🚀</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCopyClipboard}
                style={[styles.copyActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Ionicons name="copy-outline" size={17} color={theme.text} />
                <Text style={[styles.copyActionBtnText, { color: theme.text }]}>نسخ النص</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '92%',
    paddingTop: 16,
    paddingBottom: DIALOG_SAFE_BOTTOM,
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  habitScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  themesRow: {
    gap: 8,
    marginVertical: 10,
    justifyContent: 'center',
  },
  themePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewCardContainer: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeaderBranding: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  brandPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardDateStr: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitleSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHabitTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardHabitSub: {
    fontSize: 11.5,
  },
  streakCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  flameOuterCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  flameEmoji: {
    fontSize: 28,
    marginBottom: -4,
  },
  streakNumberText: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  streakLabelText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statsGridRow: {
    gap: 10,
    marginTop: 12,
    marginBottom: 14,
  },
  miniStatBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  miniStatVal: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  heatmapDotsSection: {
    marginVertical: 10,
  },
  dotsSectionTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  dotsRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heatDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  cardFooterQuote: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  cardQuoteText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtonsRow: {
    gap: 10,
    marginTop: 12,
  },
  shareActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
  },
  shareActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  copyActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  copyActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
