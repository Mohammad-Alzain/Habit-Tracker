import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitGoalType, DayOfWeek, HabitFrequency } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { FrostedDialogModal } from '../../../components/common/FrostedDialogModal';
import { LiquidGlassView } from '../../../components/common/LiquidGlassView';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { t, isRTL, AppLanguage } from '../../../utils/i18n';

export interface GoalFrequencyModalProps {
  visible: boolean;
  theme: ThemeColors;
  language?: AppLanguage;
  initialGoalType: HabitGoalType;
  initialTargetValue: number;
  initialGoalFrequency: string;
  initialCustomDays?: DayOfWeek[];
  initialFrequency?: HabitFrequency;
  onClose: () => void;
  onSave: (
    goalType: HabitGoalType,
    targetValue: number,
    goalFrequencyTitle: string,
    customDays: DayOfWeek[],
    frequency: HabitFrequency
  ) => void;
}

const getDaysOfWeek = (lang: AppLanguage): { id: DayOfWeek; label: string }[] => [
  { id: 6, label: lang === 'ar' ? 'السبت' : 'Sat' },
  { id: 0, label: lang === 'ar' ? 'الأحد' : 'Sun' },
  { id: 1, label: lang === 'ar' ? 'الإثنين' : 'Mon' },
  { id: 2, label: lang === 'ar' ? 'الثلاثاء' : 'Tue' },
  { id: 3, label: lang === 'ar' ? 'الأربعاء' : 'Wed' },
  { id: 4, label: lang === 'ar' ? 'الخميس' : 'Thu' },
  { id: 5, label: lang === 'ar' ? 'الجمعة' : 'Fri' },
];

export const GoalFrequencyModal: React.FC<GoalFrequencyModalProps> = ({
  visible,
  theme,
  language = 'ar',
  initialGoalType,
  initialTargetValue,
  initialGoalFrequency,
  initialCustomDays,
  initialFrequency,
  onClose,
  onSave,
}) => {
  const rtl = isRTL(language);
  const [selectedGoalType, setSelectedGoalType] = useState<HabitGoalType>(initialGoalType || 'days');
  const [targetVal, setTargetVal] = useState<number>(initialTargetValue || 66);
  const [frequencyText, setFrequencyText] = useState<string>(initialGoalFrequency || t('dailyPreset', language));
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    initialCustomDays && initialCustomDays.length > 0
      ? initialCustomDays
      : [0, 1, 2, 3, 4, 5, 6]
  );

  useEffect(() => {
    if (visible) {
      setSelectedGoalType(initialGoalType || 'days');
      setTargetVal(initialTargetValue || 66);
      setFrequencyText(initialGoalFrequency || t('dailyPreset', language));
      setSelectedDays(
        initialCustomDays && initialCustomDays.length > 0
          ? initialCustomDays
          : [0, 1, 2, 3, 4, 5, 6]
      );
    }
  }, [visible, initialGoalType, initialTargetValue, initialGoalFrequency, initialCustomDays]);

  const toggleDay = (day: DayOfWeek) => {
    hapticService.selection();
    let next: DayOfWeek[];
    if (selectedDays.includes(day)) {
      if (selectedDays.length <= 1) return; // Keep at least 1 day
      next = selectedDays.filter((d) => d !== day);
    } else {
      next = [...selectedDays, day];
    }
    setSelectedDays(next);
    if (next.length === 7) {
      setFrequencyText(t('dailyPreset', language));
    } else {
      setFrequencyText(
        language === 'ar'
          ? `${next.length} ${t('daysPerWeek', language)}`
          : `${next.length} ${t('daysPerWeek', language)}`
      );
    }
  };

  const handleSelectPreset = (days: DayOfWeek[], label: string) => {
    hapticService.selection();
    setSelectedDays(days);
    setFrequencyText(label);
  };

  const handleAdjustTarget = (delta: number) => {
    hapticService.light();
    setTargetVal((prev) => Math.max(1, prev + delta));
  };

  const handleSave = () => {
    soundService.playComplete();
    hapticService.success();

    const computedTitle =
      selectedGoalType === 'days'
        ? (language === 'ar' ? `الاستمرار لـ ${targetVal} يوماً` : `Continue for ${targetVal} days`)
        : selectedGoalType === 'months'
        ? (language === 'ar' ? `الاستمرار لـ ${targetVal} أشهر` : `Continue for ${targetVal} months`)
        : selectedGoalType === 'streak'
        ? (language === 'ar' ? `ستريك ${targetVal} يوم متواصل` : `Consecutive streak for ${targetVal} days`)
        : `${targetVal} ${t('targetUnit', language)} (${frequencyText})`;

    const computedFrequency: HabitFrequency = selectedDays.length === 7 ? 'daily' : 'custom';

    onSave(selectedGoalType, targetVal, computedTitle, selectedDays, computedFrequency);
    onClose();
  };

  const daysList = getDaysOfWeek(language);

  const presetFrequencies = [
    { id: 'daily', label: t('dailyPreset', language), days: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[] },
    { id: 'workdays', label: t('workdaysPreset', language), days: [0, 1, 2, 3, 4] as DayOfWeek[] },
    { id: 'weekend', label: t('weekendPreset', language), days: [5, 6] as DayOfWeek[] },
    { id: '3days', label: language === 'ar' ? '3 أيام / أسبوع' : '3 days / week', days: [0, 2, 4] as DayOfWeek[] },
    { id: '4days', label: language === 'ar' ? '4 أيام / أسبوع' : '4 days / week', days: [0, 1, 3, 5] as DayOfWeek[] },
  ];

  const presetDaysList = [
    { label: language === 'ar' ? '21 يوماً (انطلاقة)' : '21 Days (Kickstart)', value: 21 },
    { label: language === 'ar' ? '66 يوماً (عادة راسخة)' : '66 Days (Form Habit)', value: 66 },
    { label: language === 'ar' ? '100 يوم (إتقان)' : '100 Days (Mastery)', value: 100 },
    { label: language === 'ar' ? '365 يوم (سنة كاملة)' : '365 Days (Full Year)', value: 365 },
  ];

  return (
    <FrostedDialogModal visible={visible} theme={theme} onClose={onClose}>
      <LiquidGlassView theme={theme} style={styles.modalCard}>
          {/* Header */}
          <View style={[styles.headerRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.inputBg || theme.surface }]}>
              <Ionicons name="close" size={18} color={theme.textDim} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('goalFrequency', language)}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Section 1: Frequency */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                {t('habitFrequencySection', language)}
              </Text>

              {/* Presets */}
              <View style={[styles.chipsWrap, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                {presetFrequencies.map((item) => {
                  const isSelected =
                    selectedDays.length === item.days.length &&
                    item.days.every((d) => selectedDays.includes(d));
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.75}
                      onPress={() => handleSelectPreset(item.days, item.label)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? 'rgba(124, 131, 253, 0.18)' : (theme.inputBg || theme.surface),
                          borderColor: isSelected ? '#7C83FD' : (theme.glassBorder || theme.border),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? '#7C83FD' : theme.textMuted,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Day of Week Selector */}
              <Text style={[styles.subLabel, { color: theme.textDim, textAlign: rtl ? 'right' : 'left' }]}>
                {t('targetDaysLabel', language)}
              </Text>
              <View style={[styles.daysRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                {daysList.map((d) => {
                  const isSelected = selectedDays.includes(d.id);
                  return (
                    <TouchableOpacity
                      key={d.id}
                      activeOpacity={0.7}
                      onPress={() => toggleDay(d.id)}
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: isSelected ? '#7C83FD' : (theme.inputBg || theme.surface),
                          borderColor: isSelected ? '#7C83FD' : (theme.glassBorder || theme.border),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected ? '#FFFFFF' : theme.textMuted,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {d.label.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Strategic Goal Type */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                {t('strategicGoalSection', language)}
              </Text>
              <View style={[styles.goalTypeRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                {[
                  { id: 'days', label: t('goalDaysShort', language), icon: 'calendar-outline' },
                  { id: 'streak', label: t('goalStreakShort', language), icon: 'flame-outline' },
                  { id: 'months', label: t('goalMonthsShort', language), icon: 'time-outline' },
                ].map((gt) => {
                  const isSel = selectedGoalType === gt.id;
                  return (
                    <TouchableOpacity
                      key={gt.id}
                      activeOpacity={0.75}
                      onPress={() => {
                        hapticService.selection();
                        setSelectedGoalType(gt.id as HabitGoalType);
                        if (gt.id === 'months' && targetVal > 12) {
                          setTargetVal(3);
                        } else if (gt.id === 'days' && targetVal < 10) {
                          setTargetVal(66);
                        }
                      }}
                      style={[
                        styles.goalTypeCard,
                        {
                          backgroundColor: isSel ? 'rgba(124, 131, 253, 0.18)' : (theme.inputBg || theme.surface),
                          borderColor: isSel ? '#7C83FD' : (theme.glassBorder || theme.border),
                        },
                      ]}
                    >
                      <Ionicons name={gt.icon as any} size={18} color={isSel ? '#7C83FD' : theme.textMuted} />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.goalTypeText,
                          {
                            color: isSel ? '#7C83FD' : theme.textMuted,
                            fontWeight: isSel ? '800' : '600',
                          },
                        ]}
                      >
                        {gt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Target Stepper */}
              <View
                style={[
                  styles.stepperBox,
                  {
                    backgroundColor: theme.inputBg || theme.surface,
                    borderColor: theme.glassBorder || theme.border,
                    flexDirection: rtl ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAdjustTarget(selectedGoalType === 'months' ? 1 : 5)}
                  style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
                >
                  <Ionicons name="add" size={20} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.stepperValWrap}>
                  <Text style={[styles.stepperValue, { color: theme.text }]}>
                    {targetVal}
                  </Text>
                  <Text style={[styles.stepperUnit, { color: theme.textMuted }]}>
                    {selectedGoalType === 'months'
                      ? t('monthsUnit', language)
                      : selectedGoalType === 'days'
                      ? t('daysUnit', language)
                      : t('daysUnit', language)}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAdjustTarget(selectedGoalType === 'months' ? -1 : -5)}
                  style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
                >
                  <Ionicons name="remove" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Quick Preset Days */}
              {selectedGoalType === 'days' && (
                <View style={[styles.presetsWrap, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  {presetDaysList.map((p) => {
                    const isSel = targetVal === p.value;
                    return (
                      <TouchableOpacity
                        key={p.value}
                        activeOpacity={0.75}
                        onPress={() => {
                          hapticService.selection();
                          setTargetVal(p.value);
                        }}
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: isSel ? 'rgba(46, 213, 115, 0.18)' : (theme.inputBg || theme.surface),
                            borderColor: isSel ? '#2ED573' : (theme.glassBorder || theme.border),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetPillText,
                            {
                              color: isSel ? '#2ED573' : theme.textMuted,
                              fontWeight: isSel ? '800' : '600',
                            },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={[styles.confirmBtn, { backgroundColor: '#7C83FD', flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              {t('confirmGoalFrequency', language)}
            </Text>
          </TouchableOpacity>
        </LiquidGlassView>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  daysRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
  },
  goalTypeRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 12,
  },
  goalTypeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  goalTypeText: {
    fontSize: 11,
    textAlign: 'center',
  },
  stepperBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValWrap: {
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  stepperUnit: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  presetsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 11,
  },
  confirmBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    marginTop: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
