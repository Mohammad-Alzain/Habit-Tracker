import React from 'react';
import { View, Text, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { AppSettings } from '../../../store/habitStore';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { settingsStyles as styles } from '../styles/settingsStyles';
import { BlurOverlay } from '../../../components/common/BlurOverlay';

interface ThemeLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  themeMode: 'dark' | 'light';
  settings: AppSettings;
  language: AppLanguage;
  rtl: boolean;
  onToggleTheme: () => void;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
}

export const ThemeLanguageModal: React.FC<ThemeLanguageModalProps> = ({
  visible,
  onClose,
  theme,
  themeMode,
  settings,
  language,
  rtl,
  onToggleTheme,
  onUpdateSettings,
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
            title="المظهر واللغة"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Theme Mode Choice */}
          <Text style={[styles.fieldSectionLabel, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
            {language === 'ar' ? 'المظهر العام' : 'Appearance'}
          </Text>

          {/* Classic Dark */}
          <TouchableOpacity
            onPress={() => {
              hapticService.selection();
              if (themeMode === 'light') onToggleTheme();
              onUpdateSettings?.({ themePalette: 'default' });
            }}
            style={[
              styles.themeOptionCard,
              {
                flexDirection: rtl ? 'row-reverse' : 'row',
                backgroundColor: themeMode === 'dark' && settings.themePalette !== 'oled' ? theme.surface : 'transparent',
                borderColor: themeMode === 'dark' && settings.themePalette !== 'oled' ? '#7C83FD' : theme.border,
              },
            ]}
          >
            <View style={[styles.themeOptionInfo, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>
                {language === 'ar' ? 'الوضع الليلي الكلاسيكي' : 'Classic Dark'}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: rtl ? 'right' : 'left' }}>
                {language === 'ar' ? 'رمادي داكن وزجاجي مريح للعين' : 'Dark grey and frosted glass comfortable for eyes'}
              </Text>
            </View>
            <Ionicons
              name={themeMode === 'dark' && settings.themePalette !== 'oled' ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={themeMode === 'dark' && settings.themePalette !== 'oled' ? '#7C83FD' : theme.textDim}
            />
          </TouchableOpacity>

          {/* OLED Black */}
          <TouchableOpacity
            onPress={() => {
              hapticService.selection();
              if (themeMode === 'light') onToggleTheme();
              onUpdateSettings?.({ themePalette: 'oled' });
            }}
            style={[
              styles.themeOptionCard,
              {
                flexDirection: rtl ? 'row-reverse' : 'row',
                backgroundColor: settings.themePalette === 'oled' ? theme.surface : 'transparent',
                borderColor: settings.themePalette === 'oled' ? '#7C83FD' : theme.border,
              },
            ]}
          >
            <View style={[styles.themeOptionInfo, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>
                {language === 'ar' ? 'وضع سواد شاشات OLED' : 'OLED Pure Black'}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: rtl ? 'right' : 'left' }}>
                {language === 'ar' ? 'أسود نقي لتوفير فائق لطاقة البطارية' : 'True pitch black for maximum battery savings'}
              </Text>
            </View>
            <Ionicons
              name={settings.themePalette === 'oled' ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={settings.themePalette === 'oled' ? '#7C83FD' : theme.textDim}
            />
          </TouchableOpacity>

          {/* Light Mode */}
          <TouchableOpacity
            onPress={() => {
              hapticService.selection();
              if (themeMode === 'dark') onToggleTheme();
            }}
            style={[
              styles.themeOptionCard,
              {
                flexDirection: rtl ? 'row-reverse' : 'row',
                backgroundColor: themeMode === 'light' ? theme.surface : 'transparent',
                borderColor: themeMode === 'light' ? '#7C83FD' : theme.border,
              },
            ]}
          >
            <View style={[styles.themeOptionInfo, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>
                {language === 'ar' ? 'الوضع النهاري المشرق' : 'Bright Light'}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: rtl ? 'right' : 'left' }}>
                {language === 'ar' ? 'أبيض ناصع وتباين عالٍ في الإضاءة القوية' : 'Crisp white with high contrast in bright light'}
              </Text>
            </View>
            <Ionicons
              name={themeMode === 'light' ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={themeMode === 'light' ? '#7C83FD' : theme.textDim}
            />
          </TouchableOpacity>

          {/* Section: Language Selection */}
          <Text style={[styles.fieldSectionLabel, { color: theme.textMuted, marginTop: 14 }]}>
            {language === 'ar' ? 'لغة التطبيق' : 'App Language'}
          </Text>

          <View style={[styles.languagesRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              onPress={() => {
                hapticService.selection();
                onUpdateSettings?.({ language: 'ar' });
              }}
              style={[
                styles.langChoiceRow,
                {
                  flex: 1,
                  flexDirection: rtl ? 'row-reverse' : 'row',
                  backgroundColor: language === 'ar' ? theme.surface : 'transparent',
                  borderColor: language === 'ar' ? '#7C83FD' : theme.border,
                },
              ]}
            >
              <Text style={[styles.langChoiceText, { color: theme.text }]}>العربية</Text>
              <Ionicons
                name={language === 'ar' ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={language === 'ar' ? '#7C83FD' : theme.textDim}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                hapticService.selection();
                onUpdateSettings?.({ language: 'en' });
              }}
              style={[
                styles.langChoiceRow,
                {
                  flex: 1,
                  flexDirection: rtl ? 'row-reverse' : 'row',
                  backgroundColor: language === 'en' ? theme.surface : 'transparent',
                  borderColor: language === 'en' ? '#7C83FD' : theme.border,
                },
              ]}
            >
              <Text style={[styles.langChoiceText, { color: theme.text }]}>English</Text>
              <Ionicons
                name={language === 'en' ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={language === 'en' ? '#7C83FD' : theme.textDim}
              />
            </TouchableOpacity>
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
