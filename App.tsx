import React, { useEffect, useState, useRef } from 'react';
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
import { Habit, HabitType, HabitCategory, TimeOfDay, HabitGoal, HabitMode, TrackingType, HabitFrequency, DayOfWeek } from './src/types/habit';
import { FloatingDock } from './src/components/FloatingDock';
import { FloatingActiveTimerPill } from './src/components/FloatingActiveTimerPill';
import { HabitsScreen } from './src/screens/HabitsScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HabitModal } from './src/components/HabitModal';
import { HabitDetailModal } from './src/components/HabitDetailModal';
import { TimerModal } from './src/components/TimerModal';
import { HabitTemplatesModal, HabitTemplate } from './src/components/HabitTemplatesModal';
import { WidgetsHubModal } from './src/components/WidgetsHubModal';
import { MilestonesModal } from './src/components/MilestonesModal';
import { HabitStudiesModal } from './src/components/HabitStudiesModal';
import { HabitStackModal } from './src/components/HabitStackModal';
import { ShareHabitCardModal } from './src/components/ShareHabitCardModal';
import { RoadmapModal } from './src/components/RoadmapModal';
import { ReorderHabitsModal } from './src/components/ReorderHabitsModal';
import { WeeklyReviewModal } from './src/components/WeeklyReviewModal';
import { ModalHeader } from './src/components/ModalHeader';
import { AmbientBackground } from './src/components/common/AmbientBackground';
import { t, isRTL, AppLanguage } from './src/utils/i18n';
import { FULL_SCREEN_SAFE_TOP } from './src/constants/layout';
import { soundService } from './src/services/soundService';
import { hapticService } from './src/services/hapticService';
import { timerBackgroundService } from './src/services/timerBackgroundService';
import { NotificationService } from './src/services/notificationService';
import * as SplashScreen from 'expo-splash-screen';

// Keep native splash screen visible until store loads
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const { habits, logs, subTaskLogs, stacks, themeMode, viewMode, settings, isLoaded } = useHabitStore();
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

  const [roadmapModalVisible, setRoadmapModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [templatesModalVisible, setTemplatesModalVisible] = useState(false);
  const [widgetsModalVisible, setWidgetsModalVisible] = useState(false);
  const [milestonesModalVisible, setMilestonesModalVisible] = useState(false);
  const [studiesModalVisible, setStudiesModalVisible] = useState(false);
  const [stackModalVisible, setStackModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [habitToShare, setHabitToShare] = useState<Habit | null>(null);
  const [activeTimerHabit, setActiveTimerHabit] = useState<Habit | null>(null);
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  const [weeklyReviewVisible, setWeeklyReviewVisible] = useState(false);



  useEffect(() => {
    habitStore.init();
    timerBackgroundService.init().catch(() => {});
    NotificationService.rescheduleInactivityReminder().catch(() => {});
    soundService.initNative().catch(() => {});

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

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
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
    frequency?: HabitFrequency;
    customDays?: DayOfWeek[];
    goal?: HabitGoal;
    reminderEnabled?: boolean;
    reminderTime?: string;
    customReminderText?: string;
    subTasks?: import('./src/types/habit').HabitSubTask[];
  }) => {
    if (habitToEdit) {
      const updated: Habit = {
        ...habitToEdit,
        ...habitData,
        frequency: habitData.frequency || habitToEdit.frequency || 'daily',
        customDays: habitData.customDays !== undefined ? habitData.customDays : habitToEdit.customDays,
      };
      habitStore.updateHabit(updated);
      if (selectedHabitForDetail?.id === habitToEdit.id) {
        setSelectedHabitForDetail(updated);
      }
    } else {
      habitStore.addHabit({
        ...habitData,
        frequency: habitData.frequency || 'daily',
        customDays: habitData.customDays,
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
    soundService.playComplete();
    hapticService.success();
    habitStore.toggleHabitDay(habitId);
  };

  const handleTogglePastDate = (habitId: string, dateStr: string) => {
    soundService.playComplete();
    hapticService.light();
    habitStore.toggleHabitDay(habitId, dateStr);
  };

  const handleAdjustNumeric = (habitId: string, delta: number) => {
    if (delta > 0) {
      soundService.playTap();
    }
    hapticService.light();
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

  const handleLogCraving = (habitId: string) => {
    soundService.playComplete();
    hapticService.success();
    habitStore.logCravingResisted(habitId);
  };

  const handleLogSlip = (habitId: string, dateStr: string, reason: string) => {
    soundService.playTap();
    hapticService.warning();
    habitStore.logHabitSlip(habitId, dateStr, reason);
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

        {/* Ambient Subtle Geometric Canvas & Halos */}
        <AmbientBackground theme={theme} isDark={themeMode === 'dark'} />

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
              onStartTimer={(habit) => setActiveTimerHabit(habit)}
              onPressHabit={(habit) => setSelectedHabitForDetail(habit)}
              onDeleteHabit={handleDeleteHabit}
              onAddNew={handleOpenAddModal}
              onOpenSettings={() => setSettingsModalVisible(true)}
              onOpenAnalytics={() => setAnalyticsModalVisible(true)}
              onOpenRoadmap={() => setRoadmapModalVisible(true)}
              onOpenWidgets={() => setWidgetsModalVisible(true)}
              onOpenTemplates={() => setTemplatesModalVisible(true)}
              onOpenMilestones={() => setMilestonesModalVisible(true)}
              onOpenStacks={() => setStackModalVisible(true)}
              onOpenStudies={() => setStudiesModalVisible(true)}
              onOpenReorder={() => setReorderModalVisible(true)}
              onReorderHabits={(newHabits) => habitStore.reorderHabits(newHabits)}
              onLogCraving={handleLogCraving}
              onLogSlip={handleLogSlip}
              onOpenWeeklyReview={() => setWeeklyReviewVisible(true)}
            />

            {/* Floating View Switcher Dock matching Image 5 */}
            <FloatingDock
              viewMode={viewMode}
              onChangeViewMode={(m) => habitStore.setViewMode(m)}
              theme={theme}
            />

            {/* Persistent Active Timer Pill */}
            <FloatingActiveTimerPill
              theme={theme}
              onPressPill={(session) => {
                if (session.isSubTask) {
                  setRoadmapModalVisible(true);
                } else {
                  const habit = habits.find((h) => h.id === session.habitId);
                  if (habit) setActiveTimerHabit(habit);
                }
              }}
            />

        {/* Modal: Habit Create / Edit matching Images 2 & 3 */}
        <HabitModal
          visible={habitModalVisible}
          habitToEdit={habitToEdit}
          theme={theme}
          language={language}
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
          language={language}
          onClose={() => setSelectedHabitForDetail(null)}
          onToggleDate={handleTogglePastDate}
          onStartTimer={(habit) => setActiveTimerHabit(habit)}
          onToggleStreakFreeze={(habitId, dateStr) => {
            habitStore.toggleStreakFreeze(habitId, dateStr);
            const updated = habitStore.getSnapshot().habits.find((h) => h.id === habitId);
            if (updated) {
              setSelectedHabitForDetail(updated);
            }
          }}
          onEditHabit={handleOpenEditModal}
          onDeleteHabit={handleDeleteHabit}
          onArchiveHabit={(id) => habitStore.archiveHabit(id)}
          onSaveNote={handleSaveNote}
          onShareHabit={(habit) => {
            setHabitToShare(habit);
            setShareModalVisible(true);
          }}
          onOpenRoadmap={() => setRoadmapModalVisible(true)}
          onTogglePin={(habitId) => {
            habitStore.togglePinHabit(habitId);
            const updated = habitStore.getSnapshot().habits.find((h) => h.id === habitId);
            if (updated) {
              setSelectedHabitForDetail(updated);
            }
          }}
          onDuplicateHabit={(habitId) => {
            const duplicated = habitStore.duplicateHabit(habitId);
            if (duplicated) {
              hapticService.success();
              soundService.playComplete();
            }
          }}
        />

        {/* Modal: Interactive Focus Timer */}
        <TimerModal
          visible={!!activeTimerHabit}
          habit={activeTimerHabit}
          theme={theme}
          language={language}
          onClose={() => setActiveTimerHabit(null)}
          onFinishSession={(habitId, minutes) => {
            habitStore.logTimerSession(habitId, minutes);
            setActiveTimerHabit(null);
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
            onOpenReorder={() => {
              setSettingsModalVisible(false);
              setReorderModalVisible(true);
            }}
            onOpenRoadmap={() => {
              setSettingsModalVisible(false);
              setRoadmapModalVisible(true);
            }}
            onOpenStacks={() => {
              setSettingsModalVisible(false);
              setStackModalVisible(true);
            }}
            onOpenWidgets={() => {
              setSettingsModalVisible(false);
              setWidgetsModalVisible(true);
            }}
            onOpenTemplates={() => {
              setSettingsModalVisible(false);
              setTemplatesModalVisible(true);
            }}
            onOpenMilestones={() => {
              setSettingsModalVisible(false);
              setMilestonesModalVisible(true);
            }}
            onOpenStudies={() => {
              setSettingsModalVisible(false);
              setStudiesModalVisible(true);
            }}
            onOpenWeeklyReview={() => {
              setSettingsModalVisible(false);
              setWeeklyReviewVisible(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onImportData={(data, mode) => habitStore.importData(data, mode)}
            onResetDefaults={() => habitStore.resetToDefaults()}
            onClearAll={() => habitStore.clearAll()}
          />
        </Modal>

        {/* Modal: Deep Analytics */}
        <Modal visible={analyticsModalVisible} animationType="slide" onRequestClose={() => setAnalyticsModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: FULL_SCREEN_SAFE_TOP }}>
            <AmbientBackground theme={theme} isDark={themeMode === 'dark'} />
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
              onOpenWeeklyReview={() => {
                setAnalyticsModalVisible(false);
                setWeeklyReviewVisible(true);
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

        {/* Modal: Roadmap & Habit Commitments Hub */}
        <RoadmapModal
          visible={roadmapModalVisible}
          habits={habits}
          logs={logs}
          subTaskLogs={subTaskLogs}
          theme={theme}
          language={language}
          onClose={() => setRoadmapModalVisible(false)}
          onToggleSubTask={(habitId, subTaskId, dateStr) => habitStore.toggleSubTask(habitId, subTaskId, dateStr)}
          onToggleHabitDay={handleTogglePastDate}
          onAddSubTask={(habitId, subTask) => habitStore.addSubTask(habitId, subTask)}
          onEditHabit={handleOpenEditModal}
        />

        {/* Modal: Reorder Habits via Drag and Drop */}
        <ReorderHabitsModal
          visible={reorderModalVisible}
          habits={habits}
          theme={theme}
          onClose={() => setReorderModalVisible(false)}
          onSaveOrder={(newHabits) => habitStore.reorderHabits(newHabits)}
        />

        {/* Modal: Weekly Performance & Reflection Digest */}
        <WeeklyReviewModal
          visible={weeklyReviewVisible}
          habits={habits}
          logs={logs}
          theme={theme}
          language={language}
          onClose={() => setWeeklyReviewVisible(false)}
          onSelectHabit={(habit) => setSelectedHabitForDetail(habit)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurTargetWrapper: {
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
