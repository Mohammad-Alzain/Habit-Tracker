import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { settingsStyles as styles } from '../styles/settingsStyles';
import { BlurOverlay } from '../../../components/common/BlurOverlay';

interface ArchivedHabitsModalProps {
  visible: boolean;
  onClose: () => void;
  archivedHabits: Habit[];
  onUnarchiveHabit?: (habitId: string) => void;
  onDeleteHabit?: (habitId: string) => void;
  onShowStatus: (type: 'success' | 'error', text: string) => void;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
}

export const ArchivedHabitsModal: React.FC<ArchivedHabitsModalProps> = ({
  visible,
  onClose,
  archivedHabits,
  onUnarchiveHabit,
  onDeleteHabit,
  onShowStatus,
  theme,
  language,
  rtl,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.dataModalOverlay}>
        <View
          style={[
            styles.dataModalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: theme.text === '#FFFFFF' ? 0.35 : 0.12,
              shadowRadius: 24,
              elevation: 12,
            },
          ]}
        >
          <DialogHeader
            title={t('archivedHabits', language)}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {archivedHabits.length === 0 ? (
            <View style={styles.emptyArchiveBox}>
              <Ionicons name="archive-outline" size={44} color={theme.textDim} />
              <Text style={[styles.emptyArchiveTitle, { color: theme.text }]}>لا توجد عادات مؤرشفة حالياً</Text>
              <Text style={[styles.emptyArchiveSub, { color: theme.textMuted }]}>
                يمكنك أرشفة أي عادة لإخفائها من الشاشة الرئيسية دون فقدان سجلاتها أو إحصائياتها.
              </Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 320 }}>
              {archivedHabits.map((habit) => (
                <View
                  key={habit.id}
                  style={[
                    styles.archivedHabitRow,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  {/* Leading: Habit Dot and Name */}
                  <View
                    style={[
                      styles.archivedHabitInfo,
                      {
                        flex: 1,
                        flexDirection: rtl ? 'row-reverse' : 'row',
                        justifyContent: rtl ? 'flex-start' : 'flex-start',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.archivedHabitDot,
                        { backgroundColor: habit.color, borderColor: `${habit.color}80` },
                      ]}
                    />
                    <Text
                      style={[
                        styles.archivedHabitName,
                        { color: theme.text, textAlign: rtl ? 'right' : 'left', flexShrink: 1 },
                      ]}
                    >
                      {habit.name}
                    </Text>
                  </View>

                  {/* Trailing: Action Buttons */}
                  <View style={[styles.archivedActions, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      onPress={() => {
                        onUnarchiveHabit?.(habit.id);
                        onShowStatus('success', `تمت استعادة "${habit.name}" للشاشة الرئيسية`);
                      }}
                      style={[styles.archiveActionBtn, { backgroundColor: '#7C83FD20' }]}
                    >
                      <Text style={{ color: '#7C83FD', fontSize: 12, fontWeight: '700' }}>
                        {language === 'ar' ? 'استعادة' : 'Restore'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          language === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Deletion',
                          language === 'ar'
                            ? `هل تريد حذف عادة "${habit.name}" وسجلاتها نهائياً؟`
                            : `Permanently delete habit "${habit.name}" and all logs?`,
                          [
                            { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
                            {
                              text: language === 'ar' ? 'حذف' : 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                onDeleteHabit?.(habit.id);
                                onShowStatus('success', `تم حذف "${habit.name}" نهائياً`);
                              },
                            },
                          ]
                        );
                      }}
                      style={[
                        styles.archiveActionBtn,
                        {
                          backgroundColor: '#FF656520',
                          marginLeft: rtl ? 0 : 6,
                          marginRight: rtl ? 6 : 0,
                        },
                      ]}
                    >
                      <Text style={{ color: '#FF6565', fontSize: 12, fontWeight: '700' }}>
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
          >
            <Text style={styles.confirmBtnText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </BlurOverlay>
    </Modal>
  );
};
