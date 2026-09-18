import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, AppExportData } from '../../types/habit';
import { ThemeColors } from '../../constants/theme';
import { AppSettings, DEFAULT_SETTINGS } from '../../store/habitStore';
import { exportDataToJSON, exportLogsToCSV, importDataFromJSON } from '../../utils/exportImportUtils';
import { t, isRTL, AppLanguage } from '../../utils/i18n';
import { hapticService } from '../../services/hapticService';
import { settingsStyles as styles } from './styles/settingsStyles';
import { ModalHeader } from '../../components/ModalHeader';
import { AmbientBackground } from '../../components/common/AmbientBackground';
import { DataManagementModal } from './components/DataManagementModal';
import { GeneralSettingsModal } from './components/GeneralSettingsModal';
import { ThemeLanguageModal } from './components/ThemeLanguageModal';
import { ArchivedHabitsModal } from './components/ArchivedHabitsModal';
import { FeedbackModal } from './components/FeedbackModal';
import { IntroGuideModal } from './components/IntroGuideModal';

export interface SettingsScreenProps {
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  themeMode: 'dark' | 'light';
  settings?: AppSettings;
  language?: AppLanguage;
  onClose?: () => void;
  onToggleTheme: () => void;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  onArchiveHabit?: (habitId: string) => void;
  onUnarchiveHabit?: (habitId: string) => void;
  onSortHabits?: (order: AppSettings['sortOrder']) => void;
  onOpenReorder?: () => void;
  onDeleteHabit?: (habitId: string) => void;
  onImportData: (data: AppExportData, mode: 'merge' | 'replace') => { habitsAdded: number; logsUpdated: number };
  onResetDefaults: () => void;
  onClearAll: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  habits,
  logs,
  theme,
  themeMode,
  settings = DEFAULT_SETTINGS,
  language: propLanguage,
  onClose,
  onToggleTheme,
  onUpdateSettings,
  onArchiveHabit,
  onUnarchiveHabit,
  onSortHabits,
  onOpenReorder,
  onDeleteHabit,
  onImportData,
  onResetDefaults,
  onClearAll,
}) => {
  const language: AppLanguage = (settings.language as AppLanguage) || propLanguage || 'ar';
  const rtl = isRTL(language);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sub-Modals
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [generalModalVisible, setGeneralModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [archivedModalVisible, setArchivedModalVisible] = useState(false);
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleExportCSV = async () => {
    setLoading(true);
    const res = await exportLogsToCSV(habits, logs);
    setLoading(false);
    showStatus(res.success ? 'success' : 'error', res.message);
  };

  const handleExportJSON = async () => {
    setLoading(true);
    const res = await exportDataToJSON(habits, logs);
    setLoading(false);
    showStatus(res.success ? 'success' : 'error', res.message);
  };

  const handleImportJSON = async () => {
    setLoading(true);
    const res = await importDataFromJSON();
    setLoading(false);
    if (res.success && res.data) {
      const stats = onImportData(res.data, 'merge');
      showStatus('success', `تم استيراد ${stats.habitsAdded} عادة و ${stats.logsUpdated} سجل بنجاح!`);
    } else {
      showStatus('error', res.message);
    }
  };

  const activeHabits = habits.filter((h) => !h.archived);
  const archivedHabits = habits.filter((h) => h.archived);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AmbientBackground theme={theme} isDark={themeMode === 'dark'} />

      {/* Top Header with Dead-Centered Title and Left Close */}
      <ModalHeader
        title={t('settings', language)}
        theme={theme}
        onClose={onClose || (() => {})}
        showDragHandle={true}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Toast Message */}
        {statusMessage && (
          <View
            style={[
              styles.toast,
              {
                backgroundColor: statusMessage.type === 'success' ? '#10B981' : '#EF4444',
                borderColor: statusMessage.type === 'success' ? '#10B981' : '#EF4444',
                flexDirection: rtl ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Ionicons
              name={statusMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={[styles.toastText, { textAlign: rtl ? 'right' : 'left' }]}>{statusMessage.text}</Text>
          </View>
        )}

        {/* Overview Stats Card */}
        <View style={[styles.overviewStatsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.overviewTopRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.overviewIconCircle, { backgroundColor: 'rgba(124, 131, 253, 0.15)', marginLeft: rtl ? 12 : 0, marginRight: rtl ? 0 : 12 }]}>
              <Ionicons name="sparkles" size={20} color="#7C83FD" />
            </View>
            <View style={[styles.overviewTextCol, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.overviewTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('overviewTitle', language)}
              </Text>
              <Text style={[styles.overviewSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                {t('overviewSub', language)}
              </Text>
            </View>
          </View>

          <View style={[styles.overviewPillsRow, { borderTopColor: theme.border }]}>
            <View style={styles.overviewPill}>
              <Text style={[styles.overviewPillNum, { color: '#7C83FD' }]}>{activeHabits.length}</Text>
              <Text style={[styles.overviewPillLabel, { color: theme.textDim }]}>{t('activeHabitsCount', language)}</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
            <View style={styles.overviewPill}>
              <Text style={[styles.overviewPillNum, { color: '#10B981' }]}>
                {Object.values(logs).reduce((acc, l) => acc + Object.keys(l).length, 0)}
              </Text>
              <Text style={[styles.overviewPillLabel, { color: theme.textDim }]}>{t('totalLogsCount', language)}</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
            <View style={styles.overviewPill}>
              <Text style={[styles.overviewPillNum, { color: '#F59E0B' }]}>{archivedHabits.length}</Text>
              <Text style={[styles.overviewPillLabel, { color: theme.textDim }]}>{t('archivedHabitsCount', language)}</Text>
            </View>
          </View>
        </View>

        {/* Section: التطبيق */}
        <Text style={[styles.groupHeaderTitle, { color: theme.textDim, textAlign: rtl ? 'right' : 'left' }]}>
          {t('appSection', language)}
        </Text>
        <View style={[styles.groupCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* عام */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setGeneralModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(232, 67, 147, 0.15)' }]}>
              <Ionicons name="settings-outline" size={18} color="#E84393" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('general', language)}
            </Text>
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>
                {settings.startOfWeek === 'sunday' ? t('sunday', language) : t('monday', language)}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
          </TouchableOpacity>

          {/* المظهر واللغة */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setThemeModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
              <Ionicons name="color-palette-outline" size={18} color="#6C5CE7" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              المظهر واللغة
            </Text>
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>
                {settings.themePalette === 'oled' ? 'OLED' : themeMode === 'dark' ? 'داكن' : 'فاتح'} • {language === 'ar' ? 'العربية' : 'EN'}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
          </TouchableOpacity>

          {/* ترتيب العادات */}
          {onOpenReorder && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onOpenReorder();
              }}
              style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(124, 131, 253, 0.15)' }]}>
                <Ionicons name="reorder-three-outline" size={18} color="#7C83FD" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('reorderHabits', language)}
              </Text>
              <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.subValueText, { color: theme.textDim }]}>سحب وإفلات</Text>
                <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
              </View>
            </TouchableOpacity>
          )}

          {/* العادات المؤرشفة */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setArchivedModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="archive-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('archivedHabits', language)}
            </Text>
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>{archivedHabits.length}</Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
          </TouchableOpacity>

          {/* النسخ الاحتياطي والبيانات */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setDataModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: 'transparent', flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
              <Ionicons name="cloud-upload-outline" size={18} color="#3498DB" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('dataManagement', language)}
            </Text>
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: الدعم والمعلومات */}
        <Text style={[styles.groupHeaderTitle, { color: theme.textDim, textAlign: rtl ? 'right' : 'left' }]}>
          الدعم والمعلومات
        </Text>
        <View style={[styles.groupCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* إظهار المقدمة والدليل */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setIntroModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(253, 203, 110, 0.15)' }]}>
              <Ionicons name="book-outline" size={18} color="#FDCB6E" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('showIntro', language)}
            </Text>
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
          </TouchableOpacity>

          {/* التقييم والمقترحات */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setFeedbackModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: 'transparent', flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
              <Ionicons name="heart-outline" size={18} color="#FF6B6B" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('feedback', language)}
            </Text>
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sub-Modals */}
      <DataManagementModal
        visible={dataModalVisible}
        onClose={() => setDataModalVisible(false)}
        habits={habits}
        logs={logs}
        theme={theme}
        language={language}
        rtl={rtl}
        loading={loading}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportData={handleImportJSON}
        onResetDefaults={onResetDefaults}
        onClearAll={onClearAll}
      />

      <GeneralSettingsModal
        visible={generalModalVisible}
        onClose={() => setGeneralModalVisible(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        theme={theme}
        language={language}
        rtl={rtl}
      />

      <ThemeLanguageModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        theme={theme}
        themeMode={themeMode}
        settings={settings}
        language={language}
        rtl={rtl}
        onToggleTheme={onToggleTheme}
        onUpdateSettings={onUpdateSettings}
      />

      <ArchivedHabitsModal
        visible={archivedModalVisible}
        onClose={() => setArchivedModalVisible(false)}
        archivedHabits={archivedHabits}
        onUnarchiveHabit={onUnarchiveHabit}
        onDeleteHabit={onDeleteHabit}
        onShowStatus={showStatus}
        theme={theme}
        language={language}
        rtl={rtl}
      />

      <IntroGuideModal
        visible={introModalVisible}
        onClose={() => setIntroModalVisible(false)}
        theme={theme}
        language={language}
        rtl={rtl}
      />

      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        theme={theme}
        language={language}
        rtl={rtl}
        onShowStatus={showStatus}
      />
    </View>
  );
};
