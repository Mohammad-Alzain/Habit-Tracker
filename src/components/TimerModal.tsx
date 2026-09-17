import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { ModalHeader } from './ModalHeader';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';

import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

interface TimerModalProps {
  visible: boolean;
  habit: Habit | null;
  theme: ThemeColors;
  onClose: () => void;
  onFinishSession: (habitId: string, minutesCompleted: number) => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  visible,
  habit,
  theme,
  onClose,
  onFinishSession,
}) => {
  if (!habit) return null;

  const targetMinutes = habit.targetValue || 15;
  const initialSeconds = targetMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      setIsRunning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, habit]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
            soundService.playComplete();
            hapticService.success();
            onFinishSession(habit.id, targetMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, habit, targetMinutes]);

  const toggleRun = () => {
    hapticService.light();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    hapticService.light();
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  const handleAddMinutes = (mins: number) => {
    hapticService.light();
    setSecondsLeft((prev) => Math.max(0, prev + mins * 60));
  };

  const handleComplete = () => {
    soundService.playComplete();
    hapticService.success();
    const elapsedSeconds = Math.max(60, initialSeconds - secondsLeft);
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
    onFinishSession(habit.id, elapsedMins);
    onClose();
  };

  const handleLogFullSession = () => {
    soundService.playComplete();
    hapticService.success();
    onFinishSession(habit.id, targetMinutes);
    onClose();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = Math.round(((initialSeconds - secondsLeft) / initialSeconds) * 100);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(5, 8, 14, 0.85)' }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.glassSurface || theme.card,
              borderColor: theme.glassBorder || theme.cardBorder,
              borderTopColor: theme.glassSpecular || theme.cardBorder,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 14,
            },
          ]}
        >
          {/* Header */}
          <ModalHeader
            title="مؤقت التركيز"
            icon="timer-outline"
            iconColor={habit.color}
            theme={theme}
            isRTL={true}
            onClose={onClose}
          />

          {/* Habit Info */}
          <View style={styles.habitBadge}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${habit.color}22`, borderColor: `${habit.color}55` },
              ]}
            >
              <Ionicons
                name={(habit.icon as any) || 'timer-outline'}
                size={22}
                color={habit.color}
              />
            </View>
            <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
          </View>

          {/* Circular Countdown Display */}
          <View style={styles.timerCircleWrapper}>
            <View
              style={[
                styles.timerOuterRing,
                {
                  borderColor: `${habit.color}30`,
                },
              ]}
            >
              <View
                style={[
                  styles.timerInnerCircle,
                  {
                    backgroundColor: theme.surface,
                    borderColor: habit.color,
                  },
                ]}
              >
                <Text style={[styles.timeDigits, { color: theme.text }]}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
                <Text style={[styles.progressText, { color: habit.color }]}>
                  {progressPercent}% مكتمل
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Add Minutes Row */}
          <View style={styles.quickAddRow}>
            <TouchableOpacity
              onPress={() => handleAddMinutes(5)}
              style={[styles.quickAddChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Text style={[styles.quickAddText, { color: theme.text }]}>+5 د</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAddMinutes(10)}
              style={[styles.quickAddChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Text style={[styles.quickAddText, { color: theme.text }]}>+10 د</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogFullSession}
              style={[styles.quickAddChip, { backgroundColor: `${habit.color}20`, borderColor: habit.color }]}
            >
              <Ionicons name="sparkles" size={12} color={habit.color} />
              <Text style={[styles.quickAddText, { color: habit.color }]}>تسجيل {targetMinutes}د كاملة 🎯</Text>
            </TouchableOpacity>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.7}
              style={[styles.smallCtrlBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="refresh" size={20} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleRun}
              activeOpacity={0.85}
              style={[
                styles.mainPlayBtn,
                {
                  backgroundColor: habit.color,
                  shadowColor: habit.color,
                  shadowOpacity: 0.45,
                  shadowRadius: 12,
                },
              ]}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={30}
                color="#FFFFFF"
                style={{ marginLeft: isRunning ? 0 : 3 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleComplete}
              activeOpacity={0.7}
              style={[styles.smallCtrlBtn, { backgroundColor: `${theme.success}20`, borderColor: `${theme.success}50` }]}
            >
              <Ionicons name="checkmark" size={22} color={theme.success} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.hintText, { color: theme.textDim }]}>
            اضغط علامة الصح ✅ لتسجيل الدقائق المنقضية، أو زر التسجيل الكامل لإتمام الهدف فوراً
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: DIALOG_SAFE_TOP,
    paddingBottom: DIALOG_SAFE_BOTTOM,
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  habitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
  },
  timerCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  timerOuterRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInnerCircle: {
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigits: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  smallCtrlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  quickAddRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  quickAddChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickAddText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
