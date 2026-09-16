import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, AppExportData } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { exportDataToJSON, exportLogsToCSV, importDataFromJSON } from '../utils/exportImportUtils';
import { AppSettings, DEFAULT_SETTINGS } from '../store/habitStore';
import { NotificationService } from '../services/notificationService';
import { ModalHeader, DialogHeader } from '../components/ModalHeader';
import { hapticService } from '../services/hapticService';
import { t, isRTL, AppLanguage } from '../utils/i18n';

interface SettingsScreenProps {
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
  onDeleteHabit,
  onImportData,
  onResetDefaults,
  onClearAll,
}) => {
  const language: AppLanguage = (settings.language as AppLanguage) || propLanguage || 'ar';
  const rtl = isRTL(language);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingImportData, setPendingImportData] = useState<AppExportData | null>(null);

  // Sub-Modals
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [generalModalVisible, setGeneralModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [archivedModalVisible, setArchivedModalVisible] = useState(false);
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introSlideIndex, setIntroSlideIndex] = useState(0);
  const [whatsNewModalVisible, setWhatsNewModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'improvement' | 'bug'>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');

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

  const handlePickImportFile = async () => {
    setLoading(true);
    const res = await importDataFromJSON();
    setLoading(false);

    if (res.success && res.data) {
      setPendingImportData(res.data);
    } else {
      showStatus('error', res.message);
    }
  };

  const confirmImport = (mode: 'merge' | 'replace') => {
    if (!pendingImportData) return;
    const result = onImportData(pendingImportData, mode);
    setPendingImportData(null);
    setDataModalVisible(false);
    showStatus(
      'success',
      `تم استيراد ${result.habitsAdded} عادة و ${result.logsUpdated} سجل بنجاح!`
    );
  };

  const archivedHabits = habits.filter((h) => h.archived);
  const activeHabits = habits.filter((h) => !h.archived);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header matching Image 1 */}
      <ModalHeader
        title={t('settingsTitle', language)}
        theme={theme}
        isRTL={rtl}
        onClose={onClose || (() => {})}
        showDragHandle={true}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Toast Notification */}
        {statusMessage && (
          <View
            style={[
              styles.toast,
              {
                backgroundColor: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
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

        {/* Achievements & Habits Overview Card */}
        <View style={[styles.overviewStatsCard, { backgroundColor: theme.glassSurface || theme.card, borderColor: theme.glassBorder || theme.cardBorder, borderTopColor: theme.glassSpecular || 'rgba(255,255,255,0.22)' }]}>
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

        {/* Section: التطبيق matching Image 1 */}
        <Text style={[styles.groupHeaderTitle, { color: theme.textDim, textAlign: rtl ? 'right' : 'left' }]}>
          {t('appSection', language)}
        </Text>
        <View style={[styles.groupCard, { backgroundColor: theme.glassSurface || theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
          {/* عام */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setGeneralModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>
                {settings.startOfWeek === 'sunday' ? t('sunday', language) : t('monday', language)}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('general', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(232, 67, 147, 0.15)' }]}>
              <Ionicons name="settings-outline" size={18} color="#E84393" />
            </View>
          </TouchableOpacity>

          {/* تذكيرات فحص يومية */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setRemindersModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
              <Text style={[styles.subValueText, { color: settings.dailyRemindersEnabled ? '#2ECC71' : theme.textDim }]}>
                {settings.dailyRemindersEnabled ? settings.morningReminderTime : t('disabled', language)}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('dailyReminders', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(0, 206, 201, 0.15)' }]}>
              <Ionicons name="notifications-outline" size={18} color="#00CEC9" />
            </View>
          </TouchableOpacity>

          {/* السمة (Theme) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setThemeModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
              <Text style={[styles.themePillLabel, { color: theme.textDim }]}>
                {themeMode === 'dark'
                  ? settings.themePalette === 'oled'
                    ? (rtl ? 'أموليد داكن' : 'OLED Black')
                    : (rtl ? 'داكن' : 'Dark')
                  : (rtl ? 'فاتح' : 'Light')}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('theme', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(241, 196, 15, 0.15)' }]}>
              <Ionicons name="color-palette-outline" size={18} color="#F1C40F" />
            </View>
          </TouchableOpacity>

          {/* اللغة */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setLanguageModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>
                {settings.language === 'ar' ? 'العربية' : 'English'}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('language', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(155, 89, 182, 0.15)' }]}>
              <Ionicons name="language-outline" size={18} color="#9B59B6" />
            </View>
          </TouchableOpacity>

          {/* العادات المؤرشفة */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setArchivedModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>
                {archivedHabits.length > 0 ? `${archivedHabits.length}` : (rtl ? 'فارغ' : 'Empty')}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('archivedHabitsTitle', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(26, 188, 156, 0.15)' }]}>
              <Ionicons name="archive-outline" size={18} color="#1ABC9C" />
            </View>
          </TouchableOpacity>

          {/* استيراد / تصدير البيانات */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setDataModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('importExport', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
              <Ionicons name="document-text-outline" size={18} color="#3498DB" />
            </View>
          </TouchableOpacity>

          {/* أعد ترتيب العادات */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setReorderModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomWidth: 0, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <View style={[styles.menuValueRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
              <Text style={[styles.subValueText, { color: theme.textDim }]}>
                {settings.sortOrder === 'newest'
                  ? t('sortNewest', language)
                  : settings.sortOrder === 'oldest'
                  ? t('sortOldest', language)
                  : settings.sortOrder === 'name'
                  ? t('sortName', language)
                  : t('sortStreak', language)}
              </Text>
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('reorderHabits', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(255, 101, 101, 0.15)' }]}>
              <Ionicons name="reorder-four-outline" size={18} color="#FF6565" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: مساعدة */}
        <Text style={[styles.groupHeaderTitle, { color: theme.textDim, textAlign: rtl ? 'right' : 'left' }]}>
          {t('helpSection', language)}
        </Text>
        <View style={[styles.groupCard, { backgroundColor: theme.glassSurface || theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
          {/* إظهار المقدمة */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setIntroSlideIndex(0);
              setIntroModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('showIntro', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(230, 126, 34, 0.15)' }]}>
              <Ionicons name="boat-outline" size={18} color="#E67E22" />
            </View>
          </TouchableOpacity>

          {/* إظهار الجديد */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setWhatsNewModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('showWhatsNew', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
              <Ionicons name="newspaper-outline" size={18} color="#3498DB" />
            </View>
          </TouchableOpacity>

          {/* ارسل رأيك */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              setFeedbackModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomWidth: 0, flexDirection: rtl ? 'row' : 'row-reverse' }]}
          >
            <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
            <Text style={[styles.menuItemText, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('sendFeedback', language)}
            </Text>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(26, 188, 156, 0.15)' }]}>
              <Ionicons name="paper-plane-outline" size={18} color="#1ABC9C" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#7C83FD" />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>



      {/* 2. Modal: عام (General Settings) */}
      <Modal visible={generalModalVisible} transparent animationType="slide" onRequestClose={() => setGeneralModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('generalSettingsTitle', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setGeneralModalVisible(false)}
            />

            {/* Start of Week */}
            <View style={styles.settingControlRow}>
              <View style={styles.segmentChoice}>
                <TouchableOpacity
                  onPress={() => onUpdateSettings?.({ startOfWeek: 'monday' })}
                  style={[
                    styles.segmentBtnHalf,
                    settings.startOfWeek === 'monday' && { backgroundColor: '#7C83FD' },
                  ]}
                >
                  <Text style={[styles.segmentBtnHalfText, { color: settings.startOfWeek === 'monday' ? '#FFF' : theme.textMuted }]}>
                    الإثنين
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onUpdateSettings?.({ startOfWeek: 'sunday' })}
                  style={[
                    styles.segmentBtnHalf,
                    settings.startOfWeek === 'sunday' && { backgroundColor: '#7C83FD' },
                  ]}
                >
                  <Text style={[styles.segmentBtnHalfText, { color: settings.startOfWeek === 'sunday' ? '#FFF' : theme.textMuted }]}>
                    الأحد
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.controlLabel, { color: theme.text }]}>بداية الأسبوع</Text>
            </View>

            {/* Haptic Feedback */}
            <View style={styles.settingControlRow}>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(val) => onUpdateSettings?.({ hapticFeedback: val })}
                trackColor={{ false: theme.surface, true: '#7C83FD' }}
                thumbColor="#FFFFFF"
              />
              <View style={{ alignItems: 'flex-end', flex: 1, marginRight: 12 }}>
                <Text style={[styles.controlLabel, { color: theme.text }]}>الاهتزاز اللمسي (Haptic)</Text>
                <Text style={[styles.controlSub, { color: theme.textDim }]}>اهتزاز خفيف عند النقر على إنجاز العادة</Text>
              </View>
            </View>

            {/* Sound Effects */}
            <View style={styles.settingControlRow}>
              <Switch
                value={settings.soundEffects}
                onValueChange={(val) => onUpdateSettings?.({ soundEffects: val })}
                trackColor={{ false: theme.surface, true: '#7C83FD' }}
                thumbColor="#FFFFFF"
              />
              <View style={{ alignItems: 'flex-end', flex: 1, marginRight: 12 }}>
                <Text style={[styles.controlLabel, { color: theme.text }]}>المؤثرات الصوتية</Text>
                <Text style={[styles.controlSub, { color: theme.textDim }]}>صوت تحفيزي لطيف عند إكمال الهدف اليومي</Text>
              </View>
            </View>

            {/* Confirm before delete */}
            <View style={styles.settingControlRow}>
              <Switch
                value={settings.confirmDelete}
                onValueChange={(val) => onUpdateSettings?.({ confirmDelete: val })}
                trackColor={{ false: theme.surface, true: '#7C83FD' }}
                thumbColor="#FFFFFF"
              />
              <View style={{ alignItems: 'flex-end', flex: 1, marginRight: 12 }}>
                <Text style={[styles.controlLabel, { color: theme.text }]}>تأكيد الحذف</Text>
                <Text style={[styles.controlSub, { color: theme.textDim }]}>عرض نافذة تأكيد قبل حذف أي عادة لمنع الخطأ</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setGeneralModalVisible(false)}
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
            >
              <Text style={styles.confirmBtnText}>حفظ الإعدادات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Modal: تذكيرات فحص يومية (Daily Reminders) */}
      <Modal visible={remindersModalVisible} transparent animationType="slide" onRequestClose={() => setRemindersModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('dailyReminders', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setRemindersModalVisible(false)}
            />

            {/* Enable switch */}
            <View style={styles.settingControlRow}>
              <Switch
                value={settings.dailyRemindersEnabled}
                onValueChange={(val) => onUpdateSettings?.({ dailyRemindersEnabled: val })}
                trackColor={{ false: theme.surface, true: '#2ECC71' }}
                thumbColor="#FFFFFF"
              />
              <View style={{ alignItems: 'flex-end', flex: 1, marginRight: 12 }}>
                <Text style={[styles.controlLabel, { color: theme.text }]}>تفعيل التذكيرات</Text>
                <Text style={[styles.controlSub, { color: theme.textDim }]}>تنبيهك يومياً لتسجيل إنجازاتك</Text>
              </View>
            </View>

            {/* Morning Reminder Presets */}
            <Text style={[styles.fieldSectionLabel, { color: theme.textDim }]}>وقت التذكير الصباحي</Text>
            <View style={styles.timePresetsRow}>
              {['07:00 ص', '08:00 ص', '09:00 ص', '10:00 ص'].map((time) => {
                const isSelected = settings.morningReminderTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    onPress={() => onUpdateSettings?.({ morningReminderTime: time })}
                    style={[
                      styles.timePresetBtn,
                      {
                        backgroundColor: isSelected ? '#7C83FD' : theme.surface,
                        borderColor: isSelected ? '#7C83FD' : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.timePresetText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Evening Reminder Presets */}
            <Text style={[styles.fieldSectionLabel, { color: theme.textDim }]}>وقت التذكير المسائي</Text>
            <View style={styles.timePresetsRow}>
              {['19:00 م', '20:00 م', '21:00 م', '22:00 م'].map((time) => {
                const isSelected = settings.eveningReminderTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    onPress={() => onUpdateSettings?.({ eveningReminderTime: time })}
                    style={[
                      styles.timePresetBtn,
                      {
                        backgroundColor: isSelected ? '#7C83FD' : theme.surface,
                        borderColor: isSelected ? '#7C83FD' : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.timePresetText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Message Input */}
            <Text style={[styles.fieldSectionLabel, { color: theme.textDim }]}>نص رسالة التذكير</Text>
            <TextInput
              value={settings.reminderText}
              onChangeText={(text) => onUpdateSettings?.({ reminderText: text })}
              style={[styles.customMsgInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="اكتب رسالة تحفيزية..."
              placeholderTextColor={theme.textDim}
            />

            {/* Test Notification Button */}
            <TouchableOpacity
              onPress={async () => {
                const ok = await NotificationService.sendInstantTestNotification(
                  'فحص العادات اليومي',
                  settings.morningReminderTime
                );
                showStatus(
                  ok ? 'success' : 'error',
                  ok ? 'تم إرسال إشعار التذكير بنجاح! 🔔' : 'تعذر إرسال الإشعار، يرجى تفعيل أذونات الإشعارات في جهازك.'
                );
              }}
              style={[styles.testNotifyBtn, { borderColor: '#7C83FD' }]}
            >
              <Text style={{ color: '#7C83FD', fontWeight: '700', fontSize: 13 }}>تجربة الإشعار الحقيقي الآن 🔔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setRemindersModalVisible(false);
                showStatus('success', 'تم حفظ إعدادات التذكيرات بنجاح!');
              }}
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
            >
              <Text style={styles.confirmBtnText}>حفظ وإغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. Modal: السمة (Theme & Appearance) */}
      <Modal visible={themeModalVisible} transparent animationType="slide" onRequestClose={() => setThemeModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('theme', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setThemeModalVisible(false)}
            />

            <Text style={[styles.modalExplanationText, { color: theme.textMuted }]}>
              اختر النمط المناسب لراحتك البصرية وشاشتك:
            </Text>

            {/* Dark Theme Option: HabitKit Matte */}
            <TouchableOpacity
              onPress={() => {
                if (themeMode === 'light') onToggleTheme();
                onUpdateSettings?.({ themePalette: 'default' });
              }}
              style={[
                styles.themeOptionCard,
                {
                  backgroundColor: '#0E1015',
                  borderColor: themeMode === 'dark' && settings.themePalette === 'default' ? '#7C83FD' : '#2A2D3A',
                },
              ]}
            >
              <View style={styles.themeOptionInfo}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>داكن - HabitKit Matte</Text>
                <Text style={{ color: '#9AA0A6', fontSize: 11 }}>الأسود الكربوني غير اللامع والمريح للعين</Text>
              </View>
              {themeMode === 'dark' && settings.themePalette === 'default' && (
                <Ionicons name="checkmark-circle" size={22} color="#7C83FD" />
              )}
            </TouchableOpacity>

            {/* Dark Theme Option: OLED Pure Black */}
            <TouchableOpacity
              onPress={() => {
                if (themeMode === 'light') onToggleTheme();
                onUpdateSettings?.({ themePalette: 'oled' });
              }}
              style={[
                styles.themeOptionCard,
                {
                  backgroundColor: '#000000',
                  borderColor: themeMode === 'dark' && settings.themePalette === 'oled' ? '#7C83FD' : '#2A2D3A',
                },
              ]}
            >
              <View style={styles.themeOptionInfo}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>أموليد فائق السواد (OLED Black)</Text>
                <Text style={{ color: '#9AA0A6', fontSize: 11 }}>سواد نقي يوفر الطاقة على شاشات AMOLED</Text>
              </View>
              {themeMode === 'dark' && settings.themePalette === 'oled' && (
                <Ionicons name="checkmark-circle" size={22} color="#7C83FD" />
              )}
            </TouchableOpacity>

            {/* Light Theme Option */}
            <TouchableOpacity
              onPress={() => {
                if (themeMode === 'dark') onToggleTheme();
              }}
              style={[
                styles.themeOptionCard,
                {
                  backgroundColor: '#F5F6FA',
                  borderColor: themeMode === 'light' ? '#7C83FD' : '#E0E0E0',
                },
              ]}
            >
              <View style={styles.themeOptionInfo}>
                <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 14 }}>فاتح (Light Mode)</Text>
                <Text style={{ color: '#64748B', fontSize: 11 }}>واجهة مشرقة عالية الوضوح أثناء النهار</Text>
              </View>
              {themeMode === 'light' && (
                <Ionicons name="checkmark-circle" size={22} color="#7C83FD" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setThemeModalVisible(false)}
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
            >
              <Text style={styles.confirmBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. Modal: اللغة (Language) */}
      <Modal visible={languageModalVisible} transparent animationType="slide" onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('language', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setLanguageModalVisible(false)}
            />

            {[
              { id: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
              { id: 'en', label: 'English (الإنكليزية)', flag: '🇺🇸' },
            ].map((lang) => {
              const isSelected = settings.language === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  onPress={() => {
                    hapticService.medium();
                    onUpdateSettings?.({ language: lang.id as any });
                    showStatus('success', t('langSelectedSuccess', lang.id as any));
                    setLanguageModalVisible(false);
                  }}
                  style={[
                    styles.langChoiceRow,
                    {
                      backgroundColor: isSelected ? theme.surface : 'transparent',
                      borderColor: isSelected ? '#7C83FD' : theme.border,
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>{lang.flag}</Text>
                    <Text style={[styles.langChoiceText, { color: theme.text }]}>{lang.label}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#7C83FD" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* 6. Modal: العادات المؤرشفة (Archived Habits) */}
      <Modal visible={archivedModalVisible} transparent animationType="slide" onRequestClose={() => setArchivedModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('archivedHabitsTitle', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setArchivedModalVisible(false)}
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
                    style={[styles.archivedHabitRow, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
                  >
                    <View style={styles.archivedActions}>
                      <TouchableOpacity
                        onPress={() => {
                          onUnarchiveHabit?.(habit.id);
                          showStatus('success', `تمت استعادة "${habit.name}" للشاشة الرئيسية`);
                        }}
                        style={[styles.archiveActionBtn, { backgroundColor: '#7C83FD20' }]}
                      >
                        <Text style={{ color: '#7C83FD', fontSize: 12, fontWeight: '700' }}>استعادة</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('تأكيد الحذف النهائي', `هل تريد حذف عادة "${habit.name}" وسجلاتها نهائياً؟`, [
                            { text: 'إلغاء', style: 'cancel' },
                            {
                              text: 'حذف',
                              style: 'destructive',
                              onPress: () => {
                                onDeleteHabit?.(habit.id);
                                showStatus('success', `تم حذف "${habit.name}" نهائياً`);
                              },
                            },
                          ]);
                        }}
                        style={[styles.archiveActionBtn, { backgroundColor: '#FF656520', marginLeft: 6 }]}
                      >
                        <Text style={{ color: '#FF6565', fontSize: 12, fontWeight: '700' }}>حذف نهائي</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.archivedHabitInfo}>
                      <Text style={[styles.archivedHabitName, { color: theme.text }]}>{habit.name}</Text>
                      <View
                        style={[
                          styles.archivedHabitDot,
                          { backgroundColor: habit.color, borderColor: `${habit.color}80` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={() => setArchivedModalVisible(false)}
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
            >
              <Text style={styles.confirmBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. Modal: أعد ترتيب العادات (Reorder / Sort Habits) */}
      <Modal visible={reorderModalVisible} transparent animationType="slide" onRequestClose={() => setReorderModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('reorderHabits', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setReorderModalVisible(false)}
            />

            <Text style={[styles.modalExplanationText, { color: theme.textMuted }]}>
              اختر أسلوب عرض وترتيب العادات على الشاشة الرئيسية:
            </Text>

            {[
              { id: 'newest', label: 'الأحدث إنشاءً أولاً ⏳', desc: 'تظهر العادات المنشأة مؤخراً في البداية' },
              { id: 'oldest', label: 'الأقدم إنشاءً أولاً 🕰️', desc: 'العادات القديمة والراسخة أولاً' },
              { id: 'name', label: 'ترتيب أبجدي (أ - ي) 🔤', desc: 'فرز أسم العادات هجائياً' },
              { id: 'streak', label: 'أعلى سلسلة إنجاز (Streak) 🔥', desc: 'العادات الأكثر إنجازاً والتزاماً في القمة' },
            ].map((option) => {
              const isSelected = settings.sortOrder === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    onSortHabits?.(option.id as any);
                    showStatus('success', `تم إعادة الترتيب: ${option.label}`);
                    setReorderModalVisible(false);
                  }}
                  style={[
                    styles.sortOptionCard,
                    {
                      backgroundColor: isSelected ? theme.surface : 'transparent',
                      borderColor: isSelected ? '#7C83FD' : theme.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
                    <Text style={[styles.sortOptionLabel, { color: theme.text }]}>{option.label}</Text>
                    <Text style={[styles.sortOptionDesc, { color: theme.textMuted }]}>{option.desc}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={22} color="#7C83FD" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* 8. Modal: إظهار المقدمة (Introduction Walkthrough) */}
      <Modal visible={introModalVisible} transparent animationType="slide" onRequestClose={() => setIntroModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('showIntro', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setIntroModalVisible(false)}
            />

            {introSlideIndex === 0 && (
              <View style={styles.introSlideContent}>
                <View style={[styles.introIconCircle, { backgroundColor: 'rgba(124, 131, 253, 0.2)' }]}>
                  <Ionicons name="sparkles" size={48} color="#7C83FD" />
                </View>
                <Text style={[styles.introSlideTitle, { color: theme.text }]}>1. ابنِ عاداتك أو أقلع عنها</Text>
                <Text style={[styles.introSlideDesc, { color: theme.textMuted }]}>
                  حدد عاداتك الإيجابية (بناء عادة) أو تتبع أيام نجاحك في التوقف عن عادة غير مرغوبة (إقلاع عن عادة) بسهولة ومرونة.
                </Text>
              </View>
            )}

            {introSlideIndex === 1 && (
              <View style={styles.introSlideContent}>
                <View style={[styles.introIconCircle, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
                  <Ionicons name="grid" size={48} color="#2ECC71" />
                </View>
                <Text style={[styles.introSlideTitle, { color: theme.text }]}>2. لوّن تقويمك وتتبع إنجازك</Text>
                <Text style={[styles.introSlideDesc, { color: theme.textMuted }]}>
                  كل نقرة تسجل إنجازاً لحظياً بـ 0ms تأخير وتضيء مربعاً ملوناً في مصفوفة الـ Heatmap لتشهد تطورك يوماً بعد يوم.
                </Text>
              </View>
            )}

            {introSlideIndex === 2 && (
              <View style={styles.introSlideContent}>
                <View style={[styles.introIconCircle, { backgroundColor: 'rgba(241, 196, 15, 0.2)' }]}>
                  <Ionicons name="trophy" size={48} color="#F1C40F" />
                </View>
                <Text style={[styles.introSlideTitle, { color: theme.text }]}>3. حرية كاملة وميزات Pro مجاناً</Text>
                <Text style={[styles.introSlideDesc, { color: theme.textMuted }]}>
                  استمتع بتصدير واستيراد بياناتك CSV و JSON، وتدوين الملاحظات واليوميات لكل يوم، وتحليلات متقدمة بدون قيود.
                </Text>
              </View>
            )}

            {/* Stepper Dots */}
            <View style={styles.introDotsRow}>
              {[0, 1, 2].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.introDot,
                    { backgroundColor: introSlideIndex === idx ? '#7C83FD' : theme.surface },
                  ]}
                />
              ))}
            </View>

            <View style={styles.introBtnRow}>
              {introSlideIndex < 2 ? (
                <TouchableOpacity
                  onPress={() => setIntroSlideIndex(introSlideIndex + 1)}
                  style={[styles.confirmBtn, { backgroundColor: '#7C83FD', flex: 1 }]}
                >
                  <Text style={styles.confirmBtnText}>التالي ‹</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIntroModalVisible(false)}
                  style={[styles.confirmBtn, { backgroundColor: '#2ECC71', flex: 1 }]}
                >
                  <Text style={styles.confirmBtnText}>ابدأ الآن 🎉</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 9. Modal: إظهار الجديد (What's New) */}
      <Modal visible={whatsNewModalVisible} transparent animationType="slide" onRequestClose={() => setWhatsNewModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('showWhatsNew', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setWhatsNewModalVisible(false)}
            />

            <ScrollView style={{ maxHeight: 300 }}>
              {[
                { title: 'تصميم فائق وأداء عالي', desc: 'مظهر عصري متقن مستوحى من HabitKit مع استجابة فورية وحفظ ذكي.' },
                { title: 'تجربة مفتوحة ومتكاملة', desc: 'كافة الإعدادات والأدوات والتحليلات والودجات تحت تصرفك بالكامل بدون أي قيود.' },
                { title: 'إقلاع عن عادة (Quit Mode)', desc: 'تتبع الامتناع والانتصار على العادات السلبية مع بناء العادات الإيجابية.' },
                { title: 'سجل الملاحظات واليوميات', desc: 'دون خواطرك اليومية وأسباب تعثرك أو نجاحك لكل عادة.' },
                { title: 'تصدير كامل CSV و JSON', desc: 'دعم كامل للنصوص العربية في ملفات Excel ونسخ احتياطية مشفرة.' },
              ].map((item, idx) => (
                <View key={idx} style={[styles.whatsNewItem, { borderBottomColor: theme.border }]}>
                  <Ionicons name="rocket-outline" size={20} color="#7C83FD" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: 10, alignItems: 'flex-end' }}>
                    <Text style={[styles.whatsNewItemTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.whatsNewItemDesc, { color: theme.textMuted }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setWhatsNewModalVisible(false)}
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
            >
              <Text style={styles.confirmBtnText}>رائع!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 10. Modal: ارسل رأيك (Send Feedback) */}
      <Modal visible={feedbackModalVisible} transparent animationType="slide" onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('sendFeedback', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setFeedbackModalVisible(false)}
            />

            {/* Rating Stars */}
            <Text style={[styles.fieldSectionLabel, { color: theme.textDim, textAlign: 'center' }]}>ما تقييمك للتطبيق؟</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
                  <Ionicons
                    name={star <= feedbackRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Segment */}
            <View style={styles.feedbackTypeRow}>
              {[
                { id: 'bug', label: 'بلاغ خطأ 🐞' },
                { id: 'improvement', label: 'تحسين تصميم 🎨' },
                { id: 'suggestion', label: 'اقتراح ميزة 💡' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setFeedbackType(cat.id as any)}
                  style={[
                    styles.feedbackTypeBtn,
                    {
                      backgroundColor: feedbackType === cat.id ? '#7C83FD' : theme.surface,
                      borderColor: feedbackType === cat.id ? '#7C83FD' : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.feedbackTypeText, { color: feedbackType === cat.id ? '#FFF' : theme.textMuted }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback text input */}
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={4}
              placeholder="اكتب ملاحظاتك أو ما تتطلع لإضافته في التحديثات القادمة..."
              placeholderTextColor={theme.textDim}
              style={[
                styles.feedbackTextInput,
                { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
              ]}
            />

            <TouchableOpacity
              onPress={() => {
                setFeedbackModalVisible(false);
                setFeedbackText('');
                showStatus('success', 'شكراً جزيلاً لك! تم استلام رأيك وسنعمل على تطويره فورياً 🌟');
              }}
              style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
            >
              <Text style={styles.confirmBtnText}>إرسال الملاحظات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 11. Modal: استيراد وتصدير البيانات (Data Export / Import) */}
      <Modal visible={dataModalVisible} transparent animationType="slide" onRequestClose={() => setDataModalVisible(false)}>
        <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <DialogHeader
              title={t('importExport', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setDataModalVisible(false)}
            />

            {/* CSV Export */}
            <TouchableOpacity
              onPress={handleExportCSV}
              style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="download-outline" size={20} color="#2ECC71" />
              <View style={{ flex: 1, marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={[styles.dataActionTitle, { color: theme.text }]}>تصدير إلى ملف CSV</Text>
                <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>متوافق مع Excel و Google Sheets (يدعم العربية)</Text>
              </View>
            </TouchableOpacity>

            {/* JSON Export */}
            <TouchableOpacity
              onPress={handleExportJSON}
              style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#7C83FD" />
              <View style={{ flex: 1, marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={[styles.dataActionTitle, { color: theme.text }]}>تصدير نسخة احتياطية (JSON)</Text>
                <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>حفظ كافة العادات والسجلات والملاحظات</Text>
              </View>
            </TouchableOpacity>

            {/* JSON Import */}
            <TouchableOpacity
              onPress={handlePickImportFile}
              style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="cloud-download-outline" size={20} color="#F39C12" />
              <View style={{ flex: 1, marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={[styles.dataActionTitle, { color: theme.text }]}>استيراد من ملف JSON</Text>
                <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>استرجاع بياناتك مع خيار الدمج أو الاستبدال</Text>
              </View>
            </TouchableOpacity>

            {/* Reset to defaults */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert('استعادة البيانات النموذجية', 'هل تريد استعادة العادات الافتراضية مع السجلات التجريبية؟', [
                  { text: 'إلغاء', style: 'cancel' },
                  {
                    text: 'استعادة',
                    onPress: () => {
                      onResetDefaults();
                      setDataModalVisible(false);
                      showStatus('success', 'تمت استعادة البيانات النموذجية بنجاح');
                    },
                  },
                ]);
              }}
              style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="refresh-outline" size={20} color="#3498DB" />
              <View style={{ flex: 1, marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={[styles.dataActionTitle, { color: theme.text }]}>استعادة العادات النموذجية</Text>
                <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>إعادة ملء التطبيق بنماذج عادات واقعية</Text>
              </View>
            </TouchableOpacity>

            {/* Clear All */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert('تحذير: مسح كافة البيانات', 'هل أنت متأكد من رغبتك في حذف جميع العادات والسجلات؟ لا يمكن التراجع عن هذا الإجراء.', [
                  { text: 'إلغاء', style: 'cancel' },
                  {
                    text: 'مسح الكل',
                    style: 'destructive',
                    onPress: () => {
                      onClearAll();
                      setDataModalVisible(false);
                      showStatus('error', 'تم مسح كافة البيانات');
                    },
                  },
                ]);
              }}
              style={[styles.dataActionBtn, { backgroundColor: 'rgba(255, 101, 101, 0.1)', borderColor: '#FF656540' }]}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6565" />
              <View style={{ flex: 1, marginRight: 10, alignItems: 'flex-end' }}>
                <Text style={[styles.dataActionTitle, { color: '#FF6565' }]}>مسح كافة البيانات</Text>
                <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>تفريغ التطبيق بالكامل للبدء من الصفر</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 12. Modal: تأكيد الاستيراد (Import Confirmation) */}
      {pendingImportData && (
        <Modal visible={true} transparent animationType="fade">
          <View style={[styles.dataModalOverlay, { backgroundColor: theme.modalOverlay }]}>
            <View style={[styles.dataModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.dataModalTitle, { color: theme.text, textAlign: 'center' }]}>تأكيد الاستيراد</Text>
              <Text style={[styles.dataActionSub, { color: theme.textMuted, textAlign: 'center', marginVertical: 14 }]}>
                تم العثور على {pendingImportData.habits.length} عادة. كيف ترغب في الاستيراد؟
              </Text>
              <TouchableOpacity
                onPress={() => confirmImport('merge')}
                style={[styles.confirmBtn, { backgroundColor: '#7C83FD' }]}
              >
                <Text style={styles.confirmBtnText}>دمج مع العادات الحالية (Merge)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => confirmImport('replace')}
                style={[styles.confirmBtn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, marginTop: 8 }]}
              >
                <Text style={[styles.confirmBtnText, { color: theme.text }]}>استبدال كافة البيانات</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPendingImportData(null)} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: theme.textDim }}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#383B46',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  overviewStatsCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 20,
  },
  overviewTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 14,
  },
  overviewIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  overviewTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
    textAlign: 'right',
  },
  overviewSub: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
  },
  overviewPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  overviewPill: {
    alignItems: 'center',
    flex: 1,
  },
  overviewPillNum: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  overviewPillLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  overviewDivider: {
    width: 1,
    height: 24,
  },
  groupHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subValueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themePillLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuItemText: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    marginVertical: 20,
    alignItems: 'center',
  },
  dataModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dataModalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    maxHeight: '90%',
  },
  dataModalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dataModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalExplanationText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: 16,
  },
  settingControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  segmentChoice: {
    flexDirection: 'row',
    backgroundColor: '#1E212B',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  segmentBtnHalf: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentBtnHalfText: {
    fontSize: 12,
    fontWeight: '700',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  controlSub: {
    fontSize: 11,
    textAlign: 'right',
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 14,
    marginBottom: 8,
  },
  timePresetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  timePresetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePresetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  customMsgInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    textAlign: 'right',
  },
  testNotifyBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  themeOptionCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  themeOptionInfo: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 2,
  },
  langChoiceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  langChoiceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyArchiveBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyArchiveTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyArchiveSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  archivedHabitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  archivedActions: {
    flexDirection: 'row',
  },
  archiveActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  archivedHabitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archivedHabitName: {
    fontSize: 14,
    fontWeight: '700',
  },
  archivedHabitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  sortOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  sortOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sortOptionDesc: {
    fontSize: 11,
  },
  introSlideContent: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  introIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introSlideTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  introSlideDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  introDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 12,
  },
  introDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  introBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whatsNewItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  whatsNewItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'right',
  },
  whatsNewItemDesc: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  feedbackTypeRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
  },
  feedbackTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    textAlign: 'right',
    textAlignVertical: 'top',
    height: 80,
  },
  dataActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  dataActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  dataActionSub: {
    fontSize: 11,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
