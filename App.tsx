import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useHabitStore, habitStore } from './src/store/habitStore';
import { DARK_THEME, LIGHT_THEME } from './src/constants/theme';
import { Habit, HabitType, HabitCategory, TimeOfDay, HabitGoal, HabitMode, TrackingType } from './src/types/habit';
import { FloatingDock } from './src/components/FloatingDock';
import { HabitsScreen } from './src/screens/HabitsScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HabitModal } from './src/components/HabitModal';
import { HabitDetailModal } from './src/components/HabitDetailModal';
import { HabitTemplatesModal, HabitTemplate } from './src/components/HabitTemplatesModal';
import { WidgetsHubModal } from './src/components/WidgetsHubModal';
import { MilestonesModal } from './src/components/MilestonesModal';
import { HabitStudiesModal } from './src/components/HabitStudiesModal';
import { HabitStackModal } from './src/components/HabitStackModal';
import { ShareHabitCardModal } from './src/components/ShareHabitCardModal';
import { ModalHeader } from './src/components/ModalHeader';
import { t, isRTL, AppLanguage } from './src/utils/i18n';

export default function App() {
  const { habits, logs, stacks, themeMode, viewMode, settings, isLoaded } = useHabitStore();
  const language: AppLanguage = (settings?.language as AppLanguage) || 'ar';
  const rtl = isRTL(language);

  const baseTheme = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const theme =
    settings?.themePalette === 'oled' && themeMode === 'dark'
      ? { ...baseTheme, background: '#000000', surface: '#0D0E12' }
      : baseTheme;

  // Modals
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [templatesModalVisible, setTemplatesModalVisible] = useState(false);
  const [widgetsModalVisible, setWidgetsModalVisible] = useState(false);
  const [milestonesModalVisible, setMilestonesModalVisible] = useState(false);
  const [studiesModalVisible, setStudiesModalVisible] = useState(false);
  const [stackModalVisible, setStackModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [habitToShare, setHabitToShare] = useState<Habit | null>(null);

  useEffect(() => {
    habitStore.init();

    // Hide system navigation bar on Android for immersive edge-to-edge
    if (Platform.OS === 'android') {
      try {
        if (typeof (NavigationBar as any).setVisibilityAsync === 'function') {
          (NavigationBar as any).setVisibilityAsync('hidden').catch(() => {});
        }
        if (typeof (NavigationBar as any).setHidden === 'function') {
          (NavigationBar as any).setHidden(true);
        }
      } catch (e) {
        // Safe fallback
      }
    }
  }, []);

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: DARK_THEME.background }]}>
        <ActivityIndicator size="large" color="#7C83FD" />
      </View>
    );
  }

  const handleOpenAddModal = () => {
    setHabitToEdit(null);
    setHabitModalVisible(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    setHabitToEdit(habit);
    setHabitModalVisible(true);
  };

  const handleSaveHabit = (habitData: {
    name: string;
    description: string;
    icon: string;
    color: string;
    mode: HabitMode;
    type: HabitType;
    trackingType: TrackingType;
    targetValue: number;
    unit?: string;
    category: HabitCategory;
    timeOfDay: TimeOfDay;
    goalFrequency?: string;
    goal?: HabitGoal;
  }) => {
    if (habitToEdit) {
      habitStore.updateHabit({
        ...habitToEdit,
        ...habitData,
      });
      if (selectedHabitForDetail?.id === habitToEdit.id) {
        setSelectedHabitForDetail({
          ...habitToEdit,
          ...habitData,
        });
      }
    } else {
      habitStore.addHabit({
        ...habitData,
        frequency: 'daily',
      });
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    habitStore.deleteHabit(habitId);
    if (selectedHabitForDetail?.id === habitId) {
      setSelectedHabitForDetail(null);
    }
  };

  const handleToggleToday = (habitId: string) => {
    habitStore.toggleHabitDay(habitId);
  };

  const handleTogglePastDate = (habitId: string, dateStr: string) => {
    habitStore.toggleHabitDay(habitId, dateStr);
  };

  const handleAdjustNumeric = (habitId: string, delta: number) => {
    habitStore.adjustNumericHabit(habitId, undefined, delta);
  };

  const handleSaveNote = (habitId: string, dateStr: string, noteText: string) => {
    habitStore.setHabitNote(habitId, dateStr, noteText);
    if (selectedHabitForDetail?.id === habitId) {
      setSelectedHabitForDetail({
        ...selectedHabitForDetail,
        notes: {
          ...(selectedHabitForDetail.notes || {}),
          [dateStr]: noteText,
        },
      });
    }
  };

  const handleAddFromTemplate = (template: HabitTemplate) => {
    habitStore.addHabit({
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      frequency: 'daily',
      mode: template.mode,
      type: template.type,
      trackingType: template.trackingType,
      targetValue: template.targetValue,
      unit: template.unit,
      category: template.category,
      timeOfDay: 'anytime',
      goalFrequency: template.goalFrequency,
      reminderEnabled: true,
      reminderTime: template.recommendedTime,
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />

        {/* Habits Main Screen matching Image 5 */}
        <HabitsScreen
          habits={habits}
          logs={logs}
          theme={theme}
          viewMode={viewMode}
          language={language}
          onToggleToday={handleToggleToday}
          onTogglePastDate={handleTogglePastDate}
          onAdjustNumeric={handleAdjustNumeric}
          onPressHabit={(habit) => setSelectedHabitForDetail(habit)}
          onDeleteHabit={handleDeleteHabit}
          onAddNew={handleOpenAddModal}
          onOpenSettings={() => setSettingsModalVisible(true)}
          onOpenAnalytics={() => setAnalyticsModalVisible(true)}
          onOpenWidgets={() => setWidgetsModalVisible(true)}
          onOpenTemplates={() => setTemplatesModalVisible(true)}
          onOpenMilestones={() => setMilestonesModalVisible(true)}
          onOpenStacks={() => setStackModalVisible(true)}
        />

        {/* Floating View Switcher Dock matching Image 5 */}
        <FloatingDock
          viewMode={viewMode}
          onChangeViewMode={(m) => habitStore.setViewMode(m)}
          theme={theme}
        />

        {/* Modal: Habit Create / Edit matching Images 2 & 3 */}
        <HabitModal
          visible={habitModalVisible}
          habitToEdit={habitToEdit}
          theme={theme}
          onClose={() => setHabitModalVisible(false)}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
        />

        {/* Modal: Habit Detail & Month Strip & Calendar & Notes matching Image 4 */}
        <HabitDetailModal
          visible={!!selectedHabitForDetail}
          habit={selectedHabitForDetail}
          logs={logs}
          theme={theme}
          onClose={() => setSelectedHabitForDetail(null)}
          onToggleDate={handleTogglePastDate}
          onEditHabit={handleOpenEditModal}
          onDeleteHabit={handleDeleteHabit}
          onArchiveHabit={(id) => habitStore.archiveHabit(id)}
          onSaveNote={handleSaveNote}
          onShareHabit={(habit) => {
            setHabitToShare(habit);
            setShareModalVisible(true);
          }}
        />

        {/* Modal: Settings matching Image 1 */}
        <Modal visible={settingsModalVisible} animationType="slide" onRequestClose={() => setSettingsModalVisible(false)}>
          <SettingsScreen
            habits={habits}
            logs={logs}
            theme={theme}
            themeMode={themeMode}
            settings={settings}
            language={language}
            onClose={() => setSettingsModalVisible(false)}
            onToggleTheme={() => habitStore.toggleTheme()}
            onUpdateSettings={(partial) => habitStore.updateSettings(partial)}
            onArchiveHabit={(id) => habitStore.archiveHabit(id)}
            onUnarchiveHabit={(id) => habitStore.unarchiveHabit(id)}
            onSortHabits={(order) => habitStore.sortHabits(order)}
            onDeleteHabit={handleDeleteHabit}
            onImportData={(data, mode) => habitStore.importData(data, mode)}
            onResetDefaults={() => habitStore.resetToDefaults()}
            onClearAll={() => habitStore.clearAll()}
          />
        </Modal>

        {/* Modal: Deep Analytics */}
        <Modal visible={analyticsModalVisible} animationType="slide" onRequestClose={() => setAnalyticsModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            <ModalHeader
              title={t('analytics', language)}
              theme={theme}
              isRTL={rtl}
              onClose={() => setAnalyticsModalVisible(false)}
              showDragHandle={true}
            />
            <AnalyticsScreen
              habits={habits}
              logs={logs}
              theme={theme}
              onSelectHabit={(h) => {
                setAnalyticsModalVisible(false);
                setSelectedHabitForDetail(h);
              }}
              onOpenStudies={() => {
                setAnalyticsModalVisible(false);
                setStudiesModalVisible(true);
              }}
            />
          </View>
        </Modal>

        {/* Modal: Habit Templates Catalog */}
        <HabitTemplatesModal
          visible={templatesModalVisible}
          theme={theme}
          language={language}
          onClose={() => setTemplatesModalVisible(false)}
          onAddFromTemplate={(template) => {
            handleAddFromTemplate(template);
            setTemplatesModalVisible(false);
          }}
        />

        {/* Modal: Widgets & Reminders Hub */}
        <WidgetsHubModal
          visible={widgetsModalVisible}
          habits={habits}
          logs={logs}
          theme={theme}
          language={language}
          onClose={() => setWidgetsModalVisible(false)}
          onToggleToday={handleToggleToday}
        />

        {/* Modal: Milestones & Badges Hub */}
        <MilestonesModal
          visible={milestonesModalVisible}
          habits={habits}
          logs={logs}
          theme={theme}
          language={language}
          onClose={() => setMilestonesModalVisible(false)}
        />

        {/* Modal: Habit Studies & Behavioral Psychology */}
        <HabitStudiesModal
          visible={studiesModalVisible}
          theme={theme}
          language={language}
          onClose={() => setStudiesModalVisible(false)}
        />

        {/* Modal: Habit Stacking Builder */}
        <HabitStackModal
          visible={stackModalVisible}
          habits={habits}
          logs={logs}
          stacks={stacks || []}
          theme={theme}
          language={language}
          onClose={() => setStackModalVisible(false)}
          onCreateStack={(stackData) => habitStore.addHabitStack(stackData)}
          onDeleteStack={(stackId) => habitStore.deleteHabitStack(stackId)}
          onToggleHabit={handleToggleToday}
        />

        {/* Modal: Shareable Trophy Habit Card */}
        <ShareHabitCardModal
          visible={shareModalVisible}
          habit={habitToShare}
          logs={logs}
          theme={theme}
          language={language}
          onClose={() => {
            setShareModalVisible(false);
            setHabitToShare(null);
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#383B46',
  },
  closeBtnBox: {
    width: 36,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
