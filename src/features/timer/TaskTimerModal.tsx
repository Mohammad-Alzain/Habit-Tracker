import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/theme';
import { DialogHeader } from '../../components/ModalHeader';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../../constants/layout';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { AppLanguage, isRTL } from '../../utils/i18n';
import { FrostedDialogModal } from '../../components/common/FrostedDialogModal';
import { LiquidGlassView } from '../../components/common/LiquidGlassView';
import { useCountdownTimer } from './hooks/useCountdownTimer';
import { timerBackgroundService } from '../../services/timerBackgroundService';

export interface ActiveTimerSession {
  habitId: string;
  subTaskId?: string;
  isSubTask: boolean;
  title: string;
  subtitle?: string;
  color: string;
  icon: string;
  durationMinutes: number;
  dateStr: string;
  minutes?: number;
  estimatedMinutes?: number;
  taskTitle?: string;
  habitName?: string;
}

interface TaskTimerModalProps {
  visible: boolean;
  session: ActiveTimerSession | null;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onComplete: (session: ActiveTimerSession) => void;
}

export const TaskTimerModal: React.FC<TaskTimerModalProps> = ({
  visible,
  session,
  theme,
  language = 'ar',
  onClose,
  onComplete,
}) => {
  const rtl = isRTL(language);
  const rawMinutes =
    session?.durationMinutes ??
    session?.minutes ??
    session?.estimatedMinutes;
  const targetMinutes = Math.max(
    1,
    typeof rawMinutes === 'number' && !isNaN(rawMinutes) ? rawMinutes : 15
  );

  const taskTitle = session?.title || session?.taskTitle || '';
  const habitSubtitle = session?.subtitle || session?.habitName || '';
  const headerSubtitle = taskTitle
    ? habitSubtitle
      ? `${taskTitle} • ${habitSubtitle}`
      : taskTitle
    : habitSubtitle;

  const {
    isRunning,
    formattedTime,
    progressPercent,
    toggleRun,
    reset,
    addMinutes,
  } = useCountdownTimer({
    initialMinutes: targetMinutes,
    onStart: (secondsLeft) => {
      if (!session) return;
      timerBackgroundService.startSession({
        habitId: session.habitId,
        subTaskId: session.subTaskId,
        isSubTask: session.isSubTask,
        title: taskTitle || 'مهمة فرعية',
        subtitle: habitSubtitle,
        durationMinutes: targetMinutes,
        secondsRemaining: secondsLeft,
        dateStr: session.dateStr,
      });
    },
    onPause: (secondsLeft) => {
      timerBackgroundService.pauseSession(secondsLeft);
    },
    onReset: () => {
      timerBackgroundService.clearSession();
    },
    onFinished: () => {
      timerBackgroundService.clearSession();
      if (session) {
        onComplete(session);
      }
      onClose();
    },
  });

  const handleInstantComplete = () => {
    timerBackgroundService.clearSession();
    hapticService.success();
    soundService.playComplete();
    if (session) {
      onComplete(session);
    }
    onClose();
  };

  const handleCloseModal = () => {
    // Note: If timer isRunning, it keeps ticking in the background with notifications active!
    onClose();
  };

  if (!session) return null;

  return (
    <FrostedDialogModal
      visible={visible}
      theme={theme}
      onClose={handleCloseModal}
    >
      <LiquidGlassView theme={theme} style={styles.dialogCard}>
          {/* Header with Close button on LEFT in RTL */}
          <DialogHeader
            title={language === 'ar' ? 'جلسة تركيز للمهمة' : 'Focus Session'}
            subtitle={headerSubtitle || undefined}
            theme={theme}
            isRTL={rtl}
            onClose={handleCloseModal}
          />

          {/* Dial Clock Display */}
          <View style={styles.clockCenterSection}>
            <View
              style={[
                styles.dialRing,
                {
                  borderColor: session.color || '#FF6565',
                  backgroundColor: `${session.color || '#FF6565'}15`,
                },
              ]}
            >
              <Text style={[styles.timerNumbers, { color: theme.text }]}>
                {formattedTime}
              </Text>
              <Text style={[styles.timerUnitLabel, { color: theme.textMuted }]}>
                {isRunning
                  ? language === 'ar'
                    ? 'مؤقت نشط...'
                    : 'Timer running...'
                  : language === 'ar'
                  ? 'جاهز للبدء'
                  : 'Ready to start'}
              </Text>
            </View>
          </View>

          {/* Clock Controls */}
          <View style={styles.controlsRow}>
            {/* Play / Pause */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleRun}
              style={[
                styles.playBtn,
                {
                  backgroundColor: isRunning ? '#FFA502' : (session.color || '#FF6565'),
                },
              ]}
            >
              <Ionicons name={isRunning ? 'pause' : 'play'} size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Reset */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={reset}
              style={[styles.smallCtrlBtn, { borderColor: theme.border, backgroundColor: theme.inputBg || theme.surface }]}
            >
              <Ionicons name="refresh" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Instant Complete */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleInstantComplete}
            style={[
              styles.instantDoneBtn,
              {
                backgroundColor: 'rgba(46, 213, 115, 0.15)',
                borderColor: '#2ED573',
              },
            ]}
          >
            <Ionicons name="checkmark-done" size={16} color="#2ED573" />
            <Text style={styles.instantDoneText}>
              {language === 'ar' ? 'إكمال فوري وإغلاق المهمة' : 'Instant Complete & Close'}
            </Text>
          </TouchableOpacity>
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
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  clockCenterSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dialRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerNumbers: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
  },
  timerUnitLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  smallCtrlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCtrlText: {
    fontSize: 12,
    fontWeight: '700',
  },
  instantDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  instantDoneText: {
    color: '#2ED573',
    fontSize: 13,
    fontWeight: '800',
  },
});
