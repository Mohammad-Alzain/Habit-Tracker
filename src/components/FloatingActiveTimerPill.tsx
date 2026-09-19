import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { timerBackgroundService, ActiveBackgroundTimerSession } from '../services/timerBackgroundService';
import { hapticService } from '../services/hapticService';

interface FloatingActiveTimerPillProps {
  theme: ThemeColors;
  onPressPill: (session: ActiveBackgroundTimerSession) => void;
}

export const FloatingActiveTimerPill: React.FC<FloatingActiveTimerPillProps> = ({
  theme,
  onPressPill,
}) => {
  const [activeSession, setActiveSession] = useState<ActiveBackgroundTimerSession | null>(
    () => timerBackgroundService.getSession()
  );
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    // Subscribe to service state changes
    const unsubscribe = timerBackgroundService.subscribe((session) => {
      setActiveSession(session ? { ...session } : null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeSession || !activeSession.isRunning) return;

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.round((activeSession.targetEndTime - Date.now()) / 1000));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setFormattedTime(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

      if (remaining <= 0) {
        timerBackgroundService.checkAndReconcile();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.targetEndTime, activeSession?.isRunning]);

  if (!activeSession || !activeSession.isRunning) return null;

  const isDark = theme.background.startsWith('#0') || theme.background === '#121212';

  return (
    <Animated.View style={styles.floatingContainer} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          hapticService.light();
          onPressPill(activeSession);
        }}
        style={[
          styles.pillCard,
          {
            backgroundColor: isDark ? '#1F2430' : '#FFFFFF',
            borderColor: '#FFA502',
            shadowColor: '#FFA502',
          },
        ]}
      >
        <View style={styles.pulseDot} />
        <Ionicons name="timer-outline" size={16} color="#FFA502" />
        <Text style={[styles.pillTitle, { color: theme.text }]} numberOfLines={1}>
          {activeSession.title}
        </Text>
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 104,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pillCard: {
    direction: 'ltr',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
    maxWidth: '88%',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA502',
  },
  pillTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    maxWidth: 140,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 165, 2, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timeText: {
    color: '#FFA502',
    fontSize: 12,
    fontWeight: '800',
  },
});
