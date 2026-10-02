import React from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { AppSettings } from '../../../store/habitStore';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { SoundTheme } from '../../../types/habit';
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

const SOUND_THEMES: { id: SoundTheme; name: string; desc: string; icon: string; color: string }[] = [
  {
    id: 'classic',
    name: 'كريستال كلاسيكي',
    desc: 'رنين ثلاثي النغمات متناغم وأنيق',
    icon: 'sparkles',
    color: '#7C83FD',
  },
  {
    id: 'arcade',
    name: 'أركيد ريترو 8-بت',
    desc: 'نغمات انتصار ألعاب كلاسيكية سريعة ومحفزة',
    icon: 'game-controller',
    color: '#F97316',
  },
  {
    id: 'zen',
    name: 'زن تأملي هادئ',
    desc: 'رنين وعاء تبتي عميق يعزز السكينة والتركيز',
    icon: 'leaf',
    color: '#10B981',
  },
  {
    id: 'pop',
    name: 'بابلز مرح',
    desc: 'فقاعات لطيفة مرنة ومبهجة مع كل إنجاز',
    icon: 'water',
    color: '#38BDF8',
  },
];

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
  theme,
  language,
  rtl,
}) => {
  const currentSoundTheme: SoundTheme = settings.soundTheme || 'classic';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.dataModalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
              maxHeight: '85%',
            },
          ]}
        >
          <DialogHeader
            title={language === 'ar' ? 'الإعدادات واستوديو الأصوات' : 'General & Sound Studio'}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />


          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
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
                  {language === 'ar' ? 'تشغيل نغمة مميزة عند إنجاز العادات والأهداف' : 'Play a chime upon completing habits'}
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

            {/* استوديو نغمات الإنجاز */}
            {settings.soundEffects !== false && (
              <View style={{ marginTop: 12, marginBottom: 8, paddingHorizontal: 6 }}>
                <Text style={[styles.controlLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left', marginBottom: 4 }]}>
                  استوديو نغمات الإنجاز (Sound Themes)
                </Text>
                <Text style={[styles.controlSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left', marginBottom: 12 }]}>
                  اختر الطابع الصوتي المفضل لديك واستمع للمعاينة الفورية:
                </Text>

                <View style={{ gap: 8 }}>
                  {SOUND_THEMES.map((st) => {
                    const isSelected = currentSoundTheme === st.id;
                    return (
                      <TouchableOpacity
                        key={st.id}
                        activeOpacity={0.75}
                        onPress={() => {
                          hapticService.selection();
                          soundService.playComplete(st.id);
                          onUpdateSettings?.({ soundTheme: st.id });
                        }}
                        style={{
                          flexDirection: rtl ? 'row-reverse' : 'row',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: isSelected ? st.color : theme.border,
                          backgroundColor: isSelected ? `${st.color}15` : (theme.glassSurface || theme.surface),
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            backgroundColor: `${st.color}25`,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name={st.icon as any} size={18} color={st.color} />
                        </View>

                        <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                          <Text style={{ fontSize: 13.5, fontWeight: '700', color: theme.text, marginBottom: 2 }}>
                            {st.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: theme.textMuted }}>
                            {st.desc}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            hapticService.light();
                            soundService.playComplete(st.id);
                          }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 10,
                            backgroundColor: isSelected ? st.color : (theme.surface || '#252530'),
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Ionicons name="volume-high" size={14} color={isSelected ? '#FFFFFF' : theme.textMuted} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#FFFFFF' : theme.textMuted }}>
                            تجربة
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* الاهتزاز التفاعلي */}
            <View style={[styles.settingControlRow, { flexDirection: rtl ? 'row-reverse' : 'row', marginTop: 10 }]}>
              <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start', marginHorizontal: 8 }}>
                <Text style={[styles.controlLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                  {language === 'ar' ? 'الاهتزاز اللمسي (Haptics)' : 'Haptic Feedback'}
                </Text>
                <Text style={[styles.controlSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  {language === 'ar' ? 'نبضة لمسية مريحة مع كل ضغطة وإنجاز' : 'Tactile haptic pulses on buttons and toggles'}
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
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 18 }]}
            >
              <Text style={styles.confirmBtnText}>{t('done', language)}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurOverlay>
    </Modal>
  );
};
