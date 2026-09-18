import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { Habit } from '../types/habit';
import { DialogHeader } from './ModalHeader';
import { FrostedDialogModal } from './common/FrostedDialogModal';
import { LiquidGlassView } from './common/LiquidGlassView';
import { hapticService } from '../services/hapticService';
import { formatFriendlyDate, getTodayString } from '../utils/dateUtils';

interface SlipReflectionModalProps {
  visible: boolean;
  habit: Habit | null;
  dateStr?: string;
  theme: ThemeColors;
  language: string;
  onClose: () => void;
  onConfirmSlip: (habitId: string, dateStr: string, reason: string) => void;
}

const COMMON_TRIGGERS = [
  'توتر وضغوط نفسية',
  'سهرة أو تجمّع اجتماعي',
  'ملل أو وقت فراغ',
  'إرهاق وقلة نوم',
  'رغبة ملحة مفاجئة',
  'أخرى',
];

export const SlipReflectionModal: React.FC<SlipReflectionModalProps> = ({
  visible,
  habit,
  dateStr = getTodayString(),
  theme,
  language,
  onClose,
  onConfirmSlip,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string>(COMMON_TRIGGERS[0]);
  const [reflectionNote, setReflectionNote] = useState<string>('');

  const handleConfirm = () => {
    if (!habit) return;
    hapticService.warning();
    const finalReason = reflectionNote.trim()
      ? `${selectedTrigger} - ${reflectionNote.trim()}`
      : selectedTrigger;
    onConfirmSlip(habit.id, dateStr, finalReason);
    setReflectionNote('');
    onClose();
  };

  if (!habit) return null;

  return (
    <FrostedDialogModal visible={visible && !!habit} theme={theme} onClose={onClose} avoidKeyboard={true}>
      <LiquidGlassView theme={theme} style={styles.dialogCard}>
          <DialogHeader
            title="تسجيل زلة ومراجعة التعافي"
            theme={theme}
            onClose={onClose}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Compassionate Guidance Banner */}
            <View style={[styles.guideBanner, { backgroundColor: 'rgba(231, 76, 60, 0.12)', borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
              <Ionicons name="shield-outline" size={22} color="#E74C3C" />
              <View style={styles.guideTextWrap}>
                <Text style={[styles.guideTitle, { color: '#E74C3C' }]}>
                  التعثر لا يعني العودة لنقطة الصفر
                </Text>
                <Text style={[styles.guideSub, { color: theme.text }]}>
                  التوثيق الصادق يمنحك قوة إدراكية. تحديد المحفز الآن هو أول خطوة لحماية مسارك غداً.
                </Text>
              </View>
            </View>

            {/* Target Habit Info */}
            <View style={[styles.habitSummaryRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.habitIconCircle, { backgroundColor: `${habit.color}25` }]}>
                <Ionicons name={(habit.icon as any) || 'ban'} size={18} color={habit.color} />
              </View>
              <View style={styles.habitMetaCol}>
                <Text style={[styles.habitNameText, { color: theme.text }]}>{habit.name}</Text>
                <Text style={[styles.dateSubText, { color: theme.textMuted }]}>
                  تاريخ اليوم: {formatFriendlyDate(dateStr, 'ar')}
                </Text>
              </View>
            </View>

            {/* Triggers Selector */}
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>ما المحفز أو السبب الأساسي للزلة؟</Text>
            <View style={styles.triggersGrid}>
              {COMMON_TRIGGERS.map((trigger) => {
                const isSelected = selectedTrigger === trigger;
                return (
                  <TouchableOpacity
                    key={trigger}
                    activeOpacity={0.75}
                    onPress={() => {
                      hapticService.selection();
                      setSelectedTrigger(trigger);
                    }}
                    style={[
                      styles.triggerChip,
                      {
                        backgroundColor: isSelected ? 'rgba(231, 76, 60, 0.18)' : theme.surface,
                        borderColor: isSelected ? '#E74C3C' : theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={14}
                      color={isSelected ? '#E74C3C' : theme.textDim}
                    />
                    <Text
                      style={[
                        styles.triggerText,
                        { color: isSelected ? '#E74C3C' : theme.text, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {trigger}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reflection Note Input */}
            <Text style={[styles.fieldLabel, { color: theme.textMuted, marginTop: 12 }]}>
              ملاحظة شخصية أو درس مستفاد (اختياري):
            </Text>
            <TextInput
              value={reflectionNote}
              onChangeText={setReflectionNote}
              placeholder="مثلاً: كنت بمفردي وشعرت بالتوتر، سأضع خطة بديلة للمرات القادمة..."
              placeholderTextColor={theme.textDim}
              multiline
              numberOfLines={3}
              style={[
                styles.noteInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            />

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.85}
                style={[styles.confirmBtn, { backgroundColor: '#E74C3C' }]}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>توثيق الزلة والنهوض مجدداً</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.75}
                style={[styles.cancelBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>تراجع، ما زلت صامداً</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LiquidGlassView>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  body: {
    padding: 18,
    gap: 10,
  },
  guideBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  guideTextWrap: {
    flex: 1,
    gap: 3,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  guideSub: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'right',
  },
  habitSummaryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  habitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitMetaCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  habitNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  triggersGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    textAlign: 'right',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actionsRow: {
    marginTop: 10,
    gap: 8,
  },
  confirmBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
