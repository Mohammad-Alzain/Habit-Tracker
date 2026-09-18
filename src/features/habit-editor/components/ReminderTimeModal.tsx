import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { FrostedDialogModal } from '../../../components/common/FrostedDialogModal';
import { LiquidGlassView } from '../../../components/common/LiquidGlassView';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { t, isRTL, AppLanguage } from '../../../utils/i18n';

export interface ReminderTimeModalProps {
  visible: boolean;
  theme: ThemeColors;
  language?: AppLanguage;
  reminderEnabled: boolean;
  reminderTime: string; // e.g. "08:00"
  customReminderText?: string;
  onClose: () => void;
  onSave: (enabled: boolean, time: string, customReminderText?: string) => void;
}

export const ReminderTimeModal: React.FC<ReminderTimeModalProps> = ({
  visible,
  theme,
  language = 'ar',
  reminderEnabled,
  reminderTime,
  customReminderText,
  onClose,
  onSave,
}) => {
  const rtl = isRTL(language);
  const [enabled, setEnabled] = useState(reminderEnabled);
  const [selectedTime, setSelectedTime] = useState(reminderTime || '08:00');
  const [customText, setCustomText] = useState(customReminderText || '');

  // Parse hour and minute from selectedTime
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (visible) {
      setEnabled(reminderEnabled);
      setCustomText(customReminderText || '');
      const timeStr = reminderTime || '08:00';
      setSelectedTime(timeStr);
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        setHours(parseInt(parts[0], 10) || 8);
        setMinutes(parseInt(parts[1], 10) || 0);
      }
    }
  }, [visible, reminderEnabled, reminderTime, customReminderText]);

  const updateTime = (newH: number, newM: number) => {
    const formatted = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    setSelectedTime(formatted);
  };

  const adjustHours = (delta: number) => {
    hapticService.selection();
    setHours((prev) => {
      let next = (prev + delta) % 24;
      if (next < 0) next = 23;
      updateTime(next, minutes);
      return next;
    });
  };

  const adjustMinutes = (delta: number) => {
    hapticService.selection();
    setMinutes((prev) => {
      let next = (prev + delta) % 60;
      if (next < 0) next = 55;
      updateTime(hours, next);
      return next;
    });
  };

  const handleSelectPreset = (time: string) => {
    hapticService.selection();
    setSelectedTime(time);
    setEnabled(true);
    const parts = time.split(':');
    if (parts.length === 2) {
      setHours(parseInt(parts[0], 10) || 8);
      setMinutes(parseInt(parts[1], 10) || 0);
    }
  };

  const suggestionChips = language === 'ar'
    ? [
        'حان وقت إنجاز العادة! الخطوة الأولى تصنع الفارق ✨',
        'لا تكسر السلسلة، دقيقة واحدة تكفي 🔥',
        'استمر! أنت أقرب مما تظن للوصول 🎯',
      ]
    : [
        'Time to do your habit! First step matters ✨',
        "Don't break the chain, 1 minute counts 🔥",
        "Keep going, you're closer than you think 🎯",
      ];

  const handleSave = () => {
    soundService.playComplete();
    hapticService.success();
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onSave(enabled, formatted, customText.trim() || undefined);
    onClose();
  };

  const presetTimes = [
    { label: t('presetMorning', language), time: '08:00' },
    { label: t('presetNoon', language), time: '13:00' },
    { label: t('presetEvening', language), time: '18:00' },
    { label: t('presetNight', language), time: '21:00' },
  ];

  return (
    <FrostedDialogModal visible={visible} theme={theme} onClose={onClose} avoidKeyboard={true}>
      <LiquidGlassView theme={theme} style={styles.modalCard}>
          {/* Header */}
          <View style={[styles.headerRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.inputBg || theme.surface }]}>
              <Ionicons name="close" size={18} color={theme.textDim} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('reminderModalTitle', language)}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Enable/Disable Switch Card */}
            <View
              style={[
                styles.toggleCard,
                {
                  backgroundColor: theme.inputBg || theme.surface,
                  borderColor: enabled ? 'rgba(255, 101, 101, 0.4)' : theme.border,
                  flexDirection: rtl ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.toggleTextWrap, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>
                  {t('dailyReminderSwitch', language)}
                </Text>
                <Text style={[styles.toggleSubtitle, { color: theme.textMuted }]}>
                  {enabled
                    ? (language === 'ar' ? 'ستصلك رسالة تذكير في الوقت المحدد' : 'You will receive reminders at this time')
                    : (language === 'ar' ? 'التنبيه متوقف حالياً' : 'Reminder is currently disabled')}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(val) => {
                  hapticService.selection();
                  setEnabled(val);
                }}
                trackColor={{ false: '#3A3A44', true: '#FF6565' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Time Picker Controls (Visible when enabled) */}
            {enabled && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  {t('reminderTimeSection', language)}
                </Text>

                {/* Digital Clock Display & Steppers */}
                <View
                  style={[
                    styles.clockContainer,
                    {
                      backgroundColor: theme.inputBg || theme.surface,
                      borderColor: theme.glassBorder || theme.border,
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  {/* Hours */}
                  <View style={styles.clockColumn}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => adjustHours(1)}
                      style={[styles.arrowBtn, { backgroundColor: theme.surface }]}
                    >
                      <Ionicons name="chevron-up" size={20} color={theme.text} />
                    </TouchableOpacity>

                    <Text style={[styles.timeDigit, { color: '#FF6565' }]}>
                      {String(hours).padStart(2, '0')}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => adjustHours(-1)}
                      style={[styles.arrowBtn, { backgroundColor: theme.surface }]}
                    >
                      <Ionicons name="chevron-down" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.timeUnitLabel, { color: theme.textDim }]}>
                      {t('reminderHour', language)}
                    </Text>
                  </View>

                  <Text style={[styles.timeColon, { color: theme.textDim }]}>:</Text>

                  {/* Minutes */}
                  <View style={styles.clockColumn}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => adjustMinutes(5)}
                      style={[styles.arrowBtn, { backgroundColor: theme.surface }]}
                    >
                      <Ionicons name="chevron-up" size={20} color={theme.text} />
                    </TouchableOpacity>

                    <Text style={[styles.timeDigit, { color: '#FF6565' }]}>
                      {String(minutes).padStart(2, '0')}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => adjustMinutes(-5)}
                      style={[styles.arrowBtn, { backgroundColor: theme.surface }]}
                    >
                      <Ionicons name="chevron-down" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.timeUnitLabel, { color: theme.textDim }]}>
                      {t('reminderMinute', language)}
                    </Text>
                  </View>
                </View>

                {/* Preset Times */}
                <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 16, textAlign: rtl ? 'right' : 'left' }]}>
                  {t('reminderPresets', language)}
                </Text>
                <View style={styles.presetsList}>
                  {presetTimes.map((preset) => {
                    const isSel = selectedTime === preset.time;
                    return (
                      <TouchableOpacity
                        key={preset.time}
                        activeOpacity={0.75}
                        onPress={() => handleSelectPreset(preset.time)}
                        style={[
                          styles.presetRow,
                          {
                            backgroundColor: isSel ? 'rgba(255, 101, 101, 0.14)' : (theme.inputBg || theme.surface),
                            borderColor: isSel ? '#FF6565' : (theme.glassBorder || theme.border),
                            flexDirection: rtl ? 'row-reverse' : 'row',
                          },
                        ]}
                      >
                        <Ionicons
                          name={isSel ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={isSel ? '#FF6565' : theme.textDim}
                        />
                        <Text
                          style={[
                            styles.presetLabel,
                            {
                              color: isSel ? theme.text : theme.textMuted,
                              fontWeight: isSel ? '800' : '600',
                            },
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Reminder Message */}
                <View style={styles.customMessageSection}>
                  <Text style={[styles.sectionTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                    {language === 'ar' ? 'رسالة التنبيه المخصصة (اختياري)' : 'Custom Reminder Message (Optional)'}
                  </Text>
                  <TextInput
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder={language === 'ar' ? 'اكتب رسالة تحفيزية تصلك مع التنبيه...' : 'Write an inspiring message for this habit...'}
                    placeholderTextColor={theme.textDim}
                    style={[
                      styles.customTextInput,
                      {
                        backgroundColor: theme.inputBg || theme.surface,
                        borderColor: theme.glassBorder || theme.border,
                        color: theme.text,
                        textAlign: rtl ? 'right' : 'left',
                      },
                    ]}
                    maxLength={120}
                  />

                  {/* Quick Suggestion Chips */}
                  <View style={[styles.suggestionChipsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    {suggestionChips.map((chip, idx) => {
                      const isSelected = customText === chip;
                      return (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.75}
                          onPress={() => {
                            hapticService.light();
                            setCustomText(isSelected ? '' : chip);
                          }}
                          style={[
                            styles.suggestionChip,
                            {
                              backgroundColor: isSelected ? 'rgba(255, 101, 101, 0.15)' : (theme.inputBg || theme.surface),
                              borderColor: isSelected ? '#FF6565' : (theme.glassBorder || theme.border),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.suggestionChipText,
                              { color: isSelected ? '#FF6565' : theme.textMuted },
                            ]}
                          >
                            {chip}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Behavioral Hint */}
                <View
                  style={[
                    styles.hintCard,
                    {
                      backgroundColor: 'rgba(124, 131, 253, 0.12)',
                      borderColor: 'rgba(124, 131, 253, 0.3)',
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Ionicons name="bulb-outline" size={18} color="#7C83FD" />
                  <Text style={[styles.hintText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                    {t('reminderTip', language)}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: '#FF6565', flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <Ionicons name="notifications-outline" size={19} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {t('confirmReminderBtn', language)}
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
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
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
    paddingBottom: 12,
  },
  toggleCard: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 16,
  },
  toggleTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  toggleSubtitle: {
    fontSize: 11.5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.2,
    gap: 16,
  },
  clockColumn: {
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigit: {
    fontSize: 34,
    fontWeight: '900',
    minWidth: 50,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 20,
  },
  timeUnitLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetsList: {
    gap: 8,
    marginBottom: 16,
  },
  presetRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  presetLabel: {
    fontSize: 12.5,
  },
  customMessageSection: {
    marginBottom: 16,
  },
  customTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 10,
  },
  suggestionChipsRow: {
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hintCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
