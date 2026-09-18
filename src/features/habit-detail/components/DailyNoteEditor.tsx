import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { DialogHeader } from '../../../components/ModalHeader';
import { formatFriendlyDate } from '../../../utils/dateUtils';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../../../constants/layout';
import { FrostedDialogModal } from '../../../components/common/FrostedDialogModal';
import { LiquidGlassView } from '../../../components/common/LiquidGlassView';

import { isRTL, AppLanguage, t } from '../../../utils/i18n';

interface DailyNoteEditorProps {
  visible: boolean;
  selectedDateStr: string;
  noteText: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  theme: ThemeColors;
  language?: AppLanguage;
}

export const DailyNoteEditor: React.FC<DailyNoteEditorProps> = ({
  visible,
  selectedDateStr,
  noteText,
  onChangeText,
  onSave,
  onClose,
  theme,
  language = 'ar',
}) => {
  const rtl = isRTL(language);

  return (
    <FrostedDialogModal
      visible={visible}
      theme={theme}
      onClose={onClose}
      avoidKeyboard={true}
    >
      <LiquidGlassView theme={theme} style={styles.dialogCard}>
          {/* Header with Close button on the LEFT in RTL */}
          <DialogHeader
            title={language === 'ar' ? 'ملاحظة اليوم' : "Today's Note"}
            subtitle={formatFriendlyDate(selectedDateStr, language)}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          <TextInput
            value={noteText}
            onChangeText={onChangeText}
            placeholder={
              language === 'ar'
                ? 'ما الذي ساعدك على إنجاز العادة أو ما الذي عرقلك اليوم؟'
                : 'What helped you stay on track, or what challenged you today?'
            }
            placeholderTextColor={theme.textDim}
            multiline
            numberOfLines={4}
            textAlign={rtl ? 'right' : 'left'}
            style={[
              styles.textInput,
              {
                color: theme.text,
                backgroundColor: theme.inputBg || theme.surface,
                borderColor: theme.glassBorder || theme.border,
              },
            ]}
          />

          <View style={[styles.buttonsRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSave}
              style={[styles.saveBtn, { backgroundColor: '#FF6565' }]}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>{t('saveHabitNote', language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={[styles.cancelBtn, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.glassBorder || theme.border }]}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>{t('cancelAction', language)}</Text>
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: DIALOG_SAFE_TOP,
    paddingBottom: DIALOG_SAFE_BOTTOM,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  textInput: {
    fontSize: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    justifyContent: 'flex-start',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
