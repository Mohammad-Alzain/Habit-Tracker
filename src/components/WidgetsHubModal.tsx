import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateHabitStats, calculateGlobalStats } from '../utils/streakUtils';
import { getTodayString } from '../utils/dateUtils';
import { NotificationService } from '../services/notificationService';
import { ModalHeader } from './ModalHeader';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';
import { Platform } from 'react-native';

interface WidgetsHubModalProps {
  visible: boolean;
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onToggleToday: (habitId: string) => void;
}

export const WidgetsHubModal: React.FC<WidgetsHubModalProps> = ({
  visible,
  habits,
  logs,
  theme,
  language = 'ar',
  onClose,
  onToggleToday,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'notification'>('preview');
  const [testNotification, setTestNotification] = useState<{ habitName: string; time: string } | null>(null);
  const rtl = isRTL(language);

  const activeHabits = habits.filter((h) => !h.archived);
  const topHabit = activeHabits[0] || null;
  const todayStr = getTodayString();
  const globalStats = calculateGlobalStats(habits, logs);

  const handleTestReminder = async (habit: Habit) => {
    const time = habit.reminderTime || '20:00';
    setTestNotification({ habitName: habit.name, time });
    await NotificationService.sendInstantTestNotification(habit.name, time);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.glassSurface || theme.card,
              borderColor: theme.glassBorder || theme.cardBorder,
              borderTopColor: theme.glassSpecular || theme.border,
            },
            Platform.OS === 'web' && ({ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' } as any),
          ]}
        >
          {/* Header */}
          <ModalHeader
            title={t('widgetsHubTitle', language)}
            icon="cube"
            iconColor="#00CEC9"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Simulated Toast Notification */}
          {testNotification && (
            <View style={styles.notificationToast}>
              <View style={styles.notifTextCol}>
                <View style={styles.notifHeaderRow}>
                  <Text style={styles.notifTime}>{testNotification.time}</Text>
                  <Text style={styles.notifAppTitle}>تذكير العادات اليومية</Text>
                </View>
                <Text style={styles.notifBody}>
                  حان الآن وقت إنجاز: "{testNotification.habitName}"! حافظ على سلسلتك مستمرة 🔥
                </Text>
              </View>
              <View style={styles.notifIconCircle}>
                <Ionicons name="notifications" size={18} color="#FFFFFF" />
              </View>
            </View>
          )}

          {/* Segmented Tab */}
          <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('preview')}
              style={[
                styles.tabBtn,
                activeTab === 'preview' && { backgroundColor: '#7C83FD' },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'preview' ? '#FFFFFF' : theme.textDim },
                ]}
              >
                معاينة الويدجات (Widgets)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('notification')}
              style={[
                styles.tabBtn,
                activeTab === 'notification' && { backgroundColor: '#7C83FD' },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'notification' ? '#FFFFFF' : theme.textDim },
                ]}
              >
                اختبار التذكيرات
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {activeTab === 'preview' ? (
              <View>
                {/* 1. Widget 1x1: Flame Streak Widget */}
                <Text style={[styles.sectionTitle, { color: theme.textDim }]}>
                  1. ودجت السلسلة والشعلة السريعة (1x1 Quick Flame)
                </Text>
                {topHabit && (
                  <View style={[styles.widgetContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                    <View
                      style={[
                        styles.widget1x1,
                        {
                          backgroundColor: theme.card,
                          borderColor: `${topHabit.color}60`,
                        },
                      ]}
                    >
                      <View style={styles.w1Header}>
                        <Ionicons name={topHabit.icon as any} size={22} color={topHabit.color} />
                        <View style={[styles.w1Pill, { backgroundColor: `${topHabit.color}20` }]}>
                          <Ionicons name="flame" size={12} color={topHabit.color} />
                          <Text style={[styles.w1PillText, { color: topHabit.color }]}>
                            {calculateHabitStats(topHabit, logs).currentStreak}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.w1Title, { color: theme.text }]} numberOfLines={1}>
                        {topHabit.name}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onToggleToday(topHabit.id)}
                        style={[
                          styles.w1CheckBtn,
                          {
                            backgroundColor: (logs[topHabit.id]?.[todayStr] || 0) > 0 ? topHabit.color : theme.surface,
                            borderColor: topHabit.color,
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={(logs[topHabit.id]?.[todayStr] || 0) > 0 ? '#FFFFFF' : topHabit.color}
                        />
                        <Text
                          style={[
                            styles.w1CheckText,
                            { color: (logs[topHabit.id]?.[todayStr] || 0) > 0 ? '#FFFFFF' : topHabit.color },
                          ]}
                        >
                          {(logs[topHabit.id]?.[todayStr] || 0) > 0 ? 'مكتمل اليوم' : 'إنجاز الآن'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* 2. Widget 4x2: Daily Routine Checklist Widget */}
                <Text style={[styles.sectionTitle, { color: theme.textDim, marginTop: 18 }]}>
                  2. ودجت قائمة روتين اليوم التفاعلية (4x2 Daily Checklist)
                </Text>
                <View style={[styles.widgetContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <View style={[styles.widget4x2, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.w4Header}>
                      <View style={styles.w4ProgressBadge}>
                        <Text style={[styles.w4ProgressText, { color: '#10B981' }]}>
                          {globalStats.todayCompletedCount} / {globalStats.totalHabits} منجز
                        </Text>
                      </View>
                      <Text style={[styles.w4Title, { color: theme.text }]}>عادات اليوم</Text>
                    </View>

                    <View style={styles.w4List}>
                      {activeHabits.slice(0, 3).map((h) => {
                        const done = (logs[h.id]?.[todayStr] || 0) > 0;
                        return (
                          <TouchableOpacity
                            key={h.id}
                            activeOpacity={0.7}
                            onPress={() => onToggleToday(h.id)}
                            style={[
                              styles.w4Item,
                              {
                                backgroundColor: done ? `${h.color}15` : theme.surface,
                                borderColor: done ? h.color : theme.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.w4CheckCircle,
                                {
                                  backgroundColor: done ? h.color : 'transparent',
                                  borderColor: done ? h.color : theme.border,
                                },
                              ]}
                            >
                              {done && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                            </View>
                            <Text
                              style={[
                                styles.w4ItemText,
                                {
                                  color: theme.text,
                                  textDecorationLine: done ? 'line-through' : 'none',
                                  opacity: done ? 0.7 : 1,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {h.name}
                            </Text>
                            <Ionicons name={h.icon as any} size={16} color={h.color} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* 3. Circular Progress Ring Widget */}
                <Text style={[styles.sectionTitle, { color: theme.textDim, marginTop: 18 }]}>
                  3. ودجت حلقة الإنجاز والتحفيز (2x2 Circular Progress)
                </Text>
                <View style={[styles.widgetContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <View style={[styles.widget2x2, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={[styles.ringCircle, { borderColor: '#7C83FD', backgroundColor: 'rgba(124, 131, 253, 0.12)' }]}>
                      <Text style={[styles.ringPercent, { color: '#7C83FD' }]}>
                        {globalStats.todayCompletionRate}%
                      </Text>
                    </View>
                    <View style={styles.ringTextCol}>
                      <Text style={[styles.ringTitle, { color: theme.text }]}>معدل إنجاز اليوم</Text>
                      <Text style={[styles.ringSub, { color: theme.textMuted }]}>
                        {globalStats.todayCompletionRate === 100
                          ? 'يوم مثالي مكتمل بنجاح! 🏆'
                          : 'استمر، كل إنجاز يقربك من هدفك ✨'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              /* Notification Simulator Tab */
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textDim }]}>
                  تذكيرات العادات المجدولة
                </Text>
                <Text style={[styles.descText, { color: theme.textMuted }]}>
                  اضغط على أي عادة لتجربة إرسال إشعار التذكير فوراً والتأكد من عمل المؤقت
                </Text>

                {activeHabits.map((h) => {
                  return (
                    <View
                      key={h.id}
                      style={[
                        styles.reminderRow,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleTestReminder(h)}
                        style={[styles.testBtn, { backgroundColor: `${h.color}25`, borderColor: h.color }]}
                      >
                        <Ionicons name="notifications-outline" size={14} color={h.color} />
                        <Text style={[styles.testBtnText, { color: h.color }]}>تجربة الآن</Text>
                      </TouchableOpacity>

                      <View style={styles.reminderInfo}>
                        <Text style={[styles.reminderHabitName, { color: theme.text }]}>{h.name}</Text>
                        <Text style={[styles.reminderTimeText, { color: theme.textDim }]}>
                          {h.reminderTime ? `موعد التذكير: ${h.reminderTime}` : 'لم يحدد وقت (افتراضي 20:00)'}
                        </Text>
                      </View>

                      <View style={[styles.reminderIconBox, { backgroundColor: `${h.color}20` }]}>
                        <Ionicons name={h.icon as any} size={18} color={h.color} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: DIALOG_SAFE_TOP,
    paddingBottom: DIALOG_SAFE_BOTTOM,
  },
  modalCard: {
    width: '100%',
    maxHeight: '100%',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationToast: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#1E2336',
    borderWidth: 1.2,
    borderColor: '#7C83FD',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#7C83FD',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  notifIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7C83FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  notifTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  notifHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
  },
  notifAppTitle: {
    color: '#7C83FD',
    fontSize: 12,
    fontWeight: '800',
  },
  notifTime: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  notifBody: {
    color: '#F3F4F6',
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'right',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  descText: {
    fontSize: 11.5,
    marginBottom: 12,
    textAlign: 'right',
  },
  widgetContainer: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  widget1x1: {
    width: 160,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
  },
  w1Header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  w1Pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  w1PillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  w1Title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'right',
  },
  w1CheckBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
  },
  w1CheckText: {
    fontSize: 11,
    fontWeight: '800',
  },
  widget4x2: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  w4Header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  w4Title: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  w4ProgressBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  w4ProgressText: {
    fontSize: 11,
    fontWeight: '800',
  },
  w4List: {
    gap: 8,
  },
  w4Item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  w4CheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  w4ItemText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  widget2x2: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  ringCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  ringPercent: {
    fontSize: 16,
    fontWeight: '900',
  },
  ringTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ringTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
    textAlign: 'right',
  },
  ringSub: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'right',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  reminderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  reminderInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: 8,
  },
  reminderHabitName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'right',
  },
  reminderTimeText: {
    fontSize: 11,
    textAlign: 'right',
  },
  testBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
