import React from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, Platform } from 'react-native';
import { ThemeColors } from '../../../constants/theme';
import { AppSettings } from '../../../store/habitStore';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { settingsStyles as styles } from '../styles/settingsStyles';
import { BlurOverlay } from '../../../components/common/BlurOverlay';

interface GeneralSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
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
            title={t('general', language)}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* بداية الأسبوع */}
          <View style={[styles.settingControlRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start', marginHorizontal: 8 }}>
              <Text style={[styles.controlLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('startOfWeekLabel', language)}
              </Text>
              <Text style={[styles.controlSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                {language === 'ar' ? 'اليوم الذي تبدأ به شبكة الأسبوع' : 'First day of the weekly calendar grid'}
              </Text>
            </View>

            <View style={[styles.segmentChoice, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                onPress={() => onUpdateSettings?.({ startOfWeek: 'monday' })}
                style={[
                  styles.segmentBtnHalf,
                  settings.startOfWeek === 'monday' && { backgroundColor: '#7C83FD' },
                ]}
              >
                <Text
                  style={[
                    styles.segmentBtnHalfText,
                    { color: settings.startOfWeek === 'monday' ? '#FFFFFF' : theme.textMuted },
                  ]}
                >
                  {t('monday', language)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onUpdateSettings?.({ startOfWeek: 'sunday' })}
                style={[
                  styles.segmentBtnHalf,
                  settings.startOfWeek === 'sunday' && { backgroundColor: '#7C83FD' },
                ]}
              >
                <Text
                  style={[
                    styles.segmentBtnHalfText,
                    { color: settings.startOfWeek === 'sunday' ? '#FFFFFF' : theme.textMuted },
                  ]}
                >
                  {t('sunday', language)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* المؤثرات الصوتية */}
          <View style={[styles.settingControlRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start', marginHorizontal: 8 }}>
              <Text style={[styles.controlLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                {language === 'ar' ? 'المؤثرات الصوتية' : 'Sound Effects'}
              </Text>
              <Text style={[styles.controlSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                {language === 'ar' ? 'تشغيل نغمة خفيفة عند إنجاز العادة' : 'Play a subtle chime upon completing habits'}
              </Text>
            </View>

            <Switch
              value={settings.soundEffects ?? true}
              onValueChange={(val) => {
                hapticService.selection();
                onUpdateSettings?.({ soundEffects: val });
              }}
              trackColor={{ false: '#3A3A44', true: '#7C83FD' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* الاهتزاز التفاعلي */}
          <View style={[styles.settingControlRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start', marginHorizontal: 8 }}>
              <Text style={[styles.controlLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                {language === 'ar' ? 'الاهتزاز اللمسي (Haptics)' : 'Haptic Feedback'}
              </Text>
              <Text style={[styles.controlSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                {language === 'ar' ? 'نبضة لمسية مريحة مع كل ضغطة' : 'Tactile haptic pulses on buttons and toggles'}
              </Text>
            </View>

            <Switch
              value={settings.hapticFeedback ?? true}
              onValueChange={(val) => {
                hapticService.selection();
                onUpdateSettings?.({ hapticFeedback: val });
              }}
              trackColor={{ false: '#3A3A44', true: '#7C83FD' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 16 }]}
          >
            <Text style={styles.confirmBtnText}>{t('done', language)}</Text>
          </TouchableOpacity>
        </View>
      </BlurOverlay>
    </Modal>
  );
};
