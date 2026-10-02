import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { BlurOverlay } from './common/BlurOverlay';
import { ModalHeader } from './ModalHeader';
import { AppLanguage, isRTL } from '../utils/i18n';
import { habitStore, useHabitStore } from '../store/habitStore';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';
import { getTodayString, formatDateToISO } from '../utils/dateUtils';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';

interface StreakFreezeModalProps {
  visible: boolean;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
}

export const StreakFreezeModal: React.FC<StreakFreezeModalProps> = ({
  visible,
  theme,
  language = 'ar',
  onClose,
}) => {
  const store = useHabitStore();
  const rtl = isRTL(language);
  const freezeCount = store.freezeBankCount ?? 2;

  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterday);

  const activeHabits = store.habits.filter((h) => !h.archived);
  const isTodayFrozen = activeHabits.length > 0 && activeHabits.every((h) => (h.streakFreezeDays || []).includes(todayStr));
  const isYesterdayFrozen = activeHabits.length > 0 && activeHabits.every((h) => (h.streakFreezeDays || []).includes(yesterdayStr));

  const handleToggleFreeze = (dateStr: string, dateLabel: string) => {
    const res = habitStore.useFreezeForDate(dateStr);
    if (res.success) {
      if (res.isFrozen) {
        soundService.playFreeze();
        hapticService.success();
        Alert.alert('تم التجميد بنجاح', `تم تفعيل درع التجميد لحماية ستريك ${dateLabel}.\nالمتبقي في بنك التجميد: ${res.remaining} دروع`);
      } else {
        hapticService.light();
        Alert.alert('استعادة الدرع', `تم إلغاء التجميد واستعادة الدرع إلى بنك التجميد.\nرصيدك الآن: ${res.remaining} دروع`);
      }
    } else {
      hapticService.warning();
      Alert.alert('رصيد التجميد نفد', 'لا يوجد دروع تجميد متبقية في رصيدك. واصل إنجاز عاداتك 7 أيام متواصلة لكسب درع تجميد جديد مجاناً!');
    }
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
            title="بنك تجميد السلسلة"
            onClose={onClose}
            theme={theme}
            isRTL={rtl}
          />



          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            {/* Ice Shield Showcase Banner */}
            <View
              style={[
                styles.showcaseBanner,
                {
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  borderColor: '#0284C7',
                },
              ]}
            >
              <View style={styles.shieldsRow}>
                {[1, 2, 3, 4].map((slot) => {
                  const isAvailable = slot <= freezeCount;
                  return (
                    <View
                      key={slot}
                      style={[
                        styles.shieldSlot,
                        {
                          backgroundColor: isAvailable ? '#0284C7' : (theme.glassSurface || 'rgba(255,255,255,0.05)'),
                          borderColor: isAvailable ? '#38BDF8' : theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isAvailable ? 'snow' : 'shield-outline'}
                        size={24}
                        color={isAvailable ? '#FFFFFF' : theme.textMuted}
                      />
                    </View>
                  );
                })}
              </View>

              <Text style={[styles.freezeCounterTitle, { color: theme.text }]}>
                {freezeCount} من 4 دروع تجميد متاحة
              </Text>
              <Text style={[styles.freezeSubText, { color: theme.textMuted, textAlign: 'center' }]}>
                دروع التجميد تتدخل تلقائياً لتحمي الستريك (أيام الاستمرار) في حال اضطررت للغياب أو الانشغال.
              </Text>
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              إجراءات التجميد السريعة
            </Text>

            {/* Freeze Today */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToggleFreeze(todayStr, 'اليوم')}
              style={[
                styles.actionCard,
                {
                  backgroundColor: isTodayFrozen ? 'rgba(2, 132, 199, 0.18)' : (theme.glassSurface || theme.surface),
                  borderColor: isTodayFrozen ? '#0284C7' : theme.border,
                  flexDirection: rtl ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.actionIconBox, { backgroundColor: isTodayFrozen ? '#0284C7' : 'rgba(56, 189, 248, 0.12)' }]}>
                <Ionicons name="snow" size={20} color={isTodayFrozen ? '#FFFFFF' : '#38BDF8'} />
              </View>
              <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.actionCardTitle, { color: theme.text }]}>
                  {isTodayFrozen ? 'اليوم محمي بالتجميد' : 'تجميد اليوم لحماية الستريك'}
                </Text>
                <Text style={[styles.actionCardSub, { color: theme.textMuted }]}>
                  {isTodayFrozen ? 'اضغط لإلغاء التجميد واستعادة الدرع' : 'يستخدم 1 درع تجميد لحماية جميع عادات اليوم'}
                </Text>
              </View>
              <View
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: isTodayFrozen ? '#0284C7' : (theme.surface || '#252530'),
                  },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: isTodayFrozen ? '#FFFFFF' : theme.textMuted }}>
                  {isTodayFrozen ? 'مفعّل' : 'تجميد'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Freeze Yesterday */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToggleFreeze(yesterdayStr, 'يوم أمس')}
              style={[
                styles.actionCard,
                {
                  backgroundColor: isYesterdayFrozen ? 'rgba(2, 132, 199, 0.18)' : (theme.glassSurface || theme.surface),
                  borderColor: isYesterdayFrozen ? '#0284C7' : theme.border,
                  flexDirection: rtl ? 'row-reverse' : 'row',
                  marginTop: 10,
                },
              ]}
            >
              <View style={[styles.actionIconBox, { backgroundColor: isYesterdayFrozen ? '#0284C7' : 'rgba(56, 189, 248, 0.12)' }]}>
                <Ionicons name="time-outline" size={20} color={isYesterdayFrozen ? '#FFFFFF' : '#38BDF8'} />
              </View>
              <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.actionCardTitle, { color: theme.text }]}>
                  {isYesterdayFrozen ? 'أمس محمي بالتجميد' : 'إنقاذ ستريك الأمس (درع رجعي)'}
                </Text>

                <Text style={[styles.actionCardSub, { color: theme.textMuted }]}>
                  {isYesterdayFrozen ? 'اضغط لإلغاء التجميد واستعادة الدرع' : 'هل فاتك إنجاز الأمس؟ جمّد الأمس واستعد ستريكك!'}
                </Text>
              </View>
              <View
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: isYesterdayFrozen ? '#0284C7' : (theme.surface || '#252530'),
                  },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: isYesterdayFrozen ? '#FFFFFF' : theme.textMuted }}>
                  {isYesterdayFrozen ? 'مفعّل' : 'إنقاذ'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Rules explanation box */}
            <View
              style={[
                styles.rulesBox,
                {
                  backgroundColor: theme.glassSurface || theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={[styles.rulesHeaderRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <Ionicons name="sparkles" size={16} color="#F59E0B" />
                <Text style={[styles.rulesHeaderTitle, { color: theme.text }]}>
                  كيف يعمل نظام حماية السلسلة؟
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={[styles.ruleBullet, { color: '#0284C7' }]}>•</Text>
                <Text style={[styles.ruleDesc, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  كل درع تجميد يحمي يوماً كاملاً لجميع عاداتك من انكسار الستريك التراكمي.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={[styles.ruleBullet, { color: '#0284C7' }]}>•</Text>
                <Text style={[styles.ruleDesc, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  تحصل تلقائياً على درع تجميد جديد مجاني عند الاستمرار لمدة 7 أو 14 يوماً في أي عادة (الحد الأقصى للرصيد: 4 دروع).
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={[styles.ruleBullet, { color: '#0284C7' }]}>•</Text>
                <Text style={[styles.ruleDesc, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  إذا قمت بإلغاء تجميد أي يوم، يسترد بنك التجميد درعك فوراً بدون أي خسارة.
                </Text>
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '88%',
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
  showcaseBanner: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  shieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  shieldSlot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  freezeCounterTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  freezeSubText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 10,
  },
  actionCard: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionCardSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rulesBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  rulesHeaderRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rulesHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleBullet: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '900',
  },
  ruleDesc: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
