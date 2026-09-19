import React, { useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, SubTaskLogs, HabitSubTask } from '../../types/habit';
import { ThemeColors } from '../../constants/theme';
import { ModalHeader } from '../../components/ModalHeader';
import { AmbientBackground } from '../../components/common/AmbientBackground';
import { isRTL, AppLanguage } from '../../utils/i18n';
import { hapticService } from '../../services/hapticService';
import { FULL_SCREEN_SAFE_TOP } from '../../constants/layout';
import { TaskTimerModal, ActiveTimerSession } from '../../components/TaskTimerModal';
import { ConfirmReplaceTimerModal } from '../../components/common/ConfirmReplaceTimerModal';
import { timerBackgroundService } from '../../services/timerBackgroundService';
import { useRoadmap } from './hooks/useRoadmap';
import { QuestTrailView } from './components/QuestTrailView';
import { KanbanBoardView } from './components/KanbanBoardView';
import { DetailedTimelineView } from './components/DetailedTimelineView';
import { roadmapStyles as styles } from './styles/roadmapStyles';

export type RoadmapViewMode = 'quest_trail' | 'kanban_board' | 'detailed_timeline';

export interface RoadmapModalProps {
  visible: boolean;
  habits: Habit[];
  logs: HabitLogs;
  subTaskLogs: SubTaskLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  initialTimerSession?: ActiveTimerSession | null;
  onClose: () => void;
  onToggleSubTask: (habitId: string, subTaskId: string, dateStr: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onAddSubTask?: (habitId: string, subTask: Omit<HabitSubTask, 'id'>) => void;
  onEditHabit?: (habit: Habit) => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  visible,
  habits,
  logs,
  subTaskLogs,
  theme,
  language = 'ar',
  initialTimerSession,
  onClose,
  onToggleSubTask,
  onToggleHabitDay,
  onAddSubTask,
}) => {
  const rtl = isRTL(language);
  const [viewMode, setViewMode] = useState<RoadmapViewMode>('quest_trail');
  const [addingSubTaskHabitId, setAddingSubTaskHabitId] = useState<string | null>(null);
  const [activeTimerSession, setActiveTimerSession] = useState<ActiveTimerSession | null>(null);
  const [pendingTimerSession, setPendingTimerSession] = useState<ActiveTimerSession | null>(null);

  React.useEffect(() => {
    if (initialTimerSession) {
      setActiveTimerSession(initialTimerSession);
    }
  }, [initialTimerSession]);

  const handleStartTimerRequest = (requestedSession: ActiveTimerSession) => {
    const currentBgSession = timerBackgroundService.getSession();
    
    // Check if clicking the EXACT SAME subtask/task that is already running
    if (
      currentBgSession &&
      currentBgSession.isRunning &&
      currentBgSession.habitId === requestedSession.habitId &&
      currentBgSession.subTaskId === requestedSession.subTaskId
    ) {
      // Re-open active timer dialog directly without asking to cancel!
      setActiveTimerSession(requestedSession);
      return;
    }

    // If a DIFFERENT timer is running, show custom confirmation dialog
    if (currentBgSession && currentBgSession.isRunning) {
      setPendingTimerSession(requestedSession);
      return;
    }

    // Otherwise, start requested timer directly
    setActiveTimerSession(requestedSession);
  };

  const handleConfirmReplaceTimer = async () => {
    if (pendingTimerSession) {
      const currentBgSession = timerBackgroundService.getSession();
      if (currentBgSession) {
        const remaining = Math.max(0, Math.round((currentBgSession.targetEndTime - Date.now()) / 1000));
        await timerBackgroundService.pauseSession(remaining);
        await timerBackgroundService.clearSession();
      }
      setActiveTimerSession(pendingTimerSession);
      setPendingTimerSession(null);
    }
  };

  const { todayStr, activeHabits, days, todayStats } = useRoadmap(
    habits,
    logs,
    subTaskLogs,
    language
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: FULL_SCREEN_SAFE_TOP }]}>
        <AmbientBackground theme={theme} isDark={theme.text === '#FFFFFF'} />

        {/* Header with correct RTL alignment: Close button on left, title on right */}
        <ModalHeader
          title={language === 'ar' ? 'خريطة الالتزامات اليومية' : 'Commitment Roadmap'}
          subtitle={language === 'ar' ? 'رحلة المسار اليومي لمهامك وعاداتك' : 'Daily track for your habits & tasks'}
          icon="trail-sign"
          iconColor="#FF6565"
          theme={theme}
          isRTL={rtl}
          onClose={onClose}
          showDragHandle={true}
        />

        {/* View Mode Switcher - Single Icon per button (NO double icons / redundant emojis) */}
        <View style={[styles.viewModeSwitcherBar, { borderColor: theme.border }]}>
          <View style={[styles.viewModePillsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hapticService.medium();
                setViewMode('quest_trail');
              }}
              style={[
                styles.modeTabBtn,
                viewMode === 'quest_trail'
                  ? { backgroundColor: '#FF6565', borderColor: '#FF6565' }
                  : { backgroundColor: theme.glassSurface || theme.background, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="trail-sign-outline"
                size={15}
                color={viewMode === 'quest_trail' ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  { color: viewMode === 'quest_trail' ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {language === 'ar' ? 'مسار الرحلة' : 'Quest Trail'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hapticService.medium();
                setViewMode('kanban_board');
              }}
              style={[
                styles.modeTabBtn,
                viewMode === 'kanban_board'
                  ? { backgroundColor: '#FF6565', borderColor: '#FF6565' }
                  : { backgroundColor: theme.glassSurface || theme.background, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="albums-outline"
                size={15}
                color={viewMode === 'kanban_board' ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  { color: viewMode === 'kanban_board' ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {language === 'ar' ? 'لوحة الأيام' : 'Day Board'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hapticService.medium();
                setViewMode('detailed_timeline');
              }}
              style={[
                styles.modeTabBtn,
                viewMode === 'detailed_timeline'
                  ? { backgroundColor: '#FF6565', borderColor: '#FF6565' }
                  : { backgroundColor: theme.glassSurface || theme.background, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="list-outline"
                size={15}
                color={viewMode === 'detailed_timeline' ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  { color: viewMode === 'detailed_timeline' ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {language === 'ar' ? 'جدول تفصيلي' : 'Timeline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Progress & KPI Bar for Today */}
        <View style={[styles.topSummaryBar, { borderColor: theme.border }]}>
          <View
            style={[
              styles.todayKpiCard,
              {
                backgroundColor: theme.glassSurface || theme.surface,
                borderColor: theme.glassBorder || theme.border,
              },
            ]}
          >
            <View style={[styles.kpiRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <View>
                <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="flag-outline" size={15} color="#FF6565" />
                  <Text style={[styles.kpiTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                    {language === 'ar' ? 'محطة اليوم' : "Today's Station"}
                  </Text>
                </View>
                <Text style={[styles.kpiSubtitle, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  {todayStats.done} من أصل {todayStats.total} التزام منجز اليوم
                </Text>
              </View>
              <View style={styles.kpiPercentBadge}>
                <Text style={styles.kpiPercentText}>{todayStats.percent}%</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarTrack, { backgroundColor: theme.surface }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${todayStats.percent}%`,
                    backgroundColor: todayStats.percent === 100 ? '#2ED573' : '#FF6565',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Views Breakdown */}
        {viewMode === 'quest_trail' && (
          <QuestTrailView
            days={days}
            activeHabits={activeHabits}
            logs={logs}
            subTaskLogs={subTaskLogs}
            theme={theme}
            language={language}
            rtl={rtl}
            todayStr={todayStr}
            addingSubTaskHabitId={addingSubTaskHabitId}
            onSetAddingSubTaskHabitId={setAddingSubTaskHabitId}
            onToggleSubTask={onToggleSubTask}
            onToggleHabitDay={onToggleHabitDay}
            onAddSubTask={onAddSubTask}
            onStartTimer={handleStartTimerRequest}
          />
        )}

        {viewMode === 'kanban_board' && (
          <KanbanBoardView
            activeHabits={activeHabits}
            logs={logs}
            subTaskLogs={subTaskLogs}
            theme={theme}
            language={language}
            rtl={rtl}
            todayStr={todayStr}
            onToggleSubTask={onToggleSubTask}
            onToggleHabitDay={onToggleHabitDay}
            onStartTimer={handleStartTimerRequest}
          />
        )}

        {viewMode === 'detailed_timeline' && (
          <DetailedTimelineView
            days={days}
            activeHabits={activeHabits}
            logs={logs}
            subTaskLogs={subTaskLogs}
            theme={theme}
            language={language}
            rtl={rtl}
            todayStr={todayStr}
            addingSubTaskHabitId={addingSubTaskHabitId}
            onSetAddingSubTaskHabitId={setAddingSubTaskHabitId}
            onToggleSubTask={onToggleSubTask}
            onToggleHabitDay={onToggleHabitDay}
            onAddSubTask={onAddSubTask}
            onStartTimer={handleStartTimerRequest}
          />
        )}

        {/* Task Countdown Timer Modal */}
        <TaskTimerModal
          key={activeTimerSession ? `${activeTimerSession.habitId}-${activeTimerSession.subTaskId || 'main'}-${activeTimerSession.dateStr}-${(activeTimerSession as any).timestamp || Date.now()}` : 'timer-closed'}
          visible={!!activeTimerSession}
          session={activeTimerSession}
          theme={theme}
          language={language}
          onClose={() => setActiveTimerSession(null)}
          onComplete={(session) => {
            if (session.isSubTask && session.subTaskId) {
              onToggleSubTask(session.habitId, session.subTaskId, session.dateStr);
            } else {
              onToggleHabitDay(session.habitId, session.dateStr);
            }
            setActiveTimerSession(null);
          }}
        />

        {/* Custom Frosted Glass Confirmation Modal for Replace Timer */}
        <ConfirmReplaceTimerModal
          visible={!!pendingTimerSession}
          theme={theme}
          runningTitle={timerBackgroundService.getSession()?.title || 'مؤقت نشط'}
          newTitle={pendingTimerSession?.title || 'المهمة الجديدة'}
          onConfirm={handleConfirmReplaceTimer}
          onCancel={() => setPendingTimerSession(null)}
        />
      </View>
    </Modal>
  );
};
